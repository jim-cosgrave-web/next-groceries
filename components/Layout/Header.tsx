import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faListOl, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { env } from './../../util/environment';
import fetch from 'isomorphic-unfetch';

const Header = () => {
    const [hidden, setHidden] = useState(true);
    const router = useRouter();

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
        fetch(env.apiUrl + 'user/logout');
        router.push('/login');
    }

    function handleNav() {
        handleToggleMenu();
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
                        <Link href="/securedData">
                            <div className="nav-item" onClick={handleNav}>
                                <FontAwesomeIcon icon={faListOl} />
                                <a>Secured Data</a>
                            </div>
                        </Link>
                        <div className="nav-item" onClick={handleSignOut}>
                            <FontAwesomeIcon icon={faSignOutAlt} />
                            <a>Sign Out</a>
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
        </div>
    );
};

export default Header;