import React, { useState } from 'react';
import Link from 'next/link';
import { myGet } from '../../util/myGet';
import { env } from '../../util/environment';

const groceryApiUrl = env.apiUrl + 'groceries';

const AdminPage = () => {
    const [syncing, setSyncing] = useState(false);

    async function handleSyncGroceriesClick() {
        setSyncing(true);
        const resp = await myGet(groceryApiUrl + '?method=sync', null);
        setSyncing(false);
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
                <div className="admin-card clickable mt-20" onClick={handleSyncGroceriesClick}>
                    <div className="nav-item">
                        Sync Groceries
                    </div>
                </div>
            </div>
            {syncing && <div className="mt-20">
                Syncing groceries...
            </div>}
        </div>
    );
}

export default AdminPage;