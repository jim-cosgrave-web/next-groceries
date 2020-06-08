import React, { useState } from 'react';
import GroceryList from '../components/GroceryList/GroceryList';
import StoreGroceryList from '../components/GroceryList/StoreGroceryList';

const GroceryListPage = () => {
    const [mode, setMode] = useState('list');

    return (
        <div>
            <h1>Groceries</h1>

            <button onClick={() => setMode('list')}>List</button>
            <button onClick={() => setMode('store')}>Store</button>

            <div>
                {
                    mode == 'list' ? <GroceryList></GroceryList> : <StoreGroceryList></StoreGroceryList>
                }
            </div>
        </div>
    );
}

export default GroceryListPage;