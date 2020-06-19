import React, { useState, useRef } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

const AdminGrocery = (props) => {
    const getItemStyle = (isDragging, draggableStyle) => ({
        // change background colour if dragging
        //backgroundColor: isDragging ? "lightgreen" : "inherit",

        // styles we need to apply on draggables
        ...draggableStyle
    });
    return (
        <Draggable draggableId={props.grocery.groceryName} index={props.index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}

                    className="admin-grocery"
                >
                    <div className="flex space-between">
                        <div>
                            {props.grocery.groceryName}
                        </div>
                        <div>
                            <div {...provided.dragHandleProps}>
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