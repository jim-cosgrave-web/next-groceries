import React, { useEffect, useState } from 'react';
import { env } from '../../../util/environment';
import { useRouter } from 'next/router';
import { myGet } from '../../../util/myGet';
import { DragDropContext } from 'react-beautiful-dnd';
import AdminCategory from '../../../components/Admin/AdminCategory';

const storeApiUrl = env.apiUrl + 'store';
const storeDetailApiUrl = env.apiUrl + 'store?method=getStoreDetails';

const AdminStoreByIdPage = () => {
    const [store, setStore] = useState(null);
    const router = useRouter();

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

    function handleDragEnd(result) {
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

        newStore.categories[categoryIndex] = newCategory;
        setStore(newStore);
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