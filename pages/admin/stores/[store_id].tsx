import React, { useEffect, useState, useRef } from 'react';
import { env } from '../../../util/environment';
import { useRouter } from 'next/router';
import { myGet } from '../../../util/myGet';
import { DragDropContext } from 'react-beautiful-dnd';
import AdminCategory from '../../../components/Admin/AdminCategory';
import { 
    UPDATE_STORE_GROCERY_CATEGORY_API_METHOD, 
    REORGANIZE_STORE_GROCERIES_API_METHOD, UNCATEGORIZED, 
    DELETE_STORE_CATEGORY_API_METHOD, 
    DELETE_STORE_GROCERY_API_METHOD, 
    ADD_STORE_CATEGORY_API_METHOD,
    MOVE_STORE_CATEGORY_API_METHOD
} from '../../../util/constants';
import Confirm from '../../../components/Shared/Confirm';

const storeApiUrl = env.apiUrl + 'store';
const storeDetailApiUrl = env.apiUrl + 'store?method=getStoreDetails';

const AdminStoreByIdPage = () => {
    const [store, setStore] = useState(null);
    const [isCategoryConfirmOpen, setCategoryConfirm] = useState(false);
    const router = useRouter();
    const newCategoryNameRef = useRef<HTMLInputElement>(null);
    let reorganizeTimeout = useRef(null);
    let categoryToDelete = useRef(null);

    useEffect(() => {
        const store_id = router.query.store_id;

        let isCancelled = false;

        async function execute() {
            const storeResp = await myGet(storeDetailApiUrl + '&store_id=' + store_id, null);

            if (isCancelled == false) {
                storeResp.store.categories.sort((a, b) => (a.order > b.order) ? 1 : -1);
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
            method: UPDATE_STORE_GROCERY_CATEGORY_API_METHOD,
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
    async function handleCategoryDelete_step1(category) {
        categoryToDelete.current = category;
        setCategoryConfirm(true);
    }

    //
    // Delete the category once confirmed
    //
    async function handleCategoryDelete_step2() {
        const category = categoryToDelete.current;
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
        const clone = { ...store };
        const categoryIndex = clone.categories.map(c => { return c.name }).indexOf(categoryName);
        const category = clone.categories[categoryIndex];

        category.groceries.push(grocery);
        setStore(clone);
    }

    //
    // Handle grocery deleted
    //
    async function handleGroceryDelete(categoryName, grocery) {
        const clone = { ...store };

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

    async function newCategoryKeyUp(e) {
        if (e.key.toLowerCase() === 'enter') {
            await handleNewCategoryAdd();
        }
    }

    async function handleNewCategoryAdd() {
        const clone = { ...store };

        const newCategory = {
            name: newCategoryNameRef.current.value,
            order: Math.max.apply(Math, clone.categories.map(function(c) { return c.order })) + 1,
            groceries: []
        };
        
        clone.categories.sort((a, b) => (a.order > b.order) ? 1 : -1);
        clone.categories.push(newCategory);

        setStore(clone);

        const body = {
            method: ADD_STORE_CATEGORY_API_METHOD,
            storeId: store._id.toString(),
            category: newCategory
        };

        const resp = await fetch(storeApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const json = await resp.json();
    }

    //
    // Handle category movement
    //
    async function handleMove(categoryName, direction) {
        const clone = { ...store };
        const categoryIndex = clone.categories.map(c => { return c.name; }).indexOf(categoryName);
        const otherIndex = categoryIndex + direction;

        if(otherIndex < 0) {
            console.log('cant move before beginning...');
            return;
        }

        if(otherIndex > clone.categories.length - 1) {
            console.log('cant move past the end...');
            return;
        }

        const swap = clone.categories[otherIndex];
        const category = clone.categories[categoryIndex];

        const tempOrder = swap.order;
        swap.order = category.order;
        category.order = tempOrder;

        clone.categories[otherIndex] = category
        clone.categories[categoryIndex] = swap;

        setStore(clone);

        const body = {
            method: MOVE_STORE_CATEGORY_API_METHOD,
            storeId: store._id.toString(),
            category1: { name: category.name, order: category.order },
            category2: { name: swap.name, order: swap.order }
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
                        onCategoryDelete={handleCategoryDelete_step1}
                        onGroceryAdd={handleGroceryAdd}
                        onGroceryDelete={handleGroceryDelete}
                        onMove={handleMove}
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
            <div>
                <Confirm 
                    isOpen={isCategoryConfirmOpen} 
                    onConfirm={handleCategoryDelete_step2}
                    onClose={() => setCategoryConfirm(false)}
                />
            </div>
            <div className="flex align-top">
                {getJSX()}
            </div>
            <div style={{ 'width': '20%', 'minWidth': '300px' }}>
                <input ref={newCategoryNameRef} onKeyUp={newCategoryKeyUp} className="form-control" placeholder="Add a new category..." />
                <button className="btn" onClick={handleNewCategoryAdd}>Add</button>
            </div>
        </div>
    );
}

export default AdminStoreByIdPage;