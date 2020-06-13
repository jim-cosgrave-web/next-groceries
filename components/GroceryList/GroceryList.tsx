import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { myGet } from '../../util/myGet';
import { env } from '../../util/environment';
import Grocery from './Grocery';
import { GroceryList } from '../../models/grocery-list';
import MyTypeahead from '../Shared/MyTypeahead';
import { compare } from '../../util/compare';

const apiUrl = env.apiUrl + 'list?method=getList';
const postGroceryApiUrl = env.apiUrl + 'list';

const GroceryListComponent = (props) => {
    const [list, setList] = useState<GroceryList>(null)
    const router = useRouter();

    useEffect(() => {
        async function execute() {
            const data = await getListData();
            setList(data);
        }

        execute();
    }, []);

    useEffect(() => {
        async function execute() {
            const data = await getListData();
            setList(data);
        }

        execute();
    }, [props.updateTime]);

    async function getListData() {
        let json = await myGet(apiUrl, null);

        if (json && json.length > 0) {
            json = json[0];
        }

        return json;
    }

    function getListItemsHTML() {
        if (!list || !list.groceries) {
            return <div>Loading...</div>;
        }

        let html = null;

        if (list.groceries.length > 0) {
            html = list && list.groceries && list.groceries.map((g, index) => {
                return (
                    <Grocery
                        grocery={g}
                        list_id={list._id.toString()}
                        key={g.name + '_' + g.checked}>
                    </Grocery>
                );
            });
        } else {
            return <div>Add some groceries!</div>
        }

        return html;
    }

    async function handleAddGrocery(value) {

        const grocery = list.groceries.find(g => g.name.trim().toLowerCase() == value.trim().toLowerCase());

        if (!grocery && value && value.trim().length > 0) {
            const body = {
                "list_id": list._id,
                "grocery": {
                    "name": value
                }
            };

            list.groceries.push(grocery);
            list.groceries.sort(compare);

            const resp = await fetch(postGroceryApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            const response = await resp.json();

            setList(response);
        } else {
            console.log('Grocery already on list...');
        }
    }

    return (
        <div>
            <div className="mt-10 mb-10">
                <MyTypeahead placeholder="Add a grocery" type="groceries" onAdd={handleAddGrocery}></MyTypeahead>
            </div>

            <div className="grocery-list">
                <div className="list">
                    {getListItemsHTML()}
                </div>
            </div>
        </div>
    );
};

export default GroceryListComponent;