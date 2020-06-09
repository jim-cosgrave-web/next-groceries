import React, { useState, useEffect } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import { env } from '../../util/environment';
import { myGet } from '../../util/myGet';
import { compare } from '../../util/compare';

const MyTypeahead = (props) => {
    const [options, setOptions] = useState([]);
    const ref = React.createRef<any>();

    useEffect(() => {
        async function execute() {
            await getData();
        }
        
        execute();
    }, []);

    async function getData() {
        if (props.type === 'groceries') {
            let data = await myGet(env.apiUrl + 'groceries', null);
            data = data.sort(compare);
            const names = data.map(d => { return d.name });
            const uniqueSet = Array.from(new Set(names));

            setOptions(uniqueSet);
        } else {
            setOptions(['NO OPTIONS FOUND']);
        }
    }

    const handleAddClick = (selected) => {
        let value = null;

        if (selected && selected.length > 0) {
            value = selected[0];
        } else if (ref && ref.current && ref.current.getInput()) {
            value = ref.current.getInput().value;
        }

        if(!value) {
            console.error('Selected item not found!');
        }

        if(typeof(props.onAdd) == 'function') {
            props.onAdd(value);
        }

        ref.current.clear();
        ref.current.blur();
    }

    const handleKeyDown = (event) => {
        if (event.key.toLowerCase() === 'enter') {
        }
    }

    let content = (
        <div className="grocery-search">
            <Typeahead
                id="typeahead"
                ref={ref}
                options={options}
                onKeyDown={handleKeyDown}
                onChange={handleAddClick}
                maxHeight="200px"
                placeholder={props.placeholder}
            />
            <div className="g-btn search-add-btn" onClick={handleAddClick}>
                Add
            </div>
        </div>
    );

    return content;
}

export default MyTypeahead;