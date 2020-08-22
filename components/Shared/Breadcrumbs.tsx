import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const Breadcrumbs = (props) => {
    const router = useRouter();
    const paths = [
        { path: '/recipes/[recipe_id]', subpaths: [{ path: '/recipes', name: 'Recipes', clickable: true }, { name: 'Recipe' }] }
    ];

    function getJSX() {
        const pathIndex = paths.map((p) => { return p.path }).indexOf(router.pathname);
        console.log(pathIndex);

        return <div className="mt-10">{router.pathname}</div>;
    }

    return (
        <div className="store-sub-container">
            {getJSX()}
        </div>
    );
};

export default Breadcrumbs;