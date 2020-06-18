import React, { useEffect, useState } from 'react';
import { env } from '../../../util/environment';
import { useRouter } from 'next/router';

const storeApiUrl = env.apiUrl + 'store';

const AdminStoreByIdPage = () => {
    //const [stores, setStores] = useState(null);
    const router = useRouter();
    const { store_id } = router.query;

    useEffect(() => {
        let isCancelled = false;

        async function execute() {
            //const data = await getStores();

            if (isCancelled == false) {
                //setStores(data.stores);
            }
        }

        execute();

        return () => {
            isCancelled = true;
        };
    }, []);

    return (
        <div>
            <h1>Admin Stores Page With ID</h1>
            <div className="list">
                {store_id}
            </div>
        </div>
    );
}

export default AdminStoreByIdPage;