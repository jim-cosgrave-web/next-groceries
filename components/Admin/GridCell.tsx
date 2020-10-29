import React, { useState, useEffect } from 'react';

const GridCell = (props) => {
    const [clicked, setClicked] = useState(false);

    useEffect(() => {
    }, [props.mouseDown]);

    const size = props.size;
    const sizeStr = (size.toString() + "px");

    const styles = {
        gridCell: {
            height: sizeStr,
            width: sizeStr,
            border: "1px solid #ccc",
            position: "absolute",
            cursor: "pointer",

            left: (size * props.x).toString() + "px",
            top: (size * props.y).toString() + "px",
            background: clicked ? "red" : ""
        }
    };

    function handleClick() {
        setClicked(!clicked);
    }

    function handleMouseEnter() {
        if (props.mouseDown) {
            setClicked(!clicked);
        }
    }

    return (
        // <div style={styles.gridCell} 
        //      className="grid-cell" 
        //      onClick={handleClick}
        //      onMouseEnter={handleMouseEnter} />
        <div></div>
    );
};

export default GridCell;