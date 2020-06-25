import React, { useEffect, useState } from 'react';
import { myGet } from '../../util/myGet';
import { env } from '../../util/environment';
import Link from 'next/link';

const storeApiUrl = env.apiUrl + 'store';

const AdminStoresPage = () => {
    const [stores, setStores] = useState(null);

    useEffect(() => {
        let isCancelled = false;

        async function execute() {
            const data = await getStores();

            if (isCancelled == false) {
                setStores(data.stores);
            }
        }

        execute();

        return () => {
            isCancelled = true;
        };
    }, []);

    async function getStores() {
        const json = await myGet(storeApiUrl, null);

        return json;
    }

    function getStoresJSX() {
        if (!stores || stores.length == 0) {
            return <div>Loading...</div>;
        }

        let jsx = stores.map((s, index) => {
            return (
                <Link key={s._id} href={`/admin/stores/${s._id.toString()}`}>
                    <div className="item clickable" key={index}>
                        {s.name} ({s.city} {s.state})
                    </div>
                </Link>
            );
        });

        return jsx;
    }

    return (
        <div>
            <h1>Admin Stores Page</h1>
            <div className="list">
                {getStoresJSX()}
            </div>
        </div>
    );
}

export default AdminStoresPage;