import React, { useState, useRef, useEffect } from 'react';
import fetch from 'isomorphic-unfetch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { env } from '../../util/environment';
import Grocery from './Grocery';
import { USER_API_RENAME_CATEGORY, LOCAL_STORAGE_STORE_LIST } from '../../util/constants';

const userApi = env.apiUrl + 'user';

const Category = (props) => {
    const [category, setCategory] = useState(props.category);
    const [mode, setMode] = useState('view');

    const nameRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (props.category) {
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

    async function toggleMode(e) {
        const domType = e?.target?.type;

        if (domType) {
            return;
        }

        if (mode == 'view') {
            setMode('edit');
        } else {
            let name = nameRef?.current?.value;

            if(name != category.name) {
                name = name.trim();

                const clone = { ...category };

                if(name === '') {
                    name = category.originalName;
                    clone.isCustomized = false;
                } else {
                    clone.isCustomized = true;
                }

                clone.name = name;
                setCategory(clone);
                setMode('view');
                localStorage.setItem(LOCAL_STORAGE_STORE_LIST, JSON.stringify(null));

                const body = {
                    method: USER_API_RENAME_CATEGORY,
                    store_id: props.store.value,
                    category_id: category.id,
                    name: name,
                    originalName: category.originalName
                };

                const resp = await fetch(userApi, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                });
        
                const json = await resp.json();
            } else {
                setMode('view');
            }
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
            wrapperClass = 'list-category not-available mt-10'
        } 

        let jsx = (
            <div className={wrapperClass}>
                {mode == 'view' && <div className="list-category-name clickable" onClick={toggleMode}>
                    <div>
                        {category.isCustomized ? '*' : ''} {category.name}
                    </div>
                    {category.subCategoryName && <div className="mt-10 sub-category-name">
                        {category.subCategoryName}
                    </div>}
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