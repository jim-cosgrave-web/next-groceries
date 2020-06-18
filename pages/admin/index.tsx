import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faListOl, faSignOutAlt, faBook, faLink, faLock } from '@fortawesome/free-solid-svg-icons';

const AdminPage = () => {

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
            </div>
        </div>
    );
}

export default AdminPage;