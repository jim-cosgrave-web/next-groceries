import { useEffect, useState } from "react";
import { env } from "../../util/environment";
import { myGet } from "../../util/myGet";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import MyTypeahead from '../../components/Shared/MyTypeahead';

const apiUrl = env.apiUrl + 'recipes';

const RecipeByIdPage = () => {
    const [recipe, setRecipe] = useState(null);
    const [recipeNotFound, setRecipeNotFound] = useState(false);
    const [mode, setMode] = useState('view');

    const router = useRouter();

    useEffect(() => {
        const recipe_id = router.query.recipe_id;
        let isCancelled = false;

        async function execute() {
            const data = await myGet(`${apiUrl}?method=getById&id=${recipe_id}`, null);

            if (isCancelled == false) {
                if (data.recipe) {
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

    async function handleAddGrocery(grocery) {
        let clone = { ...recipe };

        let exists = clone.ingredients.find(i => i.name === grocery);

        if(!exists) {
            clone.ingredients.push({ name: grocery });
            clone.ingredients.sort((a, b) => (a.name > b.name) ? 1 : -1);
            setRecipe(clone);
        }
    }

    async function handleAddCategory(category) {
        let clone = { ...recipe };

        if(clone.categories.indexOf(category) == -1) {
            clone.categories.push(category);
            clone.categories.sort((a, b) => (a > b) ? 1 : -1);
            setRecipe(clone);
        }
    }

    async function handleRemoveIngredient(ingredient) {
        let clone = { ...recipe };

        const index = clone.ingredients.map(c => { return c.name }).indexOf(ingredient.name);

        if(index != -1) {
            clone.ingredients.splice(index, 1);
            setRecipe(clone);
        }
    }

    async function handleRemoveCategory(category) {
        let clone = { ...recipe };

        const index = clone.categories.indexOf(category);

        if(index != -1) {
            clone.categories.splice(index, 1);
            setRecipe(clone);
        }
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
                        <a onClick={handleView}>Cancel</a>
                    </div>
                </div>
                <div className="my-form">
                    <div className="form-fieldset">
                        <div className="form-label">
                            Name
                        </div>
                        <div className="form-input">
                            <input type="text" defaultValue={recipe.name} />
                        </div>
                    </div>
                </div>
                <div className="my-form">
                    <div className="form-fieldset">
                        <div className="form-label">
                            Link
                        </div>
                        <div className="form-input">
                            <input type="text" defaultValue={recipe.link} />
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
        </div>
    );
}

export default RecipeByIdPage;