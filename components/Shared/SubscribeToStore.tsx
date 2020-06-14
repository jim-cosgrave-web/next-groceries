import React, { useState, useEffect } from 'react';
import fetch from 'isomorphic-unfetch';
import { env } from '../../util/environment';
import MyTypeahead from './MyTypeahead';
import { myGet } from '../../util/myGet';
import { SUBSCRIBE_TO_STORE_API_METHOD } from '../../util/constants';

//const updateGroceryUrl = env.apiUrl + 'list';
const getStoresApiUrl = env.apiUrl + 'user?method=getStores';
const postUserApiUrl = env.apiUrl + 'user';

const offline = true;

const SubscribeToStore = (props) => {
    const [subbedStores, setSubbedStores] = useState(null);

    useEffect(() => {
        async function execute() {
            let getStoresResponse = await myGet(getStoresApiUrl, null);

            setSubbedStores(getStoresResponse.stores);
        }

        if (!offline) {
            execute();
        } else {
            setSubbedStores([
                { _id: '123abc', name: 'Aldi (Lemont IL)' },
                { _id: '456def', name: 'Jewel (Lemont IL)' }
            ]);
        }
    }, []);

    //
    // Handle the event when the user chooses a new store to subscribe to
    //
    async function handleStoreSubscription(store) {
        const clone = subbedStores.slice();
        const existing = clone.find(s => s._id.toString() == store.id);

        if (!existing) {
            if (!offline) {
                const body = {
                    method: SUBSCRIBE_TO_STORE_API_METHOD,
                    store_id: store.id,
                    name: store.label
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

                if(typeof(props.onSubscribe) === 'function') {
                    props.onSubscribe(json.stores[0]);
                }
            } else {
                const newStore = { _id: store.id, name: store.label };

                clone.push(newStore);
                setSubbedStores(clone);
            }
        }
    }

    function handleUnsubscribeClick(store) {
        let clone = subbedStores.slice();
        const index = clone.indexOf(store);

        clone.splice(index, 1);
        setSubbedStores(clone);
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
                    <div>
                        <h3>Currently Subscribed To</h3>
                        <div>
                            <div className="list">
                                {subbedStores.map((s, index) => {
                                    return (
                                        <div className="item" key={s._id}>
                                            <div className="flex space-between">
                                                <div>
                                                    {s.name}
                                                </div>
                                                <div className="clickable" onClick={() => handleUnsubscribeClick(s)}>
                                                    Unsubscribe
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="alert warning mb-10 mt-10">
                        To subscribe to more stores, use the search bar below.
                    </div>
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