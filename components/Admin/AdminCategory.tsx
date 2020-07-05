import React, { useState, useRef, useEffect } from 'react';
import AdminGrocery from './AdminGrocery';
import { Droppable } from 'react-beautiful-dnd';
import { UPDATE_STORE_CATEGORY_API_METHOD, ADD_STORE_GROCERY_API_METHOD } from '../../util/constants';
import { env } from '../../util/environment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import MyTypeahead from '../Shared/MyTypeahead';

const postStoreApiUrl = env.apiUrl + 'store';

const AdminCategory = (props) => {
    const [mode, setMode] = useState('view');
    const [groceries, setGroceries] = useState(null);
    const nameRef = useRef<HTMLInputElement>(null);
    const groceryRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setGroceries(props.category.groceries);
    }, [props.category]);

    function handleCategorySet(grocery, previousCategory, newCategory) {
        if (typeof (props.onCategorySet) === 'function') {
            props.onCategorySet(grocery, previousCategory, newCategory)
        }
    }

    async function toggleMode(e) {
        if(props.category.notAvailable) {
            return;
        }

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
        if (typeof (props.onCategoryDelete) === 'function') {
            props.onCategoryDelete(props.category);
        }
    }

    async function handleAddGrocery(grocery) {
        await handleNewGroceryClick(grocery);
    }

    async function handleNewGroceryClick(groceryName) {
        if (!groceryName || groceryName.trim().length == 0) {
            return;
        }

        const clone = groceries.slice();
        clone.push({ groceryName });

        for (let i = 0; i < clone.length; i++) {
            clone[i].order = i + 1;
        }

        const grocery = clone[clone.length - 1];

        setGroceries(clone);
        //groceryRef.current.value = '';

        const body = {
            method: ADD_STORE_GROCERY_API_METHOD,
            store_id: props.store._id,
            grocery: grocery,
            categoryName: props.category.name
        };

        const resp = await fetch(postStoreApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const json = await resp.json();

        if (typeof (props.onGroceryAdd) === 'function') {
            props.onGroceryAdd(props.category.name, grocery);
        }
    }

    function handleGroceryDelete(grocery) {
        if (typeof (props.onGroceryDelete) === 'function') {
            props.onGroceryDelete(props.category.name, grocery);
        }
    }

    function moveLeft() {
        if (typeof (props.onMove) === 'function') {
            props.onMove(props.category.name, -1);
        }
    }

    function moveRight() {
        if (typeof (props.onMove) === 'function') {
            props.onMove(props.category.name, 1);
        }
    }

    return (
        <div className="category-container">
            {mode == 'view' && <div className="category-name clickable">
                <div className="flex space-between">
                    <div onClick={toggleMode}>
                        {props.category.name}
                    </div>
                    {!props.category.notAvailable && <div>
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-20" onClick={moveLeft} />
                        <FontAwesomeIcon icon={faArrowRight} onClick={moveRight} />
                    </div>}
                </div>
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
                        <FontAwesomeIcon icon={faTrash} />
                    </div>
                </div>
            </div>}
            <Droppable droppableId={props.category.name}>
                {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="grocery-container">
                        {groceries && groceries.map((g, index) => {
                            return <AdminGrocery
                                key={g.groceryName + "-" + index}
                                grocery={g}
                                index={index}
                                categories={props.categories}
                                categoryName={props.category.name}
                                onCategorySet={handleCategorySet}
                                onGroceryDelete={handleGroceryDelete}
                                storeId={props.store._id}
                            >
                            </AdminGrocery>;
                        })}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
            <div className="grocery-container">
                <div className="new-grocery">
                    <MyTypeahead placeholder="Add a grocery" type="groceries" onAdd={handleAddGrocery}></MyTypeahead>
                </div>
            </div>
        </div>
    );
};

export default AdminCategory;