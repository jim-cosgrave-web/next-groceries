import React, { useState, useEffect } from 'react';
import fetch from 'isomorphic-unfetch';
import { env } from '../../util/environment';
import MyTypeahead from './MyTypeahead';
import { myGet } from '../../util/myGet';
import { SUBSCRIBE_TO_STORE_API_METHOD } from '../../util/constants';

//const updateGroceryUrl = env.apiUrl + 'list';
const getStoresApiUrl = env.apiUrl + 'user?method=getStores';
const postUserApiUrl = env.apiUrl + 'user';

const SubscribeToStore = (props) => {
    const [subbedStores, setSubbedStores] = useState(null);

    useEffect(() => {
        async function execute() {
            let getStoresResponse = await myGet(getStoresApiUrl, null);
            
            setSubbedStores(getStoresResponse.stores);
        }

        execute();
    }, []);

    //
    // Handle the event when the user chooses a new store to subscribe to
    //
    async function handleStoreSubscription(value) {
        const body = {
            method: SUBSCRIBE_TO_STORE_API_METHOD,
            store_id: value.id,
            name: value.label
        };

        const resp = await fetch(postUserApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const json = await resp.json();

        setSubbedStores(json.stores);
    }

    function getHTML() {
        return (
            <div>
                {subbedStores && subbedStores.length == 0 && <div className="alert warning mb-10">
                    <b>You are not currently subscribed to any stores.</b>
                    <div className="mt-5">
                        Please use the search bar below to subscribe to a store and get shopping!
                    </div>
                </div>}
                {subbedStores && subbedStores.length > 0 && <div>
                    Current stores
                </div>}
                <div>
                    <MyTypeahead placeholder="Find a store near you" type="store" onAdd={handleStoreSubscription}></MyTypeahead>
                </div>
            </div>
        );
    }

    return (
        <div className="store-sub-container">
            {getHTML()}
        </div>
    );
};

export default SubscribeToStore;