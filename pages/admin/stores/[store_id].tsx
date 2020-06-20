import React, { useEffect, useState, useRef } from 'react';
import { env } from '../../../util/environment';
import { useRouter } from 'next/router';
import { myGet } from '../../../util/myGet';
import { DragDropContext } from 'react-beautiful-dnd';
import AdminCategory from '../../../components/Admin/AdminCategory';
import { UPDATE_STORE_GROCERY_API_METHOD, REORGANIZE_STORE_GROCERIES_API_METHOD } from '../../../util/constants';

const storeApiUrl = env.apiUrl + 'store';
const storeDetailApiUrl = env.apiUrl + 'store?method=getStoreDetails';

const AdminStoreByIdPage = () => {
    const [store, setStore] = useState(null);
    const router = useRouter();
    let reorganizeTimeout = useRef(null);

    useEffect(() => {
        const store_id = router.query.store_id;

        let isCancelled = false;

        async function execute() {
            const storeResp = await myGet(storeDetailApiUrl + '&store_id=' + store_id, null);

            if (isCancelled == false) {
                setStore(storeResp.store);
            }
        }

        if (store_id) {
            execute();
        }

        return () => {
            isCancelled = true;
        };
    }, [router.query.store_id]);

    async function handleDragEnd(result) {
        //console.log('handleDragEnd', result);
        const { destination, source, draggableId } = result;

        //
        // If no destination, dont do anything
        //
        if(!destination) {
            return;
        }

        //
        // If the destination did not change, dont do anything
        //
        if(destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        const newStore = { ...store };
        const category = newStore.categories.find(c => c.name === source.droppableId);
        const categoryIndex = newStore.categories.indexOf(category);
        const newCategory = { ...category };
        const grocery = newCategory.groceries[source.index];

        newCategory.groceries.splice(source.index, 1);
        newCategory.groceries.splice(destination.index, 0, grocery);

        for(let i = 0; i < newCategory.groceries.length; i++) {
            newCategory.groceries[i].order = i + 1;
        }

        newStore.categories[categoryIndex] = newCategory;
        setStore(newStore);

        if(reorganizeTimeout.current) { 
            console.log('yuppp');
        }

        reorganizeTimeout.current = {};

        const body = { 
            method: REORGANIZE_STORE_GROCERIES_API_METHOD, 
            store_id: store._id.toString(), 
            updatedCategory: newCategory 
        };

        const resp = await fetch(storeApiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const json = await resp.json();
    }

    function getJSX() {
        if (!store) {
            return <div>Loading...</div>
        }

        let jsx = <DragDropContext onDragEnd={handleDragEnd}>
            {store.categories.map((c, index) => {
                return <AdminCategory key={c.name} category={c}></AdminCategory>;
            })}
        </DragDropContext>

        return jsx;
    }

    return (
        <div>
            <h1>Admin Stores Page With ID</h1>
            <div className="flex align-top">
                {getJSX()}
            </div>
        </div>
    );
}

export default AdminStoreByIdPage;