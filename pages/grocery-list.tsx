import React, { useState } from 'react';
import GroceryList from '../components/GroceryList/GroceryList';
import StoreGroceryList from '../components/GroceryList/StoreGroceryList';
import { NextPageContext } from 'next';
import { myGet } from '../util/myGet';
import { env } from '../util/environment';
import MyTypeahead from '../components/Shared/MyTypeahead';

const apiUrl = env.apiUrl + 'list/getPrimaryListId';

const GroceryListPage = ({ data }) => {
    const [mode, setMode] = useState('list');

    async function handleAddGrocery(value) {
        console.log('Adding...', value);
    }

    return (
        <div>
            <h1>Groceries</h1>
            <button onClick={() => setMode('list')}>List</button>
            <button onClick={() => setMode('store')}>Store</button>

            <div className="mt-10 mb-10">
                <MyTypeahead placeholder="Add a grocery" type="groceries" onAdd={handleAddGrocery}></MyTypeahead>
            </div>
            <div>
                {
                    mode == 'list' ? <GroceryList></GroceryList> : <StoreGroceryList></StoreGroceryList>
                }
            </div>
        </div>
    );
}

GroceryListPage.getInitialProps = async (ctx: NextPageContext) => {
    const json = await myGet(apiUrl, ctx);
    return { data: json };
}

export default GroceryListPage;