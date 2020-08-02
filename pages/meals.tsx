import React, { useEffect, useState } from 'react';
import { env } from '../util/environment';
import { myGet } from '../util/myGet';
import { USER_MEAL_API_GET } from '../util/constants';
import { formatDate } from '../util/formatDate';

const apiUrl = env.apiUrl + 'user';

const MealsPage = () => {
    const [meals, setMeals] = useState(null);

    //
    // Page load
    //
    useEffect(() => {
        let isCancelled = false;

        async function execute() {
            const data = await myGet(apiUrl + '?method=' + USER_MEAL_API_GET, null);

            if (isCancelled == false && data && data.meals) {
                if(data.meals.length > 0) {
                    setMeals(data.meals);
                } else {
                    //
                    // no recipes
                    //
                }
            }
        }

        execute();

        return () => {
            isCancelled = true;
        };
    }, []);

    //
    // Get JSX
    //
    function getJSX() {
        if(!meals) {
            return <div>Loading...</div>
        }

        return (
            <div className="list">
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
                            </div>
                            <div>
                                Actions
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div>
            <h1>Meals</h1>
            <div>
                {getJSX()}
            </div>
        </div>
    );
}

export default MealsPage;