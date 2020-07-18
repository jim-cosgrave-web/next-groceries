import React, { useEffect, useState, useRef } from 'react';
import { myGet } from '../../util/myGet';
import { env } from '../../util/environment';
import Link from 'next/link';

const apiUrl = env.apiUrl + 'groceries';

const AdminGroceriesPage = () => {
    const [groceries, setGroceries] = useState(null);
    const [visibleGroceries, setVisibleGroceries] = useState(null);
    const searchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        let isCancelled = false;

        async function execute() {
            const data = await myGet(apiUrl, null);

            if (isCancelled == false && data && data.length > 1) {
                setGroceries(data);
                setVisibleGroceries(data);
            }
        }

        execute();

        return () => {
            isCancelled = true;
        };
    }, []);
 
    function getJSX() {
        if(!groceries || !visibleGroceries) {
            return <div>Loading...</div>;
        }

        if(visibleGroceries.length == 0) {
            return <div>Nothing found</div>;
        }

        let jsx = <div className="list">
            {visibleGroceries.map((g, index) => {
                return (
                    <div key={g._id.toString()} className="item">
                        {g.name}
                    </div>
                );
            })}
        </div>;

        return jsx;
    }

    function handleKeyUp(e) {
        let input = searchRef?.current?.value;
        input = input.trim().toLowerCase();

        const vis = groceries.filter(g => g.name.toLowerCase().indexOf(input) > -1);
        setVisibleGroceries(vis);
    }

    return (
        <div>
            <h1>Admin Groceries</h1>
            <div className="mb-20">
                <input type="text" ref={searchRef} placeholder="Search..." className="form-control" onKeyUp={handleKeyUp} />
            </div>
            <div>
                {getJSX()}
            </div>
        </div>
    );
}

export default AdminGroceriesPage;