import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { myGet } from '../../util/myGet';
import { env } from '../../util/environment';

const apiUrl = env.apiUrl + 'groceries/list';

const StoreGroceryList = () => {
    const [list, setList] = useState(null);
    const router = useRouter();

    useEffect(() => {
        async function execute() {
            const data = await getListData();
            setList(data);
        }

        execute();
    }, []);

    async function getListData() {
        let json = await myGet(apiUrl, null);

        if (json && json.length > 0) {
            json = json[0];
        }

        return json;
    }

    return (
        <div className="grocery-list">
            Store Grocery List
        </div>
    );
};

export default StoreGroceryList;