import React, { useState, useRef } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

const AdminGrocery = (props) => {
    const [mode, setMode] = useState('view');

    const nameRef = useRef<HTMLInputElement>(null);

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

    return (
        <Draggable draggableId={props.grocery.groceryName} index={props.index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}

                    className="admin-grocery"
                >
                    <div className="flex space-between">
                        {mode == 'view' && <div className="flex-grow-1 p-1 clickable" onClick={changeMode}>
                            {props.grocery.groceryName}
                        </div>}
                        {mode == 'edit' && <div className="flex-grow-1 p-1 clickable" onClick={changeMode}>
                            <div>
                                <input className="form-control" type="text" ref={nameRef} defaultValue={props.grocery.groceryName} />
                            </div>
                            <div className="mt-10">
                                <select className="prevent-click select-css" onChange={handleCategoryChange} value={props.categoryName}>
                                    {props.categories.map((c, i) => { return <option key={c} defaultValue={props.categoryName}>{c}</option>; })}
                                </select>
                            </div>
                        </div>}
                        <div>
                            <div className="admin-drag" {...provided.dragHandleProps}>
                                <FontAwesomeIcon icon={faBars} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </Draggable>
    );
};

export default AdminGrocery;