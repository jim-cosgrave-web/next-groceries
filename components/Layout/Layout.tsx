import React from 'react';
import Header from './Header';
import { useRouter } from 'next/router';

const Layout = ({ children }) => {
    const router = useRouter();

    function getHeader() {
        if (router.pathname === '/login') {
            return null;
        } else {
            return <Header />;
        }
    }

    function getWrapperClass() {
        if (router.pathname === '/login') {
            return null;
        } else {
            return  "page-wrapper";
        }
    }

    return (
        <div>
            {getHeader()}
            <div className={getWrapperClass()}>
                {children}
            </div>
        </div>
    );
};

export default Layout;