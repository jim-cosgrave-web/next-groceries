import React, { useState } from 'react';
import Header from './Header';
import { useRouter } from 'next/router';

const Layout = ({ children }) => {
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [startPos, setStartPos] = useState(null);
    const [endPos, setEndPos] = useState(null);
    const swipeDistance = 200;

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
            return "page-wrapper";
        }
    }

    function handleMouseDown(e) {
        if (e && e.touches) {
            //console.log(e.touches[0]);
            setIsMouseDown(true);
            //setStartPos(e.clientX);
            setStartPos(e.touches[0].clientX);
        }
    }

    function handleTouchMove(e) {
        if (e && e.touches && e.touches.length > 0) {
            setEndPos(e.touches[0].clientX)
        }
    }

    function handleMouseUp(e) {
        setIsMouseDown(false);
        //console.log(startPos, endPos);
        const newPos = endPos;
        const pages = ['/grocery-list', '/meals', '/recipes'];
        const currentPage = router.pathname;
        const pageIndex = pages.indexOf(currentPage);

        //
        // Page not set up in rotation.  Default to grocery-list.
        //
        if (pageIndex === -1) {
            //router.push('/grocery-list');
            return;
        }

        if (startPos && newPos < startPos && startPos - newPos > swipeDistance) {
            //
            // Swipe left
            //
            let newPage = pages[0];
            console.log('swipe left');

            if (pageIndex + 1 < pages.length) {
                newPage = pages[pageIndex + 1];
            }

            //router.push(newPage);
        } else if (startPos && newPos > startPos && newPos - startPos > swipeDistance) {
            //
            // Swipe right
            //
            let newPage = pages[pages.length - 1];
            console.log('swipe right');

            if (pageIndex - 1 >= 0) {
                newPage = pages[pageIndex - 1];
            }

            //router.push(newPage);
        }

        setStartPos(null);
        setEndPos(null);
    }

    return (
        <div onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
            onTouchMove={handleTouchMove}
        >
            {getHeader()}
            <div className={getWrapperClass()}>
                {children}
            </div>
        </div>
    );
};

export default Layout;