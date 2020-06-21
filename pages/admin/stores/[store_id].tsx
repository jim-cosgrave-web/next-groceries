import React, { useEffect, useState, useRef } from 'react';
import { env } from '../../../util/environment';
import { useRouter } from 'next/router';
import { myGet } from '../../../util/myGet';
import { DragDropContext } from 'react-beautiful-dnd';
import AdminCategory from '../../../components/Admin/AdminCategory';
import { UPDATE_STORE_GROCERY_API_METHOD, REORGANIZE_STORE_GROCERIES_API_METHOD, UNCATEGORIZED, DELETE_STORE_CATEGORY_API_METHOD, DELETE_STORE_GROCERY_API_METHOD } from '../../../util/constants';

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
        if (!destination) {
            return;
        }

        //
        // If the destination did not change, dont do anything
        //
        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        const newStore = { ...store };
        const category = newStore.categories.find(c => c.name === source.droppableId);
        const categoryIndex = newStore.categories.indexOf(category);
        const newCategory = { ...category };
        const grocery = newCategory.groceries[source.index];

        newCategory.groceries.splice(source.index, 1);
        newCategory.groceries.splice(destination.index, 0, grocery);

        for (let i = 0; i < newCategory.groceries.length; i++) {
            newCategory.groceries[i].order = i + 1;
        }

        newStore.categories[categoryIndex] = newCategory;
        setStore(newStore);

        if (reorganizeTimeout.current) {
            clearTimeout(reorganizeTimeout.current);
        }

        reorganizeTimeout.current = setTimeout(async () => {
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
        }, 200);
    }

    //
    // Handle case when a grocery has moved between categories
    //
    async function handleCategorySet(grocery, oldCategoryName, newCategoryName) {
        const clone = { ...store };

        //
        // Remove from uncategorized
        //
        const oldCategory = clone.categories.find(c => c.name == oldCategoryName);
        const groceryToMove = oldCategory.groceries.find(g => g.groceryName == grocery.groceryName);
        const index = oldCategory.groceries.indexOf(groceryToMove);
        oldCategory.groceries.splice(index, 1);

        oldCategory.hidden = oldCategory.groceries.length == 0;

        //
        // Add to the new category
        //
        let newCategory = clone.categories.find(c => c.name == newCategoryName);

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

        setStore(clone);

        const body = {
            method: UPDATE_STORE_GROCERY_API_METHOD,
            store: store._id.toString(),
            category: newCategoryName,
            groceryName: groceryToMove.groceryName
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

    //
    // Handle the case where a category is deleted
    //
    async function handleCategoryDelete(category) {
        const clone = { ...store };
        const categoryIndex = clone.categories.map(c => { return c.name }).indexOf(category.name);

        if (categoryIndex > -1) {
            clone.categories.splice(categoryIndex, 1);

            setStore(clone);

            const body = {
                method: DELETE_STORE_CATEGORY_API_METHOD,
                storeId: store._id.toString(),
                categoryName: category.name
            };
    
            const resp = await fetch(storeApiUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
    
            const json = await resp.json();
        }
    }

    function handleGroceryAdd(categoryName, grocery) {
        const clone = {...store};
        const categoryIndex = clone.categories.map(c => { return c.name }).indexOf(categoryName);
        const category = clone.categories[categoryIndex];

        category.groceries.push(grocery);
        setStore(clone);
    }

    //
    // Handle grocery deleted
    //
    async function handleGroceryDelete(categoryName, grocery) {
        const clone = {...store};
        
        const categoryIndex = clone.categories.map(c => { return c.name }).indexOf(categoryName);
        const category = clone.categories[categoryIndex];
        const groceryIndex = category.groceries.map(g => { return g.groceryName }).indexOf(grocery.groceryName);
        category.groceries.splice(groceryIndex, 1);

        setStore(clone);

        const body = {
            method: DELETE_STORE_GROCERY_API_METHOD,
            storeId: store._id.toString(),
            categoryName: categoryName,
            groceryName: grocery.groceryName
        };

        const resp = await fetch(storeApiUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const json = await resp.json();
    }

    //
    // Generate the page JSX
    //
    function getJSX() {
        if (!store) {
            return <div>Loading...</div>
        }

        const categoryNames = store.categories.map(c => { return c.name });

        let jsx = <DragDropContext onDragEnd={handleDragEnd}>
            {store.categories.map((c, index) => {
                return (
                    <AdminCategory
                        key={c.name}
                        category={c}
                        categories={categoryNames}
                        store={store}
                        onCategorySet={handleCategorySet}
                        onCategoryDelete={handleCategoryDelete}
                        onGroceryAdd={handleGroceryAdd}
                        onGroceryDelete={handleGroceryDelete}
                    >
                    </AdminCategory>
                );
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