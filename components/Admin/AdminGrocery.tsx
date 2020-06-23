import React, { useState, useRef, useEffect } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTrash } from '@fortawesome/free-solid-svg-icons';
import { env } from '../../util/environment';
import { UPDATE_STORE_GROCERY_API_METHOD } from '../../util/constants';

const updateStoreGroceryApi = env.apiUrl + 'store';

const AdminGrocery = (props) => {
    const [mode, setMode] = useState('view');
    const [grocery, setGrocery] = useState(null);

    const nameRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setGrocery(props.grocery);
    }, [props.grocery]);

    function changeMode(e) {
        const domType = e.target.type;

        if (domType) {
            return;
        }

        if(mode == 'view') {
            setMode('edit');
        } else {
            setMode('view');
        }
    }

    function handleCategoryChange(event) {
        if(typeof(props.onCategorySet) === 'function') {
            props.onCategorySet(props.grocery, props.categoryName, event.target.value)
        }
    }

    function handleDeleteClick(event) {
        if(typeof(props.onGroceryDelete) === 'function') {
            props.onGroceryDelete(props.grocery);
        }
    }

    async function handleKeyUp(e) {
        if (e.key.toLowerCase() === 'enter') {
            await saveNote();
        }
    }

    async function handleBlur(e) {
        await saveNote();
    }

    async function saveNote() {
        const clone = { ...grocery };
        
        clone.originalName = clone.groceryName;
        clone.groceryName = nameRef.current?.value;
        setGrocery(clone);
        await updateGrocery(clone);

        setMode('view');
    }

    async function updateGrocery(grocery) {
        console.log(props.storeId);
        const body = { 
            method: UPDATE_STORE_GROCERY_API_METHOD,
            storeId: props.storeId.toString(), 
            grocery: grocery,
            categoryName: props.categoryName
        };

        const resp = await fetch(updateStoreGroceryApi, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const json = await resp.json();
    }

    if(!grocery) {
        return <div>Loading...</div>;
    }

    return (
        <Draggable draggableId={grocery.groceryName} index={props.index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}

                    className="admin-grocery"
                >
                    <div className="flex space-between">
                        {mode == 'view' && <div className="flex-grow-1 p-1 clickable" onClick={changeMode}>
                            {grocery.groceryName}
                        </div>}
                        {mode == 'edit' && <div className="flex-grow-1 p-1 clickable" onClick={changeMode}>
                            <div>
                                <input 
                                    className="form-control" 
                                    type="text" 
                                    ref={nameRef} 
                                    defaultValue={grocery.groceryName}
                                    onKeyUp={handleKeyUp}
                                    onBlur={handleBlur}
                                    onChange={() => { }}></input>
                            </div>
                            <div className="mt-10">
                                <select className="prevent-click select-css" onChange={handleCategoryChange} value={props.categoryName}>
                                    {props.categories.map((c, i) => { return <option key={c} defaultValue={props.categoryName}>{c}</option>; })}
                                </select>
                            </div>
                        </div>}
                        <div>
                            {mode == 'view' && <div className="admin-drag" {...provided.dragHandleProps}>
                                <FontAwesomeIcon icon={faBars} />
                            </div>}
                            {mode == 'edit' && <div className="admin-drag" onClick={handleDeleteClick} {...provided.dragHandleProps}>
                                <FontAwesomeIcon icon={faTrash} />
                            </div>}
                        </div>
                    </div>
                </div>
            )}

        </Draggable>
    );
};

export default AdminGrocery;