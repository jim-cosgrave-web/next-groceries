import React, { useState, useRef } from 'react';
import fetch from 'isomorphic-unfetch';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckSquare } from '@fortawesome/free-solid-svg-icons';
import { faSquare, faSave } from '@fortawesome/free-regular-svg-icons';
import { env } from '../../util/environment';

const updateGroceryUrl = env.apiUrl + 'list';

const Grocery = (props) => {
    const [grocery, setGrocery] = useState(props.grocery);
    const [listId, setListId] = useState(props.list_id);
    const [editNote, setEditNote] = useState(false);
    const router = useRouter();
    const noteRef = useRef<HTMLInputElement>(null);

    function getGroceryHTML() {

        if (!grocery) {
            return null;
        }

        let html =
            <div className="flex space-between">
                <div className="flex-grow clickable" onClick={handleEditNote}>
                    <div className="bold clickable">{grocery.name}</div>
                    {grocery.note && grocery.note.length > 0 &&
                        !editNote && <div onClick={() => setEditNote(true)} className="grocery-note clickable">Note: {grocery.note}</div>
                    }
                    {editNote &&
                        <div className="grocery-note flex large-text">
                            <div>
                                <input type="text"
                                    className="large-text"
                                    defaultValue={grocery.note}
                                    ref={noteRef}
                                    onKeyUp={handleKeyUp}
                                    onChange={() => { }}></input>
                                {/* <FontAwesomeIcon className="ml-5 clickable" onClick={saveNote} icon={faSave} /> */}
                                {props.enableCategory && <div className="mt-10">
                                    <select className="prevent-click" onChange={handleCategoryChange} value={props.categoryName}>
                                        {props.categories.map((c, i) => { return <option key={c.name} defaultValue={props.categoryName}>{c.name}</option>; })}
                                    </select>
                                </div>}
                            </div>
                        </div> 
                    }
                </div>
                <div className="grocery-checkbox clickable" onClick={handleToggleCheck}>
                    {grocery.checked && <FontAwesomeIcon icon={faCheckSquare} />}
                    {!grocery.checked && <FontAwesomeIcon icon={faSquare} />}
                </div>
                {/* <div>
                    {JSON.stringify(grocery, null, 2)}
                </div> */}
            </div>

        return html;
    }


    const handleCategoryChange = (event) => {
        props.onCategorySet(event.target.value, props.categoryName, grocery);
    }

    async function handleKeyUp(e) {
        if (e.key.toLowerCase() === 'enter') {
            await saveNote();
        }
    }

    async function handleEditNote(e) {
        const domType = e.target.type;

        if (domType) {
            return;
        }

        if (!editNote) {
            setEditNote(true);
        } else {
            saveNote();
        }
    }

    async function saveNote() {
        const clone = { ...grocery };
        clone.note = noteRef.current?.value;
        setGrocery(clone);
        setEditNote(false);
        await updateGrocery(clone);
    }

    async function handleToggleCheck() {
        const clone = { ...grocery };
        clone.checked = !clone.checked;
        setGrocery(clone);
        await updateGrocery(clone);
    }

    async function updateGrocery(grocery) {
        const body = { list_id: listId, grocery: grocery };

        const resp = await fetch(updateGroceryUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const json = await resp.json();

    }

    return (
        <div className="item">
            {getGroceryHTML()}
        </div>
    );
};

export default Grocery;