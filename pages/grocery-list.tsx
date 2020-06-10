import React, { useState } from 'react';
import GroceryList from '../components/GroceryList/GroceryList';
import StoreGroceryList from '../components/GroceryList/StoreGroceryList';
import { NextPageContext } from 'next';
import { myGet } from '../util/myGet';
import { env } from '../util/environment';
import MyTypeahead from '../components/Shared/MyTypeahead';

const apiUrl = env.apiUrl + 'list/getPrimaryListId';
const getListApiUrl = env.apiUrl + 'groceries/list';


const GroceryListPage = ({ initialList }) => {
    const [mode, setMode] = useState('list');
    const [list, setList] = useState(initialList);

    return (
        <div>
            <h1>Groceries</h1>
            <div className="btn-group">
                <button className="btn w-50" onClick={() => setMode('list')}>List</button>
                <button className="btn w-50" onClick={() => setMode('store')}>Store</button>
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
        return { initialList: json[0] };
    }

    return { initialList: null };
}

export default GroceryListPage;