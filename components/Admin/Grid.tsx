import React, { useState } from 'react';
import GridCell from './GridCell';

const Grid = (props) => {
    const [columns, setColumns] = useState(16);
    const [rows, setRows] = useState(16);
    const [mouseDown, setMouseDown] = useState(false);

    const size = 16;

    const styles = {
        grid: {
            height: (size * rows).toString() + "px"
        }
    };

    function handleRowCountChange(e) {
        setRows(e.target.value);
    }

    function handleColumnCountChange(e) {
        setColumns(e.target.value);
    }

    function getGridJSX() {
        const items = [];

        for(let x = 0; x < columns; x++) {
            for(let y = 0; y < rows; y++) {
                const key = x.toString() + "-" + y.toString();

                items.push(<GridCell 
                    key={key} 
                    x={x}
                    y={y}
                    size={size}
                    mouseDown={mouseDown}
                />);
            }
        }

        return items;
    }

    function handleMouseDown() {
        setMouseDown(true);
    }

    function handleMouseUp() {
        setMouseDown(false);
    }

    return (
        <div className="">
            <div>
                {columns} {rows}
            </div>
            <div>
                <select onChange={handleRowCountChange}>
                    <option>16</option>
                    <option>17</option>
                    <option>18</option>
                    <option>19</option>
                    <option>20</option>
                    <option>21</option>
                    <option>22</option>
                    <option>23</option>
                    <option>24</option>
                </select>
                <select onChange={handleColumnCountChange}>
                    <option>16</option>
                    <option>17</option>
                    <option>18</option>
                    <option>19</option>
                    <option>20</option>
                    <option>21</option>
                    <option>22</option>
                    <option>23</option>
                    <option>24</option>
                </select>
            </div>
            <div className="grid-container mt-10 mb-10">
                <div className="grid" 
                     style={styles.grid} 
                     onMouseDown={handleMouseDown} 
                     onMouseUp={handleMouseUp} >
                    {getGridJSX()}
                </div>
            </div>
        </div>
    );
};

export default Grid;