import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { myGet } from '../../util/myGet';
import { env } from '../../util/environment';
import Grocery from './Grocery';
import { GroceryList } from '../../models/grocery-list';

const apiUrl = env.apiUrl + 'groceries/list';

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

    async function getListData() {
        let json = await myGet(apiUrl, null);

        if (json && json.length > 0) {
            json = json[0];
        }
    
        return json;
    }

    function getListItemsHTML() {
        if (!list || !list.groceries) {
            return null;
        }

        let html = list && list.groceries && list.groceries.map((g, index) => {
            return (
                <Grocery
                    grocery={g}
                    list_id={list._id.toString()}
                    key={g.name + '_' + g.checked}>
                </Grocery>
            );
        });

        return html;
    }

    return (
        <div className="grocery-list">
            Grocery List
            <div className="list">
                {getListItemsHTML()}
            </div>
        </div>
    );
};

export default GroceryListComponent;