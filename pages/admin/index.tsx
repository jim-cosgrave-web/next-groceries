import React, { useState } from 'react';
import Link from 'next/link';
import { myGet } from '../../util/myGet';
import { env } from '../../util/environment';

const groceryApiUrl = env.apiUrl + 'groceries';

const AdminPage = () => {
    const [loading, setLoading] = useState(false);

    async function handleSyncGroceriesClick() {
        setLoading(true);
        const resp = await myGet(groceryApiUrl + '?method=sync', null);
        setLoading(false);
        console.log(resp);
    }

    async function handleCleanGroceriesClick() {
        setLoading(true);
        const resp = await myGet(groceryApiUrl + '?method=clean', null);
        setLoading(false);
        console.log(resp);
    }

    return (
        <div>
            <h1>Admin Page</h1>
            <div className="flex space-between">
                <Link href="/admin/stores">
                    <div className="admin-card clickable">
                        <div className="nav-item">
                            <a>Stores</a>
                        </div>
                    </div>
                </Link>
                <Link href="/admin/groceries">
                    <div className="admin-card clickable">
                        <div className="nav-item">
                            <a>Groceries</a>
                        </div>
                    </div>
                </Link>
                <div className="admin-card clickable mt-20" onClick={handleSyncGroceriesClick}>
                    <div className="nav-item">
                        Sync Groceries
                    </div>
                </div>
                <div className="admin-card clickable mt-20" onClick={handleCleanGroceriesClick}>
                    <div className="nav-item">
                        Clean Groceries
                    </div>
                </div>
            </div>
            {loading && <div className="mt-20">
                Doing stuff...
            </div>}
        </div>
    );
}

export default AdminPage;