import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { myGet } from '../../util/myGet';
import { env } from '../../util/environment';
import Grocery from './Grocery';
import MyTypeahead from '../Shared/MyTypeahead';

const apiUrl = env.apiUrl + 'groceries/list';
const getStoresApiUrl = env.apiUrl + 'user?method=getStores';

const StoreGroceryList = (props) => {
    const [storeList, setStoreList] = useState(null);
    const [stores, setStores] = useState(null);
    const [selectedStore, setSelectedStore] = useState(null);
    const [storeDropDown, setStoreDropDown] = useState(null);
    const router = useRouter();

    useEffect(() => {
        async function execute() {
            const result = await getStores();

            if (result.success) {
                const list = await getListData(props.listId, result.selectedStore.value)
            }
        }

        execute();
    }, []);

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
                ddl.push({ name: s.name + ' (' + s.city + ')', value: s.store_id.toString() });
            });

            const tempSelectedStore = ddl[0];

            setStoreDropDown(ddl);
            setSelectedStore(tempSelectedStore);

            return { success: true, selectedStore: tempSelectedStore };
        }
    }

    async function getListData(listId, storeId) {
        let getStoreListResponse = await myGet(env.apiUrl + `list/${listId}/${storeId}`, null);
        setStoreList(getStoreListResponse);
    }

    function getListHTML() {
        if (!storeList) {
            return <div>Loading...</div>;
        }

        let html = '';

        html = storeList.categorizedList.map((c, cIndex) => {
            return (
                !c.hidden && c.groceries.length > 0 && <div key={c.name}>
                    <div className="list-category mt-20">
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

    async function handleAddGrocery(value) {
    }

    return (
        <div className="mt-10">
            <div className="mt-10 mb-10">
                <MyTypeahead placeholder="Add a grocery" type="groceries" onAdd={handleAddGrocery}></MyTypeahead>
            </div>
            <div className="grocery-list">
                <div className="list">
                    {getListHTML()}
                </div>
            </div>
        </div>
    );
};

export default StoreGroceryList;