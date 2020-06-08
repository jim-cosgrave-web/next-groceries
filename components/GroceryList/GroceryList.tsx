import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { myGet } from '../../util/myGet';
import { env } from '../../util/environment';
import Grocery from './Grocery';

const apiUrl = env.apiUrl + 'groceries/list';

const GroceryList = (props) => {
    const [list, setList] = useState(null)
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

export default GroceryList;