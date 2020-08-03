import React, { useState } from 'react';
import Header from './Header';
import { useRouter } from 'next/router';

const Layout = ({ children }) => {
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [startPos, setStartPos] = useState(null);
    const [endPos, setEndPos] = useState(null);

    const router = useRouter();

    function getHeader() {
        if (router.pathname === '/login' || router.pathname === '/') {
            return null;
        } else {
            return <Header />;
        }
    }

    function getWrapperClass() {
        if (router.pathname === '/login' || router.pathname === '/') {
            return null;
        } else {
            return  "page-wrapper";
        }
    }

    function handleMouseDown(e) {
        setIsMouseDown(true);
        setStartPos(e.clientX);
    }

    function handleMouseUp(e) {
        setIsMouseDown(false);
        const newPos = e.clientX;

        const pages = ['/grocery-list', '/meals', '/recipes'];
        const currentPage = router.pathname;
        const pageIndex = pages.indexOf(currentPage);

        //
        // Page not set up in rotation.  Default to grocery-list.
        //
        if(pageIndex === -1) {
            router.push('/grocery-list');
            return;
        }

        if(startPos && e.clientX < startPos && startPos - e.clientX > 100) {
            //
            // Swipe left
            //
            let newPage = pages[0];

            if(pageIndex + 1 < pages.length) {
                newPage = pages[pageIndex + 1];
            }
            
            router.push(newPage);
        } else if (startPos && e.clientX > startPos && e.clientX - startPos > 100) {
            //
            // Swipe right
            //
            let newPage = pages[pages.length - 1];

            if(pageIndex - 1 >= 0) {
                newPage = pages[pageIndex - 1];
            }

            router.push(newPage);
        }

        setStartPos(null);
    }

    return (
        <div onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onTouchStart={handleMouseDown} onTouchEnd={handleMouseUp}>
            {getHeader()}
            <div className={getWrapperClass()}>
                {children}
            </div>
        </div>
    );
};

export default Layout;