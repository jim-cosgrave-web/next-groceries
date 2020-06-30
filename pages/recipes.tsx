import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { env } from '../util/environment';
import { myGet } from '../util/myGet';

const apiUrl = env.apiUrl + 'recipes';

const RecipesPage = () => {
    const [recipes, setRecipes] = useState(null);

    useEffect(() => {
        let isCancelled = false;

        async function execute() {
            const data = await myGet(apiUrl, null);

            if (isCancelled == false) {
                setRecipes(data.recipes);
            }
        }

        execute();

        return () => {
            isCancelled = true;
        };
    }, []);

    function getJSX() {
        if(!recipes) {
            return <div>Loading...</div>;
        }

        if(recipes && recipes.length == 0) {
            return <div>No recipes</div>;
        }

        let jsx = null;

        jsx = recipes.map((r, index) => {
            return (
                <Link key={r._id} href={`/recipes/${r._id.toString()}`}>
                    <div className="item clickable" key={r.name}>
                        {r.name}
                    </div>
                </Link>
            );
        });

        return jsx
    }

    return (
        <div>
            <h1>Recipes Page</h1>
            <div className="list">
                {getJSX()}
            </div>           
        </div>
    );
}

export default RecipesPage;