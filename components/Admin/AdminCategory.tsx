import React, { useState, useRef } from 'react';
import AdminGrocery from './AdminGrocery';
import { Droppable } from 'react-beautiful-dnd';
import { UPDATE_STORE_CATEGORY_API_METHOD } from '../../util/constants';
import { env } from '../../util/environment';

const postStoreApiUrl = env.apiUrl + 'store';

const AdminCategory = (props) => {
    const [mode, setMode] = useState('view');
    const nameRef = useRef<HTMLInputElement>(null);

    function handleCategorySet(grocery, previousCategory, newCategory) {
        if (typeof (props.onCategorySet) === 'function') {
            props.onCategorySet(grocery, previousCategory, newCategory)
        }
    }

    async function toggleMode(e) {
        const domType = e.target.type;

        if (domType) {
            return;
        }

        if (mode == 'view') {
            setMode('edit');
        } else {
            //
            // Save data
            //
            const clone = props.category;
            const previousCategoryName = clone.name;
            clone.name = nameRef.current?.value;

            setMode('view');

            await saveCategoryName(previousCategoryName, clone.name);
        }
    }

    //
    // Save a category name change
    //
    async function saveCategoryName(previousCategoryName, newCategoryName) {
        const body = {
            method: UPDATE_STORE_CATEGORY_API_METHOD,
            store_id: props.store._id,
            previousCategoryName: previousCategoryName,
            newCategoryName: newCategoryName
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
    // Key press on category name input
    //
    async function handleKeyUp(e) {
        if (e.key.toLowerCase() === 'enter') {
            await saveCategoryName(props.category.name, nameRef.current.value);
            props.category.name = nameRef.current.value;
            setMode('view');
        }
    }

    async function deleteCategory(e) {
        if(typeof(props.onCategoryDelete) === 'function') {
            props.onCategoryDelete(props.category);
        }
    }

    return (
        <div className="category-container">
            {mode == 'view' && <div className="category-name clickable" onClick={toggleMode}>
                {props.category.name}
            </div>}
            {mode == 'edit' && <div className="category-name clickable">
                <div className="flex space-between">
                    <div className="flex-grow-1" onClick={toggleMode}>
                        <input 
                            className="form-control category-input" 
                            type="text" 
                            ref={nameRef}
                            onKeyUp={handleKeyUp}
                            defaultValue={props.category.name} />
                    </div>
                    <div className="clickable" onClick={deleteCategory}>
                        Delete
                    </div>
                </div>
            </div>}
            <Droppable droppableId={props.category.name}>
                {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="grocery-container">
                        {props.category.groceries.map((g, index) => {
                            return <AdminGrocery
                                key={g.groceryName}
                                grocery={g}
                                index={index}
                                categories={props.categories}
                                categoryName={props.category.name}
                                onCategorySet={handleCategorySet}
                            >
                            </AdminGrocery>;
                        })}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
};

export default AdminCategory;