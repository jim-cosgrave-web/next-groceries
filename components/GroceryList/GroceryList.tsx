import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { myGet } from '../../util/myGet';
import { env } from '../../util/environment';
import Grocery from './Grocery';
import { GroceryList } from '../../models/grocery-list';
import MyTypeahead from '../Shared/MyTypeahead';
import { compare } from '../../util/compare';
import { LOCAL_STORAGE_A_Z_LIST } from '../../util/constants';
import { simpleHash } from '../../util/simpleHash';

const apiUrl = env.apiUrl + 'list?method=getList';
const postGroceryApiUrl = env.apiUrl + 'list';

const GroceryListComponent = (props) => {
    const [list, setList] = useState<GroceryList>(null);
    const router = useRouter();

    useEffect(() => {
        let isCancelled = false;

        async function execute() {
            const state = await getState();

            if(state && isCancelled == false) {
                setList(state);
            } 

            const data = await getListData();

            if (isCancelled == false) {
                saveState(data);
            }
        }

        execute();

        return () => {
            isCancelled = true;
        };
    }, []);

    useEffect(() => {
        let isCancelled = false;

        async function execute() {
            const data = await getListData();

            if (isCancelled == false) {
                //setList(data);
                saveState(data);
            }
        }

        if (props.updateTime != -1) {
            execute();
        }

        return () => {
            isCancelled = true;
        };
    }, [props.updateTime]);

    async function getListData() {
        let json = await myGet(apiUrl, null);
        json.groceries.sort(compare);

        return json;
    }

    function saveState(state) {
        setList(state);
        localStorage.setItem(LOCAL_STORAGE_A_Z_LIST, JSON.stringify(state));
    }

    async function getState() {
        const state = JSON.parse(localStorage.getItem(LOCAL_STORAGE_A_Z_LIST));
        return state;
    }

    async function clearState() {
        localStorage.setItem(LOCAL_STORAGE_A_Z_LIST, JSON.stringify(null));
    }

    function handleGroceryUpdate(grocery) {
        if(typeof(props.onGroceryUpdate) === 'function') {
            props.onGroceryUpdate(grocery);
        }
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
                        onUpdate={handleGroceryUpdate}
                        grocery={g}
                        list_id={list._id.toString()}
                        key={g.hash ? g.hash : g.name}>
                    </Grocery>
                );
            });
        } else {
            return (
                <div className="alert warning mb-10">
                    <b>Nothing on your list</b>
                    <div className="mt-20">
                        Add some groceries to get shopping
                    </div>
                </div>
            );
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

            const clone = { ...list };

            let key = `${value}_checked_note`;
            let hashKey = simpleHash(key);

            clone.groceries.push({ name: value, checked: false, note: '', hash: hashKey });
            clone.groceries.sort(compare);

            setList(clone);

            const resp = await fetch(postGroceryApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            const response = await resp.json();

            //setList(response);
            saveState(response);

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