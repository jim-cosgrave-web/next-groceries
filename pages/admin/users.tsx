import React, { useEffect, useState, useRef } from 'react';
import { myGet } from '../../util/myGet';
import { env } from '../../util/environment';
import { formatDate } from '../../util/formatDate';

const apiUrl = env.apiUrl + 'user';

const AdminUsersPage = () => {
    const [users, setUsers] = useState(null);
    const [visibleUsers, setVisibleUsers] = useState(null);
    const searchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        let isCancelled = false;

        async function execute() {
            const data = await myGet(apiUrl + '?method=adminUsers', null);

            if (isCancelled == false && data && data.users) {
                for(let i = 0; i < data.users.length; i++) {
                    data.users[i].dtLastLogin = new Date(data.users[i].lastLogin)
                }

                data.users = data.users.sort((a, b) => b.dtLastLogin - a.dtLastLogin);

                setUsers(data.users);
                setVisibleUsers(data.users);
            }
        }

        execute();

        return () => {
            isCancelled = true;
        };
    }, []);

    function handleSearch() {
        let searchTerm = searchRef?.current?.value;

        if (!searchTerm || searchTerm.length == 0) {
            setVisibleUsers(users);
            return;
        }

        const clone = users.slice();
        searchTerm = searchTerm.trim().toLowerCase();

        let visible = [];

        for(let i = 0; i < clone.length; i++) {
            let user = clone[i];

            if(user.username.trim().toLowerCase().indexOf(searchTerm) > -1
                || user.email.trim().toLowerCase().indexOf(searchTerm) > -1
                || user.name.trim().toLowerCase().indexOf(searchTerm) > -1) {
                visible.push(user);
            }
        }

        setVisibleUsers(visible);
    }

    function getJSX() {
        if (!users || users.length == 0) {
            return <div>Loading...</div>;
        }

        if(!visibleUsers || visibleUsers.length == 0) {
            return <div>Nothing found...</div>
        }

        let jsx = visibleUsers.map((u, index) => {
            return (
                <div key={u._id} className="item">
                    <div className="mb-10">
                        {u.name}
                    </div>
                    {/* <div className="mb-10">
                        {u.username}
                    </div> */}
                    <div className="mb-10">
                        {u.email}
                    </div>
                    <div className="mb-10">
                        Created On: {formatDate(u.createdOn)}
                    </div>
                    <div className="mb-10">
                        Last Login: {formatDate(u.lastLogin)}
                    </div>
                    <div>
                        Last Use: {formatDate(u.lastUse)}
                    </div>
                </div>
            );
        });

        return jsx;
    }

    return (
        <div>
            <h1>Admin Users</h1>
            <div className="mb-20">
                <input ref={searchRef} onKeyUp={handleSearch} type="text" className="form-control" placeholder="Search" />
            </div>
            <div className="list">
                {getJSX()}
            </div>
        </div>
    );
}

export default AdminUsersPage;