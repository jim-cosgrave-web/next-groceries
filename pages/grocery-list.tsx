import React, { useState } from 'react';
import { NextPageContext } from 'next';
import { myGet } from '../util/myGet';
import { env } from '../util/environment';

const apiUrl = env.apiUrl + 'groceries/list';

const GroceryList = ({ list }) => {
    function getListItemsHTML() {
        if (!list || !list.groceries) {
            return null;
        }

        let html = list && list.groceries && list.groceries.map((g, index) => {
            return (
                <div className="item" key={g.name + '_' + g.checked}>
                    {g.name}
                    {g.note && g.note.length > 0 && <div>{g.note}</div>}
                </div>
            );
        });

        return html;
    }

    return (
        <div>
            <h1>Groceries</h1>
            {/* <pre>
                {JSON.stringify(list, null, 2)}
            </pre> */}
            <div>
                <div className="list">
                    {getListItemsHTML()}
                </div>
            </div>
        </div>
    );
}

GroceryList.getInitialProps = async (ctx: NextPageContext) => {
    let json = await myGet(apiUrl, ctx);

    if (json && json.length > 0) {
        json = json[0];
    }

    return { list: json };
}

export default GroceryList;