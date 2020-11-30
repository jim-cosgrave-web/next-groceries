import React from 'react';
import Link from 'next/link';

const TutorialPage = () => {

    return (
        <div>
            <div className="tutorial-wrapper">
                <div className="tutorial-section first-section">
                    <div className="tutorial-title">
                        Getting Started
                    </div>
                    <div className="tutorial-text">
                        <b>Welcome to the Grocery app!</b>
                        <br />
                        <br />
                        Please read through this tutorial to understand the key features and how to use them
                    </div>
                </div>
                <div className="tutorial-section">
                    <div className="tutorial-title">
                        Your Grocery List
                    </div>
                    <div className="tutorial-text">
                        This is your grocery list.
                    </div>
                    <div>
                        <img src="/images/tutorial/groceries-tutorial-01.png" />
                    </div>
                </div>
                <div className="tutorial-section">
                    <div className="tutorial-title">
                        Searching for Groceries
                    </div>
                    <div className="tutorial-text">
                        Start typing into the "Add a grocery" textbox to add something to your list.  If the item exists in our database it will be listed in the dropdown.  If
                        not, you will need to type the item name and then click "Add".  Next time you want to add the item to your list it will appear in the dropdown list.
                        If the item you want is in the list, you can click on it or click the "Add" button.  Both will work.
                    </div>
                    <div>
                        <img src="/images/tutorial/groceries-tutorial-02.png" />
                    </div>
                </div>
                <div className="tutorial-section">
                    <div className="tutorial-title">
                        Items on Your List
                    </div>
                    <div className="tutorial-text">
                        Once you add items to your list, it will look like this.  By default your list will be sorted in alphabetical order.
                    </div>
                    <div>
                        <img src="/images/tutorial/groceries-tutorial-03.png" />
                    </div>
                </div>
                <div className="tutorial-section">
                    <div className="tutorial-title">
                        Adding Notes
                    </div>
                    <div className="tutorial-text">
                        <b>Adding Notes</b>
                        <br />
                        You can add notes to individual items on your list by clicking on the item name.  In the example below you can see that "Apples" were added, but
                        we wanted to note that we wanted Fuji apples specifically.  Use this to clarify the item or the quantity needed (or whatever you want really).
                        <br />
                        <br />
                        <b>Saving Notes</b>
                        <br />
                        Once you've added your note, you can save it be clicking in the blank space (shown by the red square).
                    </div>
                    <div>
                        <img src="/images/tutorial/groceries-tutorial-04.png" />
                    </div>
                </div>
                <div className="tutorial-section">
                    <div className="tutorial-title">
                        Viewing Notes
                    </div>
                    <div className="tutorial-text">
                        Once you've added some notes, they will appear as "Note: " on the item in the list.
                    </div>
                    <div>
                        <img src="/images/tutorial/groceries-tutorial-05.png" />
                    </div>
                </div>
                <div className="tutorial-section">
                    <div className="tutorial-title">
                        Crossing Off Items on the List
                    </div>
                    <div className="tutorial-text">
                        To remove an item from your list, first you must click the checkbox on that item.  This will not immediately remove the item.
                        To completely remove the item at this point, click the red trash can item in the bottom right corner of the screen.
                    </div>
                    <div>
                        <img src="/images/tutorial/groceries-tutorial-06.png" />
                    </div>
                </div>
                <div className="tutorial-section">
                    <div className="tutorial-title">
                        Removal Confirmation
                    </div>
                    <div className="tutorial-text">
                        After you click the trash can you will see a message that the checked groceries are being removed.
                    </div>
                    <div>
                        <img src="/images/tutorial/groceries-tutorial-07.png" />
                    </div>
                </div>
                <div className="tutorial-section">
                    <div className="tutorial-title">
                        Shopping Mode Toggle
                    </div>
                    <div className="tutorial-text">
                        Notice the two buttons <b>List</b> and <b>Store</b>
                        <br />
                        <br />
                        <b>List</b> will simply list your groceries in alphabetical order
                        <br />
                        <br />
                        <b>Store</b> will allow you to view your list in the context of the current store you are in.  The groceries will be grouped to their area/aisle, and the areas/aisles will
                        be in an order that matches how you would walk through the store.
                    </div>
                    <div>
                        <img src="/images/tutorial/groceries-tutorial-08.png" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TutorialPage;