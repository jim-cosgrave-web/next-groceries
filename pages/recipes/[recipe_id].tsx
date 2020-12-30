import React, { useEffect, useState, useRef } from "react";
import { env } from "../../util/environment";
import { myGet } from "../../util/myGet";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faCheckSquare, faChevronLeft, faCheck } from '@fortawesome/free-solid-svg-icons';
import { faSquare } from '@fortawesome/free-regular-svg-icons';
import MyTypeahead from '../../components/Shared/MyTypeahead';
import Router from "next/router";
import Confirm from "../../components/Shared/Confirm";
import { simpleHash } from "../../util/simpleHash";
import Link from 'next/link';

import {
    RECIPE_API_PUT_DETAILS,
    RECIPE_API_POST_INGREDIENT,
    RECIPE_API_DELETE_INGREDIENT,
    RECIPE_API_POST_CATEGORY,
    RECIPE_API_DELETE_CATEGORY,
    LIST_API_POST_RECIPE,
    RECIPE_API_POST_RECIPE,
    RECIPE_API_DELETE_RECIPE
} from "../../util/constants";

import { ToastContainer, toast } from 'react-toastify';
import Breadcrumbs from "../../components/Shared/Breadcrumbs";

const apiUrl = env.apiUrl + 'recipes';
const listApiUrl = env.apiUrl + 'list';

const RecipeByIdPage = () => {
    const [recipe, setRecipe] = useState(null);
    const [recipeNotFound, setRecipeNotFound] = useState(false);
    const [mode, setMode] = useState('view');
    const [newRecipeValid, setNewRecipeValid] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [error, setError] = useState(null);

    const router = useRouter();

    const nameRef = useRef<HTMLInputElement>(null);
    const linkRef = useRef<HTMLInputElement>(null);
    const putTimeout = useRef<any>(null);
    const startToastId = React.useRef(null);

    const notifyStart = () => startToastId.current = toast('Adding recipe to your list...', {
        position: "bottom-center",
        hideProgressBar: true,
        closeOnClick: true,
        progress: undefined,
        className: 'warning'
    });

    useEffect(() => {
        const recipe_id = router.query.recipe_id;
        let isCancelled = false;

        async function execute() {
            const data = await myGet(`${apiUrl}?method=getById&id=${recipe_id}`, null);

            if (isCancelled == false) {
                if (data.recipe) {
                    if (data.recipe.ingredients) {
                        for (let i = 0; i < data.recipe.ingredients.length; i++) {
                            data.recipe.ingredients[i].checked = true;
                        }
                    }

                    setRecipe(data.recipe);

                    if (!data.recipe.ingredients || data.recipe.ingredients.length == 0) {
                        setMode('edit');
                    }
                } else {
                    setRecipeNotFound(true);
                }
            }
        }

        if (recipe_id && recipe_id != 'create') {
            execute();
        } else if (recipe_id == 'create') {
            setRecipe({
                isNew: true,
                name: '',
                link: '',
                ingredients: [],
                categories: []
            });

            setRecipeNotFound(false);
            handleEdit();
        }

        return () => {
            isCancelled = true;
        };
    }, [router.query.recipe_id]);

    function handleEdit() {
        console.log('setting mode edit...');
        setMode('edit');
    }

    function handleView() {
        setMode('view');
    }

    async function handleAddToList() {
        setMode('add-to-list');
    }

    async function handleConfirmAddToList() {
        let groceries = [];
        notifyStart();

        if (recipe.ingredients) {
            for (let i = 0; i < recipe.ingredients.length; i++) {
                let ingredient = recipe.ingredients[i];

                let key = `${ingredient.name}_checked_note`;
                let hashKey = simpleHash(key);

                if (ingredient.checked) {
                    let grocery = {
                        name: ingredient.name,
                        checked: false,
                        recipe: recipe.name,
                        note: ingredient.note,
                        hash: hashKey
                    }

                    groceries.push(grocery);
                }
            }

            const body = {
                method: LIST_API_POST_RECIPE,
                recipeName: recipe.name,
                groceries,
                recipeLink: recipe.link,
                recipeId: router.query.recipe_id
            };

            const resp = await fetch(listApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            const json = await resp.json();

            Router.replace('/grocery-list');
        }
    }

    async function handleAddGrocery(grocery) {
        let clone = { ...recipe };

        let exists = clone.ingredients.find(i => i.name === grocery);

        if (!exists) {
            if (recipe.isNew) {
                clone.ingredients.push({ name: grocery });
                setRecipe(clone);
                return;
            }

            clone.ingredients.push({ name: grocery, checked: true });
            clone.ingredients.sort((a, b) => (a.name > b.name) ? 1 : -1);
            setRecipe(clone);

            const body = {
                method: RECIPE_API_POST_INGREDIENT,
                recipe_id: recipe._id,
                grocery
            };

            const resp = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            const json = await resp.json();
        }
    }

    async function handleAddCategory(category) {
        let clone = { ...recipe };

        if (clone.categories.indexOf(category) == -1) {
            clone.categories.push(category);
            clone.categories.sort((a, b) => (a > b) ? 1 : -1);
            setRecipe(clone);

            if (!recipe.isNew) {
                const body = {
                    method: RECIPE_API_POST_CATEGORY,
                    recipe_id: recipe._id,
                    category
                };

                const resp = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                });

                const json = await resp.json();
            }
        }
    }

    async function handleRemoveIngredient(ingredient) {
        let clone = { ...recipe };

        const index = clone.ingredients.map(c => { return c.name }).indexOf(ingredient.name);

        if (index != -1) {
            clone.ingredients.splice(index, 1);
            setRecipe(clone);

            if (!recipe.isNew) {
                const body = {
                    method: RECIPE_API_DELETE_INGREDIENT,
                    recipe_id: recipe._id,
                    ingredient
                };

                const resp = await fetch(apiUrl, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                });

                const json = await resp.json();
            }
        }
    }

    async function handleRemoveCategory(category) {
        let clone = { ...recipe };

        const index = clone.categories.indexOf(category);

        if (index != -1) {
            clone.categories.splice(index, 1);
            setRecipe(clone);

            if (!recipe.isNew) {
                const body = {
                    method: RECIPE_API_DELETE_CATEGORY,
                    recipe_id: recipe._id,
                    category
                };

                const resp = await fetch(apiUrl, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                });

                const json = await resp.json();
            }
        }
    }

    async function handleNameChange() {
        const name = nameRef?.current?.value;

        if (name != recipe.name) {
            const clone = { ...recipe };
            clone.name = name;
            setRecipe(clone);

            await putRecipeDetails();
        }
    }

    async function handleLinkChange() {
        const link = linkRef?.current?.value;

        if (link != recipe.link) {
            const clone = { ...recipe };
            clone.link = link;
            setRecipe(clone);

            await putRecipeDetails();
        }
    }

    async function putRecipeDetails() {
        const name = nameRef?.current?.value;
        const link = linkRef?.current?.value;

        if (!recipe.isNew) {

            if (putTimeout.current) {
                clearTimeout(putTimeout.current);
            }

            putTimeout.current = setTimeout(async () => {
                const body = {
                    method: RECIPE_API_PUT_DETAILS,
                    recipe_id: recipe._id,
                    name: name,
                    link: link,
                    ingredients: recipe.ingredients
                };

                const resp = await fetch(apiUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                });

                const json = await resp.json();
            }, 1000);
        } else {
            if (name && name.length > 0) {
                setNewRecipeValid(true);
            } else {
                setNewRecipeValid(false);
            }
        }
    }

    function saveButtonClass() {
        let btnClass = 'my-button w-100'

        if (!newRecipeValid) {
            btnClass += ' inactive';
        }

        return btnClass;
    }

    async function handleSaveClick() {
        setError(null);

        if (!newRecipeValid) {
            return;
        }

        const body = {
            method: RECIPE_API_POST_RECIPE,
            recipe: recipe
        };

        const resp = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        setNewRecipeValid(false);
        const json = await resp.json();

        if (json && !json.recipeId) {
            setError({ errorMessage: true });
        }

        Router.replace(`/recipes/${json.recipeId.toString()}`);
        handleEdit();

    }

    function handleDeleteStep1() {
        setIsDeleteConfirmOpen(true);
    }

    async function handleDeleteStep2() {
        setIsDeleteConfirmOpen(false);

        const body = {
            method: RECIPE_API_DELETE_RECIPE,
            recipeId: recipe._id
        };

        const resp = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        await resp.json();

        Router.replace(`/recipes`);
    }

    function getJSX() {
        if (mode != 'view') {
            return null;
        }

        if (!recipe) {
            return <div className="mt-20">Loading...</div>;
        }

        if (recipeNotFound) {
            return <div className="mt-20">Invalid recipe</div>;
        }

        let jsx = null;

        jsx = (
            <div>
                <div className="flex space-between">
                    <div className="w-75">
                        <h2>{recipe.name}</h2>
                    </div>
                    <div className="clickable">
                        <FontAwesomeIcon icon={faEdit} onClick={handleEdit} />
                    </div>
                </div>
                {recipe.link && recipe.link.length > 0 && <div className="large-link">
                    <a href={recipe.link} target="__blank">Recipe Link</a>
                </div>}
                <div className="mb-20">
                    <div className="sub-section-title pt-10 pb-10">
                        Ingredients
                    </div>
                    {getIngredientsJSX()}
                    <div className="mt-20">
                        <button className="my-button w-100" onClick={handleAddToList}>Add to List</button>
                    </div>
                </div>
                <div>
                    <div className="sub-section-title">
                        Categories
                    </div>
                    {getCategoryJSX()}
                </div>
                <div className="mt-50">
                    <button onClick={handleDeleteStep1} className="my-button danger w-100">DELETE</button>
                </div>
                <div>
                    <Confirm
                        isOpen={isDeleteConfirmOpen}
                        onConfirm={handleDeleteStep2}
                        onClose={() => setIsDeleteConfirmOpen(false)}
                    />
                </div>
            </div>
        );

        return jsx;
    }

    function getEditJSX() {
        if (mode != 'edit') {
            return null;
        }

        let jsx = null;

        jsx = (
            <div>
                <div className="flex space-between">
                    <div>
                        {recipe.name !== '' && <h2>{recipe.name}</h2>}
                        {recipe.name === '' && <h2>Create a New Recipe</h2>}
                    </div>
                    {!recipe.isNew && <div className="clickable success-text">
                        {/* <a onClick={handleView}>Back to view</a> */}
                        <FontAwesomeIcon className="clickable" icon={faCheck} onClick={handleView} />
                    </div>}
                </div>
                {!recipe.isNew && <div className="alert warning mb-10">
                    <b>Changes will Auto Save</b>
                    <div className="mt-20">
                        Changes are automatically saved as you modify fields, ingredients, or categories
                    </div>
                </div>}
                <div className="my-form w-100">
                    <div className="form-fieldset w-100">
                        <div>
                            <h3>Name</h3>
                        </div>
                        <div className="form-input">
                            <input ref={nameRef} onKeyUp={handleNameChange} type="text" className="w-100" defaultValue={recipe.name} />
                        </div>
                    </div>
                </div>
                {recipe.isNew && <div>
                    <div className="alert warning mb-10">
                        <b>Creating a new recipe</b>
                        <div className="mt-20">
                            Name and save your recipe first.  Then you can add ingredients, categories, and a link.
                        </div>
                    </div>
                </div>}
                {!recipe.isNew && <div>
                    <div className="my-form w-100">
                        <div className="form-fieldset w-100">
                            <div>
                                <h3>Link</h3>
                            </div>
                            <div className="form-input">
                                <input ref={linkRef} onKeyUp={handleLinkChange} type="text" className="w-100" defaultValue={recipe.link} />
                            </div>
                        </div>
                    </div>
                    <div className="mb-20">
                        <div className="sub-section-title pt-10 pb-10">
                            Ingredients
                    </div>
                        {getIngredientsJSX()}
                        <div className="mt-10">
                            <MyTypeahead placeholder="Add an ingredient" type="groceries" onAdd={handleAddGrocery}></MyTypeahead>
                        </div>
                    </div>
                    <div>
                        <div className="sub-section-title">
                            Categories
                    </div>
                        {getCategoryJSX()}
                        <div className="mt-10">
                            <MyTypeahead placeholder="Add a category" type="categories" onAdd={handleAddCategory}></MyTypeahead>
                        </div>
                    </div>
                </div>}
                {error && <div className="alert warning mb-10 mt-20">
                    <b>Error Occurred</b>
                    <div className="mt-20">
                        Unable to save the recipe.  Please try again.
                    </div>
                </div>}
                {recipe.isNew && <div className="mt-20">
                    <button className={saveButtonClass()} onClick={handleSaveClick}>Save</button>
                </div>}
            </div>
        );

        return jsx;
    }

    function getAddToListJSX() {
        if (mode != 'add-to-list') {
            return null;
        }

        let jsx = null;

        jsx = (
            <div>
                <div className="flex space-between">
                    <div>
                        <h2>{recipe.name}</h2>
                    </div>
                    <div className="clickable">
                        <a onClick={handleView}>Cancel</a>
                    </div>
                </div>
                <div className="mb-20">
                    <div className="sub-section-title pt-10 pb-10">
                        Ingredients
                    </div>
                    {getIngredientsJSX()}
                    <div className="mt-20">
                        <button className="my-button w-100" onClick={handleConfirmAddToList}>Confirm</button>
                    </div>
                </div>
            </div>
        );

        return jsx;
    }

    function toggleIngredientCheck(i) {
        let clone = { ...recipe };
        let ingredient = clone.ingredients.find(ing => ing.name === i.name);

        ingredient.checked = !ingredient.checked;

        setRecipe(clone);
    }

    async function handleIngredientNoteChange(i, e) {
        const input = e.target.value;

        i.note = input;

        await putRecipeDetails();
    }

    function getIngredientsJSX() {
        if (!recipe || !recipe.ingredients) {
            return <div>No Ingredients</div>;
        }

        let jsx = (
            <div className="list">
                {recipe.ingredients.map((i, index) => {
                    return (
                        <div className="item" key={i.name}>
                            <div className="flex space-between">
                                <div className="w-75">
                                    <div>
                                        {i.name}
                                    </div>
                                    <div className="mt-10">
                                        {mode == 'edit' && <input type="text" className="form-control w-100" placeholder="Add a note..." onChange={(e) => handleIngredientNoteChange(i, e)} defaultValue={i.note} />}
                                        {mode != 'edit' && i.note && i.note.length > 0 && <div><i>Note: {i.note}</i></div>}
                                    </div>
                                </div>
                                <div>
                                    {mode == 'edit' && <FontAwesomeIcon className="clickable" icon={faTrash} onClick={() => handleRemoveIngredient(i)} />}
                                </div>
                                {mode == 'add-to-list' && <div>
                                    <div>
                                        {i.checked && <FontAwesomeIcon className="clickable" icon={faCheckSquare} onClick={() => toggleIngredientCheck(i)} />}
                                        {!i.checked && <FontAwesomeIcon className="clickable" icon={faSquare} onClick={() => toggleIngredientCheck(i)} />}
                                    </div>
                                </div>}
                            </div>
                        </div>
                    );
                })}
            </div>);

        return jsx;
    }

    function getCategoryJSX() {
        if (!recipe || !recipe.categories) {
            return <div>No Ingredients</div>;
        }

        let jsx = (
            <div className="list">
                {recipe.categories.map((c, index) => {
                    return (
                        <div className="item" key={c}>
                            <div className="flex space-between">
                                <div>
                                    {c}
                                </div>
                                <div>
                                    {mode == 'edit' && <FontAwesomeIcon className="clickable" icon={faTrash} onClick={() => handleRemoveCategory(c)} />}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>);

        return jsx;
    }

    return (
        <div>
            <div className="clickable mt-20">
                <Link href="/recipes">
                    <div className="flex large-link">
                        <FontAwesomeIcon icon={faChevronLeft} />
                        <div className="ml-10">
                            Back to recipe list
                        </div>
                    </div>
                </Link>
            </div>
            {getJSX()}
            {getEditJSX()}
            {getAddToListJSX()}
            <ToastContainer />
        </div>
    );
}

export default RecipeByIdPage;