import React from 'react';
import Link from 'next/link';

const RecipesPage = () => {

    return (
        <div>
            <h1>Recipes Page</h1>
            <div>Coming soon...</div>
            <div className="mt-20">
                <Link href="/grocery-list">
                    <a>Back to grocery list</a>
                </Link>
            </div>            
        </div>
    );
}

export default RecipesPage;