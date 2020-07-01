import React, { useState, useEffect } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import { env } from '../../util/environment';
import { myGet } from '../../util/myGet';
import { compare } from '../../util/compare';

const offline = false;

const MyTypeahead = (props) => {
    const [options, setOptions] = useState([]);
    const [noOptions, setNoOptions] = useState(false);
    const ref = React.createRef<any>();

    useEffect(() => {
        let isCancelled = false;

        async function execute() {
            const data = await getData();

            if (!isCancelled) {
                setOptions(data);
            }
        }

        execute();

        return () => {
            isCancelled = true;
        };
    }, []);

    async function getData() {
        if (props.type === 'groceries') {
            if (!offline) {
                let data = await myGet(env.apiUrl + 'groceries', null);
                data = data.sort(compare);
                const names = data.map(d => { return d.name });
                const uniqueSet = Array.from(new Set(names));

                return uniqueSet;
            } else {
                return ['Apples', 'Bananas', 'Milk', 'Eggs', 'Bacon'];
            }
        } else if (props.type === 'store') {
            if (!offline) {
                let data = await myGet(env.apiUrl + 'store', null);
                let ar = [];

                if (data && data.stores) {
                    for (let i = 0; i < data.stores.length; i++) {
                        var store = data.stores[i];
                        var name = `${store.name} (${store.city} ${store.state})`;
                        ar.push({ id: store._id.toString(), label: name });
                    }
                }

                return ar;
            } else {
                return [
                    {
                        id: '123abc',
                        label: 'Aldi (Lemont IL)'
                    },
                    {
                        id: '456def',
                        label: 'Jewel (Lemont IL)'
                    }
                ];
            }
        } else if (props.type === 'categories') {
            let data = await myGet(env.apiUrl + 'recipes?method=getCategories', null);
            let ar = [];

            if(data && data.categories) {
                for(let i = 0; i < data.categories.length; i++) {
                    ar.push(data.categories[i].name);
                }
            }

            return ar;
        } else {
            setNoOptions(true);
            return ['NO OPTIONS FOUND'];
        }
    }

    const handleAddClick = (selected) => {
        if(noOptions) {
            return;
        }

        let value = null;

        if (selected && selected.length > 0) {
            value = selected[0];
        } else if (ref && ref.current && ref.current.getInput()) {
            value = ref.current.getInput().value;
        }

        if (!value) {
            return;
        }

        if (typeof (props.onAdd) == 'function') {
            props.onAdd(value);
        }

        ref.current.clear();
        ref.current.blur();
    }

    const handleKeyDown = (event) => {
        if (event.key.toLowerCase() === 'enter') {
            handleAddClick(null);
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