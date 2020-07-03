import { useEffect, useState, useRef } from "react";
import { env } from "../../util/environment";
import { myGet } from "../../util/myGet";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faCheckSquare } from '@fortawesome/free-solid-svg-icons';
import { faSquare } from '@fortawesome/free-regular-svg-icons';
import MyTypeahead from '../../components/Shared/MyTypeahead';
import { RECIPE_API_PUT_DETAILS, RECIPE_API_POST_INGREDIENT, RECIPE_API_DELETE_INGREDIENT, RECIPE_API_POST_CATEGORY, RECIPE_API_DELETE_CATEGORY, LIST_API_POST_RECIPE } from "../../util/constants";
import Router from "next/router";

const apiUrl = env.apiUrl + 'recipes';
const listApiUrl = env.apiUrl + 'list';

const RecipeByIdPage = () => {
    const [recipe, setRecipe] = useState(null);
    const [recipeNotFound, setRecipeNotFound] = useState(false);
    const [mode, setMode] = useState('view');

    const router = useRouter();

    const nameRef = useRef<HTMLInputElement>(null);
    const linkRef = useRef<HTMLInputElement>(null);
    const putTimeout = useRef<any>(null);

    useEffect(() => {
        const recipe_id = router.query.recipe_id;
        let isCancelled = false;

        async function execute() {
            const data = await myGet(`${apiUrl}?method=getById&id=${recipe_id}`, null);

            if (isCancelled == false) {
                if (data.recipe) {
                    if(data.recipe.ingredients) {
                        for(let i = 0; i < data.recipe.ingredients.length; i++) {
                            data.recipe.ingredients[i].checked = true;
                        }
                    }

                    setRecipe(data.recipe);
                } else {
                    setRecipeNotFound(true);
                }
            }
        }

        if (recipe_id) {
            execute();
        }

        return () => {
            isCancelled = true;
        };
    }, [router.query.recipe_id]);

    function handleEdit() {
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

        if(recipe.ingredients) {
            for(let i = 0; i < recipe.ingredients.length; i++) {
                let ingredient = recipe.ingredients[i];

                if(ingredient.checked) {
                    let grocery = {
                        name: ingredient.name,
                        checked: false,
                        recipe: recipe.name
                    }

                    groceries.push(grocery);
                }
            }

            const body = { 
                method: LIST_API_POST_RECIPE,
                groceries
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

        if(!exists) {
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

        if(clone.categories.indexOf(category) == -1) {
            clone.categories.push(category);
            clone.categories.sort((a, b) => (a > b) ? 1 : -1);
            setRecipe(clone);

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

    async function handleRemoveIngredient(ingredient) {
        let clone = { ...recipe };

        const index = clone.ingredients.map(c => { return c.name }).indexOf(ingredient.name);

        if(index != -1) {
            clone.ingredients.splice(index, 1);
            setRecipe(clone);

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

    async function handleRemoveCategory(category) {
        let clone = { ...recipe };

        const index = clone.categories.indexOf(category);

        if(index != -1) {
            clone.categories.splice(index, 1);
            setRecipe(clone);

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

    async function handleNameChange() {
        const name = nameRef?.current?.value;

        if(name != recipe.name) {
            const clone = { ...recipe };
            clone.name = name;
            setRecipe(clone);

            await putRecipeDetails();
        }
    }

    async function handleLinkChange() {
        const link = linkRef?.current?.value;

        if(link != recipe.link) {
            const clone = { ...recipe };
            clone.link = link;
            setRecipe(clone);

            await putRecipeDetails();
        }
    }

    async function putRecipeDetails() {
        if(putTimeout.current && putTimeout.current) {
            clearTimeout(putTimeout.current);
        }

        putTimeout.current = setTimeout(async () => {
            const body = { 
                method: RECIPE_API_PUT_DETAILS,
                recipe_id: recipe._id, 
                name: nameRef?.current?.value, 
                link: linkRef?.current?.value 
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
                    <div>
                        <h2>{recipe.name}</h2>
                    </div>
                    <div className="clickable">
                        <FontAwesomeIcon icon={faEdit} onClick={handleEdit} />
                    </div>
                </div>
                <div>
                    <a href={recipe.link} target="__blank">Recipe Link</a>
                </div>
                <div className="mb-20">
                    <div className="sub-section-title pt-10 pb-10">
                        Ingredients
                    </div>
                    {getIngredientsJSX()}
                    <div>
                        <button className="my-button" onClick={handleAddToList}>Add to list</button>
                    </div>
                </div>
                <div>
                    <div className="sub-section-title">
                        Categories
                    </div>
                    {getCategoryJSX()}
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
                        <h2>{recipe.name}</h2>
                    </div>
                    <div className="clickable">
                        <a onClick={handleView}>Back to view</a>
                    </div>
                </div>
                <div className="alert warning mb-10">
                    <b>Changes will Auto Save</b>
                    <div className="mt-20">
                        Changes are automatically saved as you modify fields, ingredients, or categories
                    </div>
                </div>
                <div className="my-form">
                    <div className="form-fieldset">
                        <div className="form-label">
                            Name
                        </div>
                        <div className="form-input">
                            <input ref={nameRef} onKeyUp={handleNameChange} type="text" defaultValue={recipe.name} />
                        </div>
                    </div>
                </div>
                <div className="my-form">
                    <div className="form-fieldset">
                        <div className="form-label">
                            Link
                        </div>
                        <div className="form-input">
                            <input ref={linkRef} onKeyUp={handleLinkChange} type="text" defaultValue={recipe.link} />
                        </div>
                    </div>
                </div>
                <div className="mb-20">
                    <div className="sub-section-title pt-10 pb-10">
                        Ingredients
                    </div>
                    {getIngredientsJSX()}
                    <div>
                        <MyTypeahead placeholder="Add an ingredient" type="groceries" onAdd={handleAddGrocery}></MyTypeahead>
                    </div>
                </div>
                <div>
                    <div className="sub-section-title">
                        Categories
                    </div>
                    {getCategoryJSX()}
                    <div>
                        <MyTypeahead placeholder="Add a category" type="categories" onAdd={handleAddCategory}></MyTypeahead>
                    </div>
                </div>
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
                    <div>
                        <button className="my-button" onClick={handleConfirmAddToList}>Confirm</button>
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
                                <div>
                                    {i.name}
                                </div>
                                <div>
                                    {mode == 'edit' && <FontAwesomeIcon className="clickable" icon={faTrash} onClick={() => handleRemoveIngredient(i)} />}
                                </div>
                                <div>
                                    {mode == 'add-to-list' && <div>
                                        {i.checked && <FontAwesomeIcon className="clickable" icon={faCheckSquare} onClick={() => toggleIngredientCheck(i)} />}
                                        {!i.checked && <FontAwesomeIcon className="clickable" icon={faSquare} onClick={() => toggleIngredientCheck(i)} />}
                                    </div>}
                                </div>
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
            {getJSX()}
            {getEditJSX()}
            {getAddToListJSX()}
        </div>
    );
}

export default RecipeByIdPage;