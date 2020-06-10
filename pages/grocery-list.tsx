import React, { useState } from 'react';
import GroceryList from '../components/GroceryList/GroceryList';
import StoreGroceryList from '../components/GroceryList/StoreGroceryList';
import { NextPageContext } from 'next';
import { myGet } from '../util/myGet';
import { env } from '../util/environment';
import MyTypeahead from '../components/Shared/MyTypeahead';

const apiUrl = env.apiUrl + 'list/getPrimaryListId';
const getListApiUrl = env.apiUrl + 'groceries/list';
const postGroceryApiUrl = env.apiUrl + 'list/addGrocery';

const GroceryListPage = ({ list }) => {
    const [mode, setMode] = useState('list');

    async function handleAddGrocery(value) {
        
        const grocery = list.groceries.find(g => g.name.trim().toLowerCase() == value.trim().toLowerCase());

        if(!grocery && value && value.trim().length > 0) {
            const body = {
                "list_id": list._id,
                "grocery": {
                    "name": value
                }
            };

            const resp = await fetch(postGroceryApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
    
            const response = await resp.json();
            console.log(response);
        } else {
            console.log('Grocery already on list...');
        }
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
    const json = await myGet(getListApiUrl, ctx);

    if(json && json.length > 0) {
        return { list: json[0] };
    }

    return { list: null };
}

export default GroceryListPage;