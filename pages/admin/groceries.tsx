import React, { useEffect, useState, useRef } from 'react';
import { myGet } from '../../util/myGet';
import { env } from '../../util/environment';
import Link from 'next/link';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { GROCERY_API_PUT_GROCERY } from '../../util/constants';

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

    async function handleGroceryNameKeyUp(e, g) {
        if (g.timeout) {
            clearTimeout(g.timeout);
        }

        const newName = e.target.value;

        g.timeout = setTimeout(async () => {
            const body = {
                method: GROCERY_API_PUT_GROCERY,
                grocery: g,
                newName: newName
            };

            const resp = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            const json = await resp.json();
        }, 500);
    }

    async function handleDelete(g) {
        let clone = groceries.slice();
        const index = groceries.indexOf(g);
        clone.splice(index, 1);
        setGroceries(clone);

        let visibleClone = visibleGroceries.slice();
        const visibleIndex = visibleGroceries.indexOf(g);
        visibleClone.splice(visibleIndex, 1);
        setVisibleGroceries(visibleClone);

        const body = {
            grocery: g
        };

        const resp = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const json = await resp.json();
    }

    function formatDateTime(dt: Date) {
        if(!dt) {
            return null;
        }
        // console.log(dt);



        // var dateString =
        //     dt.getFullYear() + "/" +
        //     ("0" + (dt.getUTCMonth() + 1)).slice(-2) + "/" +
        //     ("0" + dt.getUTCDate()).slice(-2) + " " +
        //     ("0" + dt.getUTCHours()).slice(-2) + ":" +
        //     ("0" + dt.getUTCMinutes()).slice(-2) + ":" +
        //     ("0" + dt.getUTCSeconds()).slice(-2);

        return dt;
    }

    function getJSX() {
        if (!groceries || !visibleGroceries) {
            return <div>Loading...</div>;
        }

        if (visibleGroceries.length == 0) {
            return <div>Nothing found</div>;
        }

        let jsx = <div className="list">
            {visibleGroceries.map((g, index) => {
                return (
                    <div key={g._id.toString()} className="item">
                        <div className="flex space-between">
                            <div>
                                <input type="text" className="form-control" defaultValue={g.name} onKeyUp={(e) => handleGroceryNameKeyUp(e, g)} />
                            </div>
                            <div className="clickable" onClick={() => handleDelete(g)}>
                                <FontAwesomeIcon icon={faTrash} />
                            </div>
                        </div>
                        {g.createdOn && <div className="mt-20">
                            Created On: {formatDateTime(g.createdOn)}
                        </div>}
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