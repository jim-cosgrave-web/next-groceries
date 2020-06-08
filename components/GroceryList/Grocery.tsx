import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckSquare } from '@fortawesome/free-solid-svg-icons';
import { faSquare, faSave } from '@fortawesome/free-regular-svg-icons';

const Grocery = (props) => {
    const [grocery, setGrocery] = useState(props.grocery);
    const [editNote, setEditNote] = useState(false);
    const router = useRouter();
    const noteRef = useRef<HTMLInputElement>(null);

    function getGroceryHTML() {
        if (!grocery) {
            return null;
        }

        let html =
            <div className="flex space-between">
                <div>
                    <div onClick={handleEditNote}>{grocery.name}</div>
                    {grocery.note && grocery.note.length > 0 && 
                        !editNote && <div onClick={() => setEditNote(true)} className="grocery-note">Note: {grocery.note}</div>
                    }
                    {editNote && 
                        <div className="grocery-note">
                            <input type="text" 
                                   defaultValue={grocery.note} 
                                   ref={noteRef} 
                                   onKeyUp={handleKeyUp}
                                   onChange={() => {}}></input>
                            <FontAwesomeIcon className="ml-5" onClick={saveNote} icon={faSave} />
                        </div>
                    }
                </div>
                <div className="clickable" onClick={handleToggleCheck}>
                    {grocery.checked && <FontAwesomeIcon icon={faCheckSquare} />}
                    {!grocery.checked && <FontAwesomeIcon icon={faSquare} />}
                </div>
            </div>

        return html;
    }

    function handleKeyUp(e) {
        if (e.key.toLowerCase() === 'enter') {
            saveNote();
        }
    }

    function handleEditNote() {
        setEditNote(true);
    }

    function saveNote() {
        const clone = { ...grocery };
        clone.note = noteRef.current?.value;
        setGrocery(clone);
        setEditNote(false);
    }

    function handleToggleCheck() {
        const clone = { ...grocery };
        clone.checked = !clone.checked;
        setGrocery(clone);
    }

    return (
        <div className="item">
            {getGroceryHTML()}
        </div>
    );
};

export default Grocery;