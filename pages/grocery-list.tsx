import React, { useState, useEffect, useRef } from 'react';
import GroceryList from '../components/GroceryList/GroceryList';
import StoreGroceryList from '../components/GroceryList/StoreGroceryList';
import { NextPageContext } from 'next';
import { myGet } from '../util/myGet';
import { env } from '../util/environment';

import { ToastContainer, toast } from 'react-toastify';

const getListApiUrl = env.apiUrl + 'list?method=getList';
const postClearGroceriesApiUrl = env.apiUrl + 'list';

const GroceryListPage = ({ initialList }) => {
    const [mode, setMode] = useState('list');
    const [list, setList] = useState(initialList);
    const [update, setUpdate] = useState(-1);
    const startToastId = React.useRef(null);

    useEffect(() => {
        const listMode = localStorage.getItem('list-mode');
        setMode(listMode);
    }, []);

    const notifyStart = () => startToastId.current = toast('Removing checked groceries...', {
        position: "bottom-center",
        hideProgressBar: true,
        closeOnClick: true,
        progress: undefined,
        className: 'warning'
    });

    const dismissStart = () => toast.dismiss(startToastId.current);

    const notifySuccess = () => startToastId.current = toast('Successfully removed groceries!', {
        position: "bottom-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        className: 'success'
    });

    const notifyError = () => startToastId.current = toast('Error removing groceries!', {
        position: "bottom-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        className: 'error'
    });

    function changeMode(mode) {
        localStorage.setItem('list-mode', mode);
        setMode(mode);
    }

    function listBtnClass() {
        let c = 'btn w-50';

        if (mode && mode !== 'list') {
            c += ' btn-inactive';
        }

        return c;
    }

    function storeBtnClass() {
        let c = 'btn w-50';

        if (mode !== 'store') {
            c += ' btn-inactive';
        }

        return c;
    }

    //
    // Clear the crossed off groceries
    //
    async function handleClearGroceries() {
        notifyStart();

        try {
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

            if (resp.status == 200) {
                setTimeout(() => {
                    dismissStart();
                    notifySuccess();
                }, 1000);

                setUpdate(new Date().getTime());
            } else {
                setTimeout(() => {
                    dismissStart();
                    notifyError();
                }, 1000);
            }
        } catch {
            dismissStart();
        }
    }

    return (
        <div className="max-width-page">
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
            <ToastContainer />
        </div>
    );
}

GroceryListPage.getInitialProps = async (ctx: NextPageContext) => {
    const json = await myGet(getListApiUrl, ctx);

    if (json) {
        return { initialList: json };
    }

    return { initialList: null };
}

export default GroceryListPage;