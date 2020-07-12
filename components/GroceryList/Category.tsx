import React, { useState, useRef, useEffect } from 'react';
import fetch from 'isomorphic-unfetch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { env } from '../../util/environment';
import Grocery from './Grocery';
import { USER_API_RENAME_CATEGORY } from '../../util/constants';

const userApi = env.apiUrl + 'user';

const Category = (props) => {
    const [category, setCategory] = useState(props.category);
    const [mode, setMode] = useState('view');

    const nameRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (props.category) {
            setCategory(props.category);
            //console.log(props.store.value);
            //console.log(props.category);
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

    async function toggleMode(e) {
        const domType = e?.target?.type;

        if (domType) {
            return;
        }

        if (mode == 'view') {
            setMode('edit');
        } else {
            const name = nameRef?.current?.value;

            if(name != category.name) {
                const clone = { ...category };
                clone.name = name;
                setCategory(clone);

                const body = {
                    method: USER_API_RENAME_CATEGORY,
                    store_id: props.store.value,
                    category_id: category.id,
                    name: name
                };

                const resp = await fetch(userApi, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                });
        
                const json = await resp.json();
        
                console.log(json);
            }

            setMode('view');
        }
    }

    async function handleKeyUp(e) {
        if (e.key.toLowerCase() === 'enter') {
            await toggleMode(null);
        }
    }

    async function handleBlur(e) {
        await toggleMode(null);
    }

    function getJSX() {
        let wrapperClass = 'list-category mt-10';

        if(category.notAvailable) {
            wrapperClass = 'list-category not-available mt-50'
        } 

        let jsx = (
            <div className={wrapperClass}>
                {mode == 'view' && <div className="list-category-name clickable" onClick={toggleMode}>
                    {category.name}
                </div>}
                {mode == 'edit' && <div className="flex space-between list-category-name">
                    <div className="category-input-container">
                        <input type="text" className="form-control" onKeyUp={handleKeyUp} defaultValue={category.name} ref={nameRef} />    
                    </div>
                    <div className="clickable grocery-checkbox" onClick={toggleMode}>
                        <FontAwesomeIcon icon={faSave} />
                    </div>
                </div>}
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