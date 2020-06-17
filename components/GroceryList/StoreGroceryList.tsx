import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { myGet } from '../../util/myGet';
import { env } from '../../util/environment';
import Grocery from './Grocery';
import MyTypeahead from '../Shared/MyTypeahead';
import { UPDATE_STORE_GROCERY_API_METHOD, UNCATEGORIZED, SUBSCRIBE_TO_STORE_API_METHOD } from '../../util/constants';
import SubscribeToStore from '../Shared/SubscribeToStore';

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
            const result = await getStores();

            if (result.success && result.selectedStore) {
                const list = await getListData(props.listId, result.selectedStore.value)
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

            const tempSelectedStore = ddl[0];

            setStoreDropDown(ddl);
            setSelectedStore(tempSelectedStore);

            return { success: true, selectedStore: tempSelectedStore };
        }
    }

    async function getListData(listId, storeId) {
        let getStoreListResponse = await myGet(getStoreListApiUrl + `&listId=${listId}&storeId=${storeId}`, null);
        //console.log(getStoreListResponse);
        setStoreList(getStoreListResponse);
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

        setStoreList(clone);

        const body = {
            method: UPDATE_STORE_GROCERY_API_METHOD,
            store: selectedStore.value,
            category: newCategoryName,
            groceryName: groceryToMove.name
        };

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
        console.log('handleStoreSubscribe', store);

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

        await getListData(props.listId, event.target.value);
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
                                    onCategorySet={handleGroceryCategoryChange}
                                    key={g.name + '_' + g.checked}>
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
            {stores && stores.length > 0 && <div className="mt-10 mb-10">
                <MyTypeahead placeholder="Add a grocery" type="groceries" onAdd={handleAddGrocery}></MyTypeahead>
            </div>}
            {storeDropDown && storeDropDown.length > 0 && <div className="mt-10">
                <select className="select-css" onChange={handleStoreChange} defaultValue={storeDropDown[0].value}>
                    {storeDropDown.map((s, index) => {
                        return (<option key={index} value={s.value}>
                            {s.name}
                        </option>);
                    })}
                </select>
            </div>}
            <div className="grocery-list">
                <div className="list">
                    {getListHTML()}
                </div>
            </div>
        </div>
    );
};

export default StoreGroceryList;