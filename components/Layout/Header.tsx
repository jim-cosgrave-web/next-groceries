import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faListOl, faSignOutAlt, faBook, faLink, faLock, faUser, faLightbulb, faQuestion } from '@fortawesome/free-solid-svg-icons';
import { env } from './../../util/environment';
import fetch from 'isomorphic-unfetch';
import { LOCAL_STORAGE_USER } from '../../util/constants';

const userApiUrl = env.apiUrl + 'user';

const Header = () => {
    const [hidden, setHidden] = useState(true);
    const [user, setUser] = useState(null);
    const [userRoles, setUserRoles] = useState(null);
    const router = useRouter();

    useEffect(() => {
        let isCancelled = false;

        async function execute() {
            const user = await getUser();

            if (isCancelled == false && user) {
                if (!user.stores || user.stores.length === 0) {
                    router.push('/subscribe-to-store');
                }

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

        return user;
    }

    function hiddenClass() {
        let menuClass = 'slide-hidden';

        if (!hidden) {
            menuClass = 'slide-shown';
        }

        return menuClass;
    }

    function overlayClass() {
        let overlay = 'overlay-hidden';

        if (!hidden) {
            overlay = 'overlay-shown';
        }

        return overlay;
    }

    function handleToggleMenu() {
        setHidden(!hidden);
    }

    function handleSignOut() {
        localStorage.removeItem(LOCAL_STORAGE_USER);
        fetch(env.apiUrl + 'user?method=logout');
        router.push('/login');
    }

    function handleNav() {
        handleToggleMenu();
    }

    function isAdmin() {
        let isAdmin = false;

        if (user && user.roles) {
            isAdmin = user.roles.indexOf('admin') > -1
        }

        return isAdmin;
    }

    return (
        <div id="menu">
            <div id="menu-overlay" className={overlayClass()} onClick={handleToggleMenu}></div>
            <div id="slide" className={hiddenClass()}>
                <div className="close-btn-wrapper" onClick={handleToggleMenu}>
                    <span style={{ "position": "absolute", "top": "6px", "right": "14px" }}>
                        <span className="close-cross close-cross-1"></span>
                        <span className="close-cross close-cross-2"></span>
                    </span>
                    <button className="close-btn">Close Menu</button>
                </div>
                <div className="menu-nav-wrapper">
                    <nav>
                        {user && <div className="nav-item" onClick={handleNav}>
                            <Link href="/profile">
                                <div className="flex">
                                    <FontAwesomeIcon icon={faUser} />
                                    <a>{user.name}</a>
                                </div>
                            </Link>
                        </div>}
                        <Link href="/grocery-list">
                            <div className="nav-item" onClick={handleNav}>
                                <div className="flex">
                                    <FontAwesomeIcon icon={faListOl} />
                                    <a>Grocery List</a>
                                </div>
                            </div>
                        </Link>
                        <Link href="/meals">
                            <div className="nav-item" onClick={handleNav}>
                                <div className="flex">
                                    <FontAwesomeIcon icon={faLightbulb} />
                                    <a>Meal Plans</a>
                                </div>
                            </div>
                        </Link>
                        <Link href="/recipes">
                            <div className="nav-item" onClick={handleNav}>
                                <div className="flex">
                                    <FontAwesomeIcon icon={faBook} />
                                    <a>Recipes</a>
                                </div>
                            </div>
                        </Link>
                        <Link href="/subscribe-to-store">
                            <div className="nav-item" onClick={handleNav}>
                                <div className="flex">
                                    <FontAwesomeIcon icon={faLink} />
                                    <a>Subscribe to Stores</a>
                                </div>
                            </div>
                        </Link>
                        <Link href="/tutorial">
                            <div className="nav-item" onClick={handleNav}>
                                <div className="flex">
                                    <FontAwesomeIcon icon={faQuestion} />
                                    <a>Tutorial</a>
                                </div>
                            </div>
                        </Link>
                        {isAdmin() && <Link href="/admin">
                            <div className="nav-item" onClick={handleNav}>
                                <div className="flex">
                                    <FontAwesomeIcon icon={faLock} />
                                    <a>Admin</a>
                                </div>
                            </div>
                        </Link>}
                        <div className="nav-item" onClick={handleSignOut}>
                            <div className="flex">
                                <FontAwesomeIcon icon={faSignOutAlt} />
                                <a>Sign Out</a>
                            </div>
                        </div>
                    </nav>
                </div>
            </div>
            <div className="menu-btn-wrapper" onClick={handleToggleMenu}>
                <span>
                    <span className="menu-bars"></span>
                    <span className="menu-bars" style={{ "top": "40%" }}></span>
                    <span className="menu-bars" style={{ "top": "80%" }}></span>
                </span>
                <button className="menu-btn">Open Menu</button>
            </div>
            <div id="fixed-nav-bar">
                <div id="header-icon">
                    <Link href="/grocery-list">
                        <img className="clickable" src="/images/cart-icon-white.png" width="50" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Header;