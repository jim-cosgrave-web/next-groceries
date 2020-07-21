import React, { useEffect, useState, useRef } from 'react';
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
    const [visibleRecipes, setVisibleRecipes] = useState(null);
    const searchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        searchRef.current.value = '';
        let isCancelled = false;

        async function execute() {
            const data = await myGet(apiUrl, null);

            if (isCancelled == false) {
                data.recipes.sort(compare);
                setRecipes(data.recipes);
                setVisibleRecipes(data.recipes);
            }
        }

        execute();

        return () => {
            isCancelled = true;
        };
    }, []);

    function getLinkClass(r) {
        let c = "item item-hoverable clickable";

        if (r.clicked) {
            c += " item-clicked";
        }

        return c;
    }

    function handleRecipeClick(r) {
        const recipe = { ...r };
        const clone = recipes.slice();
        const index = recipes.indexOf(r);

        for (let i = 0; i < clone.length; i++) {
            if (i != index) {
                clone[i].clicked = false;
            } else {
                clone[i].clicked = true;
            }
        }

        setRecipes(clone);
    }

    function handleNewClick() {
        Router.replace('/recipes/create');
    }

    function handleSearch() {
        let searchTerm = searchRef?.current?.value;

        if (!searchTerm || searchTerm.length == 0) {
            setVisibleRecipes(recipes);
            return;
        }

        const clone = recipes.slice();
        searchTerm = searchTerm.trim().toLowerCase();

        let visible = [];

        for (let i = 0; i < clone.length; i++) {
            let recipe = clone[i];

            if (recipe.name.trim().toLowerCase().indexOf(searchTerm) > -1) {
                visible.push(recipe);
            } else {
                for (let j = 0; j < recipe.categories.length; j++) {
                    if (recipe.categories[j].trim().toLowerCase().indexOf(searchTerm) > -1) {
                        visible.push(recipe);
                        break;
                    }
                }
            }
        }

        setVisibleRecipes(visible);
    }

    function getJSX() {
        if (!recipes) {
            return <div>Loading...</div>;
        }

        if (!visibleRecipes || visibleRecipes.length == 0) {
            return <div>Nothing found...</div>;
        }

        if (recipes && recipes.length == 0) {
            return (
                <div className="alert warning mb-10">
                    <b>No Recipes</b>
                    <div className="mt-20">
                        Click the "+" icon above to create a new recipe
                    </div>
                </div>
            );
        }

        let jsx = null;

        jsx = visibleRecipes.map((r, index) => {
            return (
                <Link key={r._id} href={`/recipes/${r._id.toString()}`}>
                    <div className={'item item-hoverable clickable' + (r.clicked ? ' item-clicked' : '')}>
                        
                            <div onClick={() => handleRecipeClick(r)} key={r.name}>
                                {r.name}
                            </div>
                            <div className="flex mt-10">
                            {r.categories.map((c, cIndex) => {
                                return (
                                    <div className="mr-10 tag" key={c}>
                                        {c}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </Link>
            );
        });

        return jsx
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
            <div className="mb-10">
                <input ref={searchRef} type="text" className="form-control" placeholder="Search by name or keywords" onKeyUp={handleSearch} />
            </div>
            <div className="list">
                {getJSX()}
            </div>
        </div>
    );
}

export default RecipesPage;