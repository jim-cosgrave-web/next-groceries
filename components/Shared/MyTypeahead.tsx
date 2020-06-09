import React, { useState, useEffect } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';

const MyTypeahead = (props) => {
    const [options, setOptions] = useState([]);
    const ref = React.createRef();

    useEffect(() => {
        getData();
    }, []);

    const getData = () => {
        setOptions(['A', 'B', 'C']);
    }

    const handleAddClick = (selected) => {
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