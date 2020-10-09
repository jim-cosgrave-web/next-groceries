import React from 'react';
import SubscribeToStore from '../components/Shared/SubscribeToStore';
import Link from 'next/link';

const SubscribeToStorePage = () => {

    return (
        <div>
            <h1>Subscribe to Stores</h1>
            <div>
                <SubscribeToStore></SubscribeToStore>
            </div>
            <div className="mt-20">
                <Link href="/grocery-list">Go to shopping list</Link>
            </div>
        </div>
    );
}

export default SubscribeToStorePage;