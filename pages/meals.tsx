import React, { useEffect, useState, useRef } from 'react';
import { env } from '../util/environment';
import { myGet } from '../util/myGet';
import { USER_MEAL_API_GET, USER_MEAL_API_ADD, USER_MEAL_API_DELETE } from '../util/constants';
import { formatDate } from '../util/formatDate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import Confirm from '../components/Shared/Confirm';

const apiUrl = env.apiUrl + 'user';

const MealsPage = () => {
    const [meals, setMeals] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [mealToDelete, setMealToDelete] = useState(null);

    const newMealRef = useRef<HTMLInputElement>(null);
    const newNoteRef = useRef<HTMLInputElement>(null);

    //
    // Page load
    //
    useEffect(() => {
        let isCancelled = false;

        async function execute() {
            const data = await myGet(apiUrl + '?method=' + USER_MEAL_API_GET, null);

            if (isCancelled == false && data && data.meals) {
                if (data.meals.length > 0) {
                    // @ts-ignore: Not happy about new Date, but it works
                    data.meals = data.meals.sort((a, b) => new Date(b.addedOn) - new Date(a.addedOn));

                    setMeals(data.meals);
                } else {
                    //
                    // no recipes
                    //
                    setMeals([]);
                }
            }
        }

        execute();

        return () => {
            isCancelled = true;
        };
    }, []);

    //
    // Add a new recipe
    //
    async function handleAddRecipeClick() {
        const name = newMealRef?.current?.value;
        const note = newNoteRef?.current?.value;

        const exists = meals.map((m) => { return m.name; }).indexOf(name);

        if (exists === -1) {
            const meal = {
                _id: new Date().getTime(),
                name,
                note,
                addedOn: new Date()
            }

            const clone = meals.slice();
            clone.unshift(meal);
            setMeals(clone);

            const body = {
                method: USER_MEAL_API_ADD,
                meal
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

    function handleDeleteClick(meal) {
        setIsConfirmOpen(true);
        setMealToDelete(meal);
    }

    async function handleDeleteClickStep2() {
        const meal = mealToDelete;
        const clone = meals.slice();
        const index = meals.map((m) => { return m.name; }).indexOf(meal.name);
        clone.splice(index, 1);

        setMeals(clone);
        setIsConfirmOpen(false);
        setMealToDelete(null);

        const body = {
            method: USER_MEAL_API_DELETE,
            meal
        };

        const resp = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const json = await resp.json();

        console.log(json);
    }

    //
    // Get JSX
    //
    function getJSX() {
        if (!meals) {
            return <div>Loading...</div>
        }

        return (
            <div>
                <div className="list">
                    <div className="item flex space-between">
                        <div className="w-75">
                            <div>
                                <input type="text" ref={newMealRef} className="form-control" placeholder="Meal Name"></input>
                            </div>
                            <div className="mt-10">
                                <input type="text" ref={newNoteRef} className="form-control" placeholder="Notes"></input>
                            </div>
                        </div>
                        <div>
                            <button className="my-button" onClick={handleAddRecipeClick}>Add</button>
                        </div>
                    </div>
                    {meals.map((m, index) => {
                        return (
                            <div className="item flex space-between" key={m._id}>
                                <div>
                                    <div className="title">
                                        {m.name}
                                    </div>
                                    <div className="mt-10">
                                        Added on: {formatDate(m.addedOn)}
                                    </div>
                                    {m.note && <div className="mt-10">
                                        {m.note}
                                    </div>}
                                </div>
                                <div className="clickable" onClick={() => handleDeleteClick(m)}>
                                    <FontAwesomeIcon icon={faTrash} />
                                </div>
                            </div>
                        );
                    })}
                </div>
                {meals.length === 0 && <div className="alert warning mb-10 mt-10">
                    <b>You dont have any meals.</b>
                    <div className="mt-20">
                        Please use the input above to enter a meal for this week
                    </div>
                </div>}
            </div>
        );
    }

    return (
        <div>
            <h1>Meals</h1>
            <div>
                {getJSX()}
            </div>

            <div>
                <Confirm
                    isOpen={isConfirmOpen}
                    onConfirm={handleDeleteClickStep2}
                    onClose={() => setIsConfirmOpen(false)}
                />
            </div>
        </div>
    );
}

export default MealsPage;