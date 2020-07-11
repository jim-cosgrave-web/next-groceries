import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { myGet } from '../../util/myGet';
import { env } from '../../util/environment';
import Grocery from './Grocery';
import MyTypeahead from '../Shared/MyTypeahead';
import { UPDATE_STORE_GROCERY_API_METHOD, UNCATEGORIZED, SUBSCRIBE_TO_STORE_API_METHOD, UPDATE_STORE_GROCERY_CATEGORY_API_METHOD, LOCAL_STORAGE_STORE_LIST } from '../../util/constants';
import SubscribeToStore from '../Shared/SubscribeToStore';
import { simpleHash } from '../../util/simpleHash';

const getStoreListApiUrl = env.apiUrl + 'list?method=getStoreList';
const getStoresApiUrl = env.apiUrl + 'user?method=getStores';
const postGroceryApiUrl = env.apiUrl + 'list';
const postStoreApiUrl = env.apiUrl + 'store';
const postUserApiUrl = env.apiUrl + 'user';

const StoreGroceryList = (props) => {
    const [storeList, setStoreList] = useState(null);
    const [stores, setStores] = useState(null);
    const [selectedStore, setSelectedStore] = useState(null);
    const [storeDropDown, setStoreDropDown] = useState(null);
    const [categories, setCategories] = useState(null);

    const router = useRouter();

    useEffect(() => {
        async function execute() {
            const state = await getState();

            if(state) {
                setStoreList(state);
            }

            const result = await getStores();

            if (result.success && result.selectedStore) {

                await getListData(props.listId, result.selectedStore.value)
            } else {
                setStoreList({ emptyList: true });
            }
        }

        execute();
    }, []);

    //
    // Update list
    //
    useEffect(() => {
        async function execute() {
            const result = await getStores();

            if (result.success && result.selectedStore) {
                const list = await getListData(props.listId, selectedStore.value);
            } else {
                setStoreList({ emptyList: true });
            }
        }

        if (props.updateTime != -1 && selectedStore) {
            execute();
        }
    }, [props.updateTime]);

    function saveState(state) {
        setStoreList(state);
        localStorage.setItem(LOCAL_STORAGE_STORE_LIST, JSON.stringify(state));
    }

    async function getState() {
        const state = JSON.parse(localStorage.getItem(LOCAL_STORAGE_STORE_LIST));
        return state;
    }

    async function clearState() {
        localStorage.setItem(LOCAL_STORAGE_STORE_LIST, JSON.stringify(null));
    }

    async function getStores() {
        let getStoresResponse = await myGet(getStoresApiUrl, null);

        if (!getStoresResponse || getStoresResponse.length < 1) {
            //
            // Error, not subscribed to a store
            //
            return { success: false, selectedStore: null };
        } else {
            setStores(getStoresResponse.stores);

            const ddl = [];

            getStoresResponse.stores.forEach(s => {
                ddl.push({ name: s.name, value: s.store_id.toString() });
            });

            const lsStore = localStorage.getItem('selected-store');
            let tSelectedStore = null;

            if (lsStore) {
                tSelectedStore = JSON.parse(lsStore);
            } else {
                tSelectedStore = ddl[0];
            }

            setSelectedStore(tSelectedStore);
            setStoreDropDown(ddl);

            return { success: true, selectedStore: tSelectedStore };
        }
    }

    async function getListData(listId, storeId) {
        let getStoreListResponse = await myGet(getStoreListApiUrl + `&listId=${listId}&storeId=${storeId}`, null);
        //console.log(getStoreListResponse);
        //setStoreList(getStoreListResponse);
        saveState(getStoreListResponse);
        setCategories(getStoreListResponse.categories);
    }

    async function handleGroceryCategoryChange(newCategoryName, oldCategoryName, grocery) {
        const clone = { ...storeList };

        //
        // Remove from uncategorized
        //
        const oldCategory = clone.categorizedList.find(c => c.name == oldCategoryName);
        const groceryToMove = oldCategory.groceries.find(g => g.name == grocery.name);
        const index = oldCategory.groceries.indexOf(groceryToMove);
        oldCategory.groceries.splice(index, 1);

        oldCategory.hidden = oldCategory.groceries.length == 0;

        //
        // Add to the new category
        //
        let newCategory = clone.categorizedList.find(c => c.name == newCategoryName);

        if (!newCategory) {
            newCategory = { name: newCategoryName, groceries: [] };

            if (newCategoryName == UNCATEGORIZED) {
                clone.categorizedList.unshift(newCategory);
            } else {
                clone.categorizedList.push(newCategory);
            }
        }

        newCategory.hidden = false;
        newCategory.groceries.push(groceryToMove);

        //setStoreList(clone);
        saveState(clone);

        const body = {
            method: UPDATE_STORE_GROCERY_CATEGORY_API_METHOD,
            store: selectedStore.value,
            category: newCategoryName,
            groceryName: groceryToMove.name
        };

        //console.log(body);

        const resp = await fetch(postStoreApiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const json = await resp.json();
    }

    //
    // Handle user subscribing to a store.  This should only happen
    // if the user has no store subscriptions and then subscribes to their first store.
    //
    async function handleStoreSubscribe(store) {
        let storeDropdownClone = storeDropDown.slice();

        if (!storeDropdownClone) {
            storeDropdownClone = [];
        }

        const newStore = { name: store.name, value: store.store_id.toString() }

        storeDropdownClone.push(newStore);

        setStores([store]);
        setStoreDropDown(storeDropdownClone);
        setSelectedStore(newStore);

        const list = await getListData(props.listId, store.store_id.toString());
    }

    async function handleAddGrocery(value) {
        //let value = groceryInputRef.current.value;
        value = value.trim();

        const clone = { ...storeList };
        let grocery = null;

        for (let i = 0; i < storeList.categorizedList.length; i++) {
            const category = storeList.categorizedList[i];
            grocery = category.groceries.find(g => g.name.toLowerCase() == value.toLowerCase());

            if (grocery) {
                break;
            }
        }

        if (!grocery) {
            const body = {
                "list_id": props.listId,
                "grocery": {
                    "name": value
                }
            };

            let key = `${value}_checked_note`;
            let hashKey = simpleHash(key);

            //clone.groceries.push({ name: value, checked: false, note: '', hash: hashKey });

            const resp = await fetch(postGroceryApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            const response = await resp.json();
            getListData(props.listId, selectedStore.value);
        }
    }

    //
    // Handle the event when the store dropdown changes
    //
    async function handleStoreChange(event) {
        const store = storeDropDown.find(s => s.value == event.target.value);
        setSelectedStore(store);
        localStorage.setItem('selected-store', JSON.stringify(store));

        await getListData(props.listId, event.target.value);
    }

    function handleGroceryUpdate(grocery) {
        const groceryName = grocery.name;
        const clone = { ...storeList };

        for(let i = 0; i < clone.categorizedList.length; i++) {
            const category = clone.categorizedList[i];

            for(let j = 0; j < category.groceries.length; j++) {
                const g = category.groceries[j];

                if (g.name == groceryName) {
                    category.groceries[j].checked = grocery.checked;
                    category.groceries[j].note = grocery.note;

                    let key = `${grocery.name}_${grocery.checked}_${grocery.note}`;
                    let hashKey = simpleHash(key);
                    category.groceries[j].hash = hashKey;
                }
            }
        }

        if(typeof(props.onGroceryUpdate) === 'function') {
            props.onGroceryUpdate(grocery);
        }

        saveState(clone);
    }

    function handleGroceryCheck(grocery) {
        console.log('StoreGroceryList...', grocery);
    }

    function getListHTML() {
        if (!storeList) {
            return <div className="mt-10">Loading...</div>;
        }

        if (stores && stores.length == 0) {
            return <SubscribeToStore onSubscribe={handleStoreSubscribe}></SubscribeToStore>
        }

        if (storeList.emptyList) {
            return <div>Add some groceries!</div>
        }

        const visibleCategories = storeList.categorizedList.find(c => c.hidden == false);
        
        if(!visibleCategories || visibleCategories.length === 0) {
            return (
                <div className="alert warning mb-10 mt-10">
                    <b>Nothing on your list</b>
                    <div className="mt-20">
                        Add some groceries to get shopping
                    </div>
                </div>
            );
        }

        let html = '';

        html = storeList.categorizedList.map((c, cIndex) => {
            return (
                !c.hidden && c.groceries.length > 0 && <div key={c.name}>
                    <div className="list-category mt-10">
                        <div className="list-category-name">
                            {c.name}
                        </div>
                    </div>
                    <div>
                        {c.groceries && c.groceries.map((g, gIndex) => {
                            return (
                                <Grocery
                                    grocery={g}
                                    list_id={props.listId}
                                    enableCategory={true}
                                    categoryName={c.name}
                                    categories={categories}
                                    onUpdate={handleGroceryUpdate}
                                    onCategorySet={handleGroceryCategoryChange}
                                    key={g.hash}>
                                </Grocery>
                            );
                        })}
                    </div>
                </div>
            );
        });

        return html;
    }

    return (
        <div className="mt-10">
            <div className="mt-10 mb-10">
                <MyTypeahead placeholder="Add a grocery" type="groceries" onAdd={handleAddGrocery}></MyTypeahead>
            </div>
            {storeDropDown && storeDropDown.length > 0 && <div className="mt-10">
                <select className="select-css" onChange={handleStoreChange} defaultValue={selectedStore ? selectedStore.value : null}>
                    {storeDropDown.map((s, index) => {
                        return (<option key={index} value={s.value}>
                            {s.name}
                        </option>);
                    })}
                </select>
            </div>}
            {(!storeDropDown || storeDropDown.length == 0) && <div className="placeholder mt-10"></div>}
            <div className="grocery-list">
                <div className="list">
                    {getListHTML()}
                </div>
            </div>
        </div>
    );
};

export default StoreGroceryList;