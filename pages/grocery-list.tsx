import React, { useState, useEffect, useRef } from 'react';
import GroceryList from '../components/GroceryList/GroceryList';
import StoreGroceryList from '../components/GroceryList/StoreGroceryList';
import { NextPageContext } from 'next';
import { myGet } from '../util/myGet';
import { env } from '../util/environment';
import MyTypeahead from '../components/Shared/MyTypeahead';

const getListApiUrl = env.apiUrl + 'list?method=getList';
const postClearGroceriesApiUrl = env.apiUrl + 'list';

const GroceryListPage = ({ initialList }) => {
    const [mode, setMode] = useState('list');
    const [list, setList] = useState(initialList);
    const [update, setUpdate] = useState(-1);

    function changeMode(mode) {
        localStorage.setItem('list-mode', mode);
        setMode(mode);
    }

    function listBtnClass() {
        let c = 'btn w-50';

        if(mode !== 'list') {
            c += ' btn-inactive';
        }

        return c;
    }

    function storeBtnClass() {
        let c = 'btn w-50';

        if(mode !== 'store') {
            c += ' btn-inactive';
        }

        return c;
    }

    //
    // Clear the crossed off groceries
    //
    async function handleClearGroceries() {
        const body = {
            "method": "clear-groceries",
            "list_id": list._id
        };

        const resp = await fetch(postClearGroceriesApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const response = await resp.json();

        setUpdate(new Date().getTime());
    }

    return (
        <div>
            <h1>Groceries</h1>
            <div className="btn-group">
                <button className={listBtnClass()} onClick={() => changeMode('list')}>List</button>
                <button className={storeBtnClass()} onClick={() => changeMode('store')}>Store</button>
            </div>
            <div className="mt-10">
                <button className="btn w-100 danger" onClick={handleClearGroceries}>Clear Groceries</button>
            </div>
            <div>
                {
                    mode == 'list' ? <GroceryList updateTime={update}></GroceryList> : <StoreGroceryList updateTime={update} listId={initialList._id}></StoreGroceryList>
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