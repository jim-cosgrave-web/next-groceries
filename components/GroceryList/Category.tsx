import React, { useState, useRef, useEffect } from 'react';
import fetch from 'isomorphic-unfetch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckSquare } from '@fortawesome/free-solid-svg-icons';
import { faSquare } from '@fortawesome/free-regular-svg-icons';
import { env } from '../../util/environment';
import Grocery from './Grocery';

const Category = (props) => {
    const [category, setCategory] = useState(props.category);

    useEffect(() => {
        if (props.category) {
            console.log(props.category.notAvailable);
            setCategory(props.category);
        }
    }, [props.category]);

    function handleGroceryUpdate(grocery) {
        if (typeof (props.onGroceryUpdate) === 'function') {
            props.onGroceryUpdate(grocery);
        }
    }

    function handleGroceryCategoryChange(newCategoryName, oldCategoryName, grocery) {
        if (typeof (props.onGroceryCategoryChange) === 'function') {
            props.onGroceryCategoryChange(newCategoryName, oldCategoryName, grocery);
        }
    }

    function getJSX() {
        let wrapperClass = 'list-category mt-10';

        if(category.notAvailable) {
            wrapperClass = 'list-category not-available mt-50'
        } 

        let jsx = (
            <div className={wrapperClass}>
                <div className="list-category-name">
                    {category.name}
                </div>
                <div>
                    {getGroceriesJSX(category.groceries)}
                </div>
            </div>
        );

        return jsx;
    }

    function getGroceriesJSX(groceries) {
        let groceriesJSX = (
            groceries && groceries.map((g, gIndex) => {
                return (
                    <Grocery
                        grocery={g}
                        list_id={props.listId}
                        enableCategory={true}
                        categoryName={category.name}
                        categories={props.categories}
                        onUpdate={handleGroceryUpdate}
                        onCategorySet={handleGroceryCategoryChange}
                        key={g.hash}>
                    </Grocery>
                );
            }));

        return groceriesJSX;
    }

    return (
        <div>
            {getJSX()}
        </div>
    );
};

export default Category;