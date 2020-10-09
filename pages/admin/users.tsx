import React, { useEffect, useState, useRef } from 'react';
import { myGet } from '../../util/myGet';
import { env } from '../../util/environment';
import { formatDate } from '../../util/formatDate';
import { ADMIN_API_CHANGE_USER_PASSWORD, ADMIN_API_DELETE_USER } from '../../util/constants';
import Confirm from '../../components/Shared/Confirm';
import user from '../api/user';

const apiUrl = env.apiUrl + 'user';

const AdminUsersPage = () => {
    const [users, setUsers] = useState(null);
    const [visibleUsers, setVisibleUsers] = useState(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    useEffect(() => {
        let isCancelled = false;

        async function execute() {
            const data = await myGet(apiUrl + '?method=adminUsers', null);

            if (isCancelled == false && data && data.users) {
                for (let i = 0; i < data.users.length; i++) {
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

        for (let i = 0; i < clone.length; i++) {
            let user = clone[i];

            if (user.username.trim().toLowerCase().indexOf(searchTerm) > -1
                || user.email.trim().toLowerCase().indexOf(searchTerm) > -1
                || user.name.trim().toLowerCase().indexOf(searchTerm) > -1) {
                visible.push(user);
            }
        }

        setVisibleUsers(visible);
    }

    async function handleChangePassword(user) {
        //console.log('changing password for...', user);

        const body = {
            method: ADMIN_API_CHANGE_USER_PASSWORD,
            user
        };

        const resp = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const json = await resp.json();

        console.log(json);
    }

    async function handlePasswordInputChange(e, user) {
        user.password = e.target.value;
    }

    function handleDeleteClickStep1(user) {
        setIsConfirmOpen(true);
        setUserToDelete(user);
    }

    async function handleDeleteClickStep2() {
        setIsConfirmOpen(false);

        const body = {
            method: ADMIN_API_DELETE_USER,
            user_id: userToDelete._id.toString()
        };

        const resp = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const json = await resp.json();

        setUserToDelete(null);

        const data = await myGet(apiUrl + '?method=adminUsers', null);

        if (data && data.users) {
            for (let i = 0; i < data.users.length; i++) {
                data.users[i].dtLastLogin = new Date(data.users[i].lastLogin)
            }

            data.users = data.users.sort((a, b) => b.dtLastLogin - a.dtLastLogin);

            setUsers(data.users);
            setVisibleUsers(data.users);
        }
    }

    function getJSX() {
        if (!users || users.length == 0) {
            return <div>Loading...</div>;
        }

        if (!visibleUsers || visibleUsers.length == 0) {
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
                    <div>
                        <div className="flex space-between">
                            <div>Change Password:</div>
                            <div><input type="text" className="form-control" onChange={(e) => handlePasswordInputChange(e, u)} /></div>
                            <div>
                                <button
                                    className="my-button"
                                    onClick={() => handleChangePassword(u)}>
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="mt-20 w-100">
                        <button className="my-button danger w-100" onClick={() => handleDeleteClickStep1(u)}>DELETE USER</button>
                    </div>
                    <div>
                        <Confirm
                            isOpen={isConfirmOpen}
                            onConfirm={handleDeleteClickStep2}
                            onClose={() => setIsConfirmOpen(false)}
                        />
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