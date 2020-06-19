import React, { useState, useRef } from 'react';
import { Draggable } from 'react-beautiful-dnd';

const AdminGrocery = (props) => {


    return (
        <Draggable draggableId={props.grocery.groceryName} index={props.index}>
            {(provided) => (
                <div 
                    ref={provided.innerRef}
                    {...provided.draggableProps} 
                    {...provided.dragHandleProps}
                    className="admin-grocery"
                >
                    {props.grocery.groceryName}
                </div>
            )}

        </Draggable>
    );
};

export default AdminGrocery;