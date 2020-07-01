import { useEffect, useState } from "react";
import { env } from "../../util/environment";
import { myGet } from "../../util/myGet";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

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
                        {mode == 'view' && <FontAwesomeIcon icon={faEdit} onClick={handleEdit} />}
                        {mode == 'edit' && <a onClick={handleView}>Cancel</a>}
                    </div>
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

    function getIngredientsJSX() {
        if (!recipe || !recipe.ingredients) {
            return <div>No Ingredients</div>;
        }

        let jsx = (
            <div className="list">
                {recipe.ingredients.map((i, index) => {
                    return (
                        <div className="item" key={i.name}>{i.name}</div>
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
                        <div className="item" key={c}>{c}</div>
                    );
                })}
            </div>);

        return jsx;
    }

    return (
        <div>
            {getJSX()}
        </div>
    );
}

export default RecipeByIdPage;