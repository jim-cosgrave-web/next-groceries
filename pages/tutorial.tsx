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
                <div className="tutorial-section">
                    <div className="tutorial-title">
                        Categorize Groceries
                    </div>
                    <div className="tutorial-text">
                        Just like on the "List" mode, when you click on a grocery in "Store" mode, you will get the option to enter a note.  However, in store mode
                        you also get a dropdown list that lets you categorize an item at a specific store.
                        <br />
                        <br />
                        <h2>BE CAREFUL!</h2>
                        In the screenshot below, the user is shopping at Aldi in Lemont IL.  Clicking on the dropdown in screenshot "1" shows you a list categories or ailse that are configured for this store.
                        Clicking on a new category will move Apples from their current location to another category/aisle.
                        <span className="emphasis">&nbsp;&nbsp;Any changes you make will be seen by other users</span>
                        <br />
                        <br />
                        Clicking in the area marked by "2" will save your note just like on the list screen.
                    </div>
                    <div>
                        <img src="/images/tutorial/groceries-tutorial-09.png" />
                    </div>
                </div>
                <div className="tutorial-section">
                    <div className="tutorial-title">
                        Uncategorized Groceries
                    </div>
                    <div className="tutorial-text">
                        Categorizing groceries is a crowed sourced effort.  As you add new groceries, they will first show up in an "__ Uncategorized __" category.
                        If you know where the grocery is found at the store, update the category for future use.  If you are unsure, you can always update
                        the category when you find it at the store.
                        <br />
                        <br />
                        With enough help from the community we can get everything categorized!
                    </div>
                    <div>
                        <img src="/images/tutorial/groceries-tutorial-10.png" />
                    </div>
                </div>
                <div className="tutorial-section">
                    <div className="tutorial-title">
                        Navigating the App
                    </div>
                    <div className="tutorial-text">
                        To open the menu, click the hamburger icon by the "1".
                        <br />
                        <br />
                        To return to your shopping list at any time, click the cart icon by the "2".
                    </div>
                    <div>
                        <img src="/images/tutorial/groceries-tutorial-11.png" />
                    </div>
                </div>
                <div className="tutorial-section">
                    <div className="tutorial-title">
                        Menu
                    </div>
                    <div className="tutorial-text">
                        Here is a brief description of the menu options

                        <ol>
                            <li>Katie Cosgrave
                                <ul><li>This is the name of the logged in user.  Click your name to go to the profile page.</li></ul>
                            </li>
                            <li>Grocery list
                                <ul><li>Navigates you back to your grocery list</li></ul>
                            </li>
                            <li>Meals/Meal Plans
                                <ul><li>Navigates you to a screen where you can track meal plans for the week.</li></ul>
                            </li>
                            <li>Recipes
                                <ul><li>Navigates you to a screen where you can manage your own recipes.  Recipes contain a list of ingredients which can be added to your list in bulk if you are meal planning.</li></ul>
                            </li>
                            <li>Subscribe to Stores
                                <ul><li>Navigates you to a page where you can subscribe to different stores.  Subscribed stores show up in the dropdown list when in store mode on your shopping list.</li></ul>
                            </li>
                        </ol>
                    </div>
                    <div>
                        <img src="/images/tutorial/groceries-tutorial-12.png" />
                    </div>
                </div>
                <div className="tutorial-section">
                    <div className="tutorial-title">
                        Profile Page
                    </div>
                    <div className="tutorial-text">
                        When you click on your name in the menu, you are navigated to the profile page.  Currently this page only allows you to update your password.
                    </div>
                    <div>
                        <img src="/images/tutorial/groceries-tutorial-13.png" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TutorialPage;