import { useEffect, useState } from "react";
import { env } from "../../util/environment";
import { myGet } from "../../util/myGet";
import { useRouter } from "next/router";

const apiUrl = env.apiUrl + 'recipes';

const RecipeByIdPage = () => {
    const [recipe, setRecipe] = useState(null);
    const [recipeNotFound, setRecipeNotFound] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const recipe_id = router.query.recipe_id;
        let isCancelled = false;

        async function execute() {
            const data = await myGet(`${apiUrl}?method=getById&id=${recipe_id}`, null);
            console.log(data);

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
                <h2>{recipe.name}</h2>
            </div>
        );

        return jsx;
    }

    return (
        <div>
            {getJSX()}
        </div>
    );
}

export default RecipeByIdPage;