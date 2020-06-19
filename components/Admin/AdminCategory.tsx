import React, { useState, useRef } from 'react';
import AdminGrocery from './AdminGrocery';
import { Droppable } from 'react-beautiful-dnd';

const AdminCategory = (props) => {


    return (
        <div className="category-container">
            <div className="category-name">
                {props.category.name}
            </div>
            <Droppable droppableId={props.category.name}>
                {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="grocery-container">
                        {props.category.groceries.map((g, index) => {
                            return <AdminGrocery key={g.groceryName} grocery={g} index={index}></AdminGrocery>;
                        })}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
};

export default AdminCategory;