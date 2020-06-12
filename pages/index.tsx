import React from 'react';
import Link from 'next/link';

const Index = () => {
    return (
        <div>
            <h1>Index Page</h1>
            <div>
                <Link href="/grocery-list">
                    <a>Grocery list</a>
                </Link>
            </div>
            <div>
                <Link href="/login">
                    <a>Login</a>
                </Link>
            </div>
        </div>
    )
}

export default Index;