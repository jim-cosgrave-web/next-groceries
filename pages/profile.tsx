import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { env } from './../util/environment';
import fetch from 'isomorphic-unfetch';
import { ADMIN_API_CHANGE_USER_PASSWORD } from '../util/constants';
import Router, { useRouter } from 'next/router';

const userApiUrl = env.apiUrl + 'user';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [valid, setValid] = useState(false);
    const [validationMessage, setValidationMessage] = useState('');

    useEffect(() => {
        let isCancelled = false;

        async function execute() {
            const user = await getUser();

            if (isCancelled == false && user) {
                setUser(user);
            }
        }

        execute();

        return () => {
            isCancelled = true;
        };
    }, []);

    async function getUser() {
        const resp = await fetch(userApiUrl);
        const json = await resp.json();
        const user = json.user;
        user.passwordChange = '';
        user.passwordChange2 = '';
        user.passwordChangeTouched = false;
        user.passwordChange2Touched = false;

        return user;
    }

    async function handleChangePassword() {
        const passwordsAreValid = validatePasswords();

        //
        // Exit if passwords are not valid
        //
        if (!passwordsAreValid) {
            return;
        }

        const body = {
            method: ADMIN_API_CHANGE_USER_PASSWORD,
            user
        };

        const resp = await fetch(userApiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const json = await resp.json();

        Router.replace('/grocery-list');
    }

    async function handlePasswordInputChange(e) {
        user.passwordChange = e.target.value;
        user.passwordChangeTouched = true;
        user.password = user.passwordChange;
        validatePasswords();
    }

    async function handlePassword2InputChange(e) {
        user.passwordChange2 = e.target.value;
        user.passwordChange2Touched = true;
        validatePasswords();
    }

    function validatePasswords() {
        let passwordsAreValid = false;

        if (user.passwordChange.length === 0) {
            setValid(false);
            setValidationMessage('Password cannot be blank');
        } else if (user.passwordChange !== user.passwordChange2) {
            setValid(false);
            setValidationMessage('Passwords must match');
        } else {
            setValid(true);
            setValidationMessage(null);

            passwordsAreValid = true;
        }

        return passwordsAreValid;
    }

    function buttonClass() {
        let btnClass = 'my-button w-100'

        if (!valid) {
            btnClass += ' inactive';
        }

        return btnClass;
    }

    return (
        <div>
            <h1>Profile</h1>
            {user && <div>
                <div>
                    Logged in as: <b>{user.name}</b>
                </div>
                <div className="flex space-between mt-10">
                    <div>New Password:</div>
                    <div><input type="password" className="form-control" onChange={(e) => handlePasswordInputChange(e)} /></div>

                </div>
                <div className="flex space-between mt-10">
                    <div>Confirm Password:</div>
                    <div><input type="password" className="form-control" onChange={(e) => handlePassword2InputChange(e)} /></div>
                </div>
                {validationMessage && <div className="error-text mt-10">
                    {validationMessage}
                </div>}
                <div className="flex">
                    <div className="w-100 mt-10">
                        <button
                            className={buttonClass()}
                            onClick={() => handleChangePassword()}>
                            Change Password
                        </button>
                    </div>
                </div>

            </div>}
            {!user && <div>Loading...</div>}
            <div className="mt-20">
                <Link href="/grocery-list">
                    <a>Back to grocery list</a>
                </Link>
            </div>
        </div>
    );
}

export default ProfilePage;