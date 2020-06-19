import React, { useEffect, useState } from 'react';
import { env } from '../../../util/environment';
import { useRouter } from 'next/router';
import { myGet } from '../../../util/myGet';

const storeApiUrl = env.apiUrl + 'store';
const storeDetailApiUrl = env.apiUrl + 'store?method=getStoreDetails';

const AdminStoreByIdPage = () => {
    const [store, setStore] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const store_id = router.query.store_id;

        let isCancelled = false;

        async function execute() {
            const storeResp = await myGet(storeDetailApiUrl + '&store_id=' + store_id, null);

            if (isCancelled == false) {
                setStore(storeResp.store);
            }
        }

        if (store_id) {
            execute();
        }

        return () => {
            isCancelled = true;
        };
    }, [router.query.store_id]);

    function getJSX() {
        if(!store) {
            return <div>Loading...</div>
        }

        let jsx = store.categories.map((c, index) => {
            return (
                <div key={c.name + "-" + index} className="category-container">
                    <div className="category-name">
                        {c.name}
                    </div>
                    <div className="grocery-container">
                        {c.groceries.map((g, gIndex) => {
                            return (
                                <div className="admin-grocery">
                                    {g.groceryName}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        });

        return jsx;
    }

    return (
        <div>
            <h1>Admin Stores Page With ID</h1>
            <div className="flex align-top">
                {getJSX()}
            </div>
        </div>
    );
}

export default AdminStoreByIdPage;