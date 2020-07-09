import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { env } from '../util/environment';
import { myGet } from '../util/myGet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Router from "next/router";
import { compare } from '../util/compare';

const apiUrl = env.apiUrl + 'recipes';

const RecipesPage = () => {
    const [recipes, setRecipes] = useState(null);

    useEffect(() => {
        let isCancelled = false;

        async function execute() {
            const data = await myGet(apiUrl, null);

            if (isCancelled == false) {
                data.recipes.sort(compare);
                setRecipes(data.recipes);
            }
        }

        execute();

        return () => {
            isCancelled = true;
        };
    }, []);

    function getLinkClass(r) {
        let c = "item item-hoverable clickable";

        if(r.clicked) {
            c += " item-clicked";
        }
        
        return c;
    }

    function handleRecipeClick(r) {
        const recipe = { ...r };
        const clone = recipes.slice();
        const index = recipes.indexOf(r);

        for(let i = 0; i < clone.length; i++) {
            if(i != index) {
                clone[i].clicked = false;
            } else {
                clone[i].clicked = true;
            }
        }
        
        setRecipes(clone);
    }

    function getJSX() {
        if (!recipes) {
            return <div>Loading...</div>;
        }

        if (recipes && recipes.length == 0) {
            return <div>No recipes</div>;
        }

        let jsx = null;

        jsx = recipes.map((r, index) => {
            return (
                <Link key={r._id} href={`/recipes/${r._id.toString()}`}>
                    <div onClick={() => handleRecipeClick(r)} className={'item item-hoverable clickable' + (r.clicked ? ' item-clicked' : '')} key={r.name}>
                        {r.name}
                    </div>
                </Link>
            );
        });

        return jsx
    }

    function handleNewClick() {
        Router.replace('/recipes/create');
    }

    return (
        <div>
            <div className="flex space-between">
                <div>
                    <h1>Recipes</h1>
                </div>
                <div className="clickable" onClick={handleNewClick}>
                    <FontAwesomeIcon icon={faPlus} />
                </div>
            </div>
            <div className="list">
                {getJSX()}
            </div>
        </div>
    );
}

export default RecipesPage;