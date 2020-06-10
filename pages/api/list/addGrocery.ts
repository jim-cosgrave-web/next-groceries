import {  NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';
import { database } from '../../../middleware/database';
import { MyNextApiRequest } from '../../../middleware/myNextApiRequest';
import { authenticate } from '../../../middleware/authenticate';

export default authenticate(database(async function addGrocery(
    req: MyNextApiRequest,
    res: NextApiResponse
) {
    if(req.method != 'POST') {
        res.status(500).json({status: 'POST only'});
        return;
    }

    //
    // Get database and collections
    //
    const db = req.db;
    const collection = db.collection('groceryLists');
    const groceryCollection = db.collection('groceries');

    //
    // Create parameters
    //
    const list_id = new ObjectId(req.body.list_id);
    const groceryName = req.body.grocery.name.trim();

    //
    // Upsert the grocery to create it if it doesnt exist already
    //
    const upsertGroceryResp = await groceryCollection.update({ name: {$regex: new RegExp("^" + groceryName, "i")} }, { name: groceryName }, {upsert: true});

    //
    // Create list filter
    //
    const groceryFilter = { _id: list_id, user_id: req.jwt.user_id, "groceries.name": {$regex: new RegExp("^" + groceryName, "i")} };

    //
    // Check if the grocery is already on the list
    //
    const grocery = await collection.findOne(groceryFilter);

    if(grocery) {
        res.status(200).json({message: 'Already on list'});
        return;
    }

    //
    // Find the list
    //
    const listFilter = { _id: list_id };
    const list = await collection.findOne(listFilter);

    //
    // Check if the list exists
    //
    if(!list) {
        res.status(500).json({message: 'List not found'});
        return;
    }

    //
    // Add the grocery and update
    //
    req.body.grocery.checked = false;
    list.groceries.push(req.body.grocery);
    const result = await collection.replaceOne(listFilter, list);

    res.status(200).json(list);
}));