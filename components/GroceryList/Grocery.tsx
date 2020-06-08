import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { myGet } from '../../util/myGet';
import { env } from '../../util/environment';

const Grocery = (props) => {
    const [grocery, setGrocery] = useState(props.grocery);
    const router = useRouter();

    function getGroceryHTML() {
        if (!grocery) {
            return null;
        }
        // key={grocery.name + '_' + grocery.checked}
        let html =
            <div>
                {grocery.name}
                {grocery.note && grocery.note.length > 0 && <div className="grocery-note">Note: {grocery.note}</div>}
            </div>

        return html;
    }

    return (
        <div className="item">
            {getGroceryHTML()}
        </div>
    );
};

export default Grocery;