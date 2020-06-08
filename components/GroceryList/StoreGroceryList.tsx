import React from 'react';
import { useRouter } from 'next/router';

const StoreGroceryList = () => {
    const router = useRouter();

    return (
        <div className="grocery-list">
            Store Grocery List
        </div>
    );
};

export default StoreGroceryList;