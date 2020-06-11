import React, { useState, useEffect } from 'react';
import GroceryList from '../components/GroceryList/GroceryList';
import StoreGroceryList from '../components/GroceryList/StoreGroceryList';
import { NextPageContext } from 'next';
import { myGet } from '../util/myGet';
import { env } from '../util/environment';
import MyTypeahead from '../components/Shared/MyTypeahead';

const getListApiUrl = env.apiUrl + 'list?method=getList';


const GroceryListPage = ({ initialList }) => {
    const [mode, setMode] = useState('list');
    const [list, setList] = useState(initialList);

    function changeMode(mode) {
        localStorage.setItem('list-mode', mode);
        setMode(mode);
    }

    return (
        <div>
            <h1>Groceries</h1>
            <div className="btn-group">
                <button className="btn w-50" onClick={() => changeMode('list')}>List</button>
                <button className="btn w-50" onClick={() => changeMode('store')}>Store</button>
            </div>
            <div>
                {
                    mode == 'list' ? <GroceryList></GroceryList> : <StoreGroceryList listId={initialList._id}></StoreGroceryList>
                }
            </div>
        </div>
    );
}

GroceryListPage.getInitialProps = async (ctx: NextPageContext) => {
    const json = await myGet(getListApiUrl, ctx);

    if(json) {
        return { initialList: json };
    }

    return { initialList: null };
}

export default GroceryListPage;