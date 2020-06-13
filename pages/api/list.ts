import { NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { database } from '../../middleware/database';
import { MyNextApiRequest } from '../../middleware/myNextApiRequest';
import { authenticate } from '../../middleware/authenticate';
import { compare } from '../../util/compare';

export default authenticate(database(async function getPrimaryListid(
    req: MyNextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'GET') {
        if (req.query.method == 'getList') {
            /********************************************
             GET USER LIST
            ********************************************/
            const db = req.db;
            const collection = db.collection('groceryLists');
            const filter = { user_id: req.jwt.user_id };
            const groceryLists = await collection.find(filter).toArray();

            //
            // The list to return
            //
            let list = {};

            if (groceryLists && groceryLists.length > 0) {
                list = groceryLists[0];
            }

            res.status(200).json(list);
            return;
        } else if (req.query.method == 'getStoreList') {
            /********************************************
             GET STORE LIST
            ********************************************/
            //
            // Get query params
            //
            const listId: string = req.query.listId as string;
            const storeId: string = req.query.storeId as string;

            //
            // Get database collections
            //
            const db = req.db;
            const collection = db.collection('groceryLists');
            const storesCollection = db.collection('stores');

            //
            // Create MongoDB object ids
            //
            const list_id = new ObjectId(listId);
            const store_id = new ObjectId(storeId);

            //
            // Get the grocery list
            //
            const list = await collection.findOne({ _id: list_id, user_id: req.jwt.user_id });

            if (!list) {
                res.status(500).json({ message: 'List not found' });
                return;
            }

            //
            // Get the store
            //
            const store = await storesCollection.findOne({ _id: store_id });

            if (!store) {
                res.status(500).json({ message: 'Store not found' });
                return;
            }

            let categorizedList = [];
            let remainingGroceries = list.groceries.slice();
            let categories = [{ name: '__ Uncategorized __', value: '', uncategorized: true, order: 0 }];

            //
            // Loop over each category
            //
            for (let i = 0; i < store.categories.length; i++) {
                const storeCategory = store.categories[i];
                let category = { name: storeCategory.name, order: storeCategory.order, groceries: [], hidden: false };
                categories.push({ name: storeCategory.name, value: storeCategory.name, order: storeCategory.order, uncategorized: false });

                //
                // Loop over each grocery in the category
                //
                for (let j = 0; j < storeCategory.groceries.length; j++) {
                    const storeGrocery = storeCategory.groceries[j];

                    //
                    // Loop over groceries in the list
                    //
                    for (let k = 0; k < list.groceries.length; k++) {
                        const listGrocery = list.groceries[k];
                        const order = storeGrocery.order;

                        if (listGrocery.name == storeGrocery.groceryName) {
                            listGrocery.order = order;
                            listGrocery.category = storeCategory;
                            category.groceries.push(listGrocery);

                            const index = remainingGroceries.indexOf(listGrocery);
                            remainingGroceries.splice(index, 1);
                        }
                    }
                }

                if (category.groceries.length > 0) {
                    category.groceries.sort((a, b) => a.order - b.order);
                    categorizedList.push(category);
                } else {
                    category.hidden = true;
                    categorizedList.push(category);
                }
            }

            categories.sort((a, b) => a.order - b.order);
            categorizedList = categorizedList.sort((a, b) => a.order - b.order);

            if (remainingGroceries && remainingGroceries.length > 0) {
                let uncategorized = { name: '__ Uncategorized __', uncategorized: true, groceries: remainingGroceries };
                categorizedList.splice(0, 0, uncategorized);
            }

            let resp = {
                categorizedList,
                categories
            };

            res.status(200).json(resp);
            return;
        }

        res.status(500).json({ message: 'Method not supported' });
        return;
    } else if (req.method === 'POST') {
        if (req.body.method === 'clear-groceries') {
            //
            // Get database and collections
            //
            const db = req.db;
            const collection = db.collection('groceryLists');

            const list_id = new ObjectId(req.body.list_id);
            let filter = { _id: list_id, user_id: req.jwt.user_id };
        
            const response = await collection.updateMany(filter, { $pull: { "groceries": { checked : true } } });

            res.status(200).json({message: 'Ok'}); 
            return;
        } else {
            /********************************************
             ADD GROCERY
            ********************************************/

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
            const upsertGroceryResp = await groceryCollection.update({ name: { $regex: new RegExp("^" + groceryName, "i") } }, { name: groceryName }, { upsert: true });

            //
            // Create list filter
            //
            const groceryFilter = { _id: list_id, user_id: req.jwt.user_id, "groceries.name": { $regex: new RegExp("^" + groceryName, "i") } };

            //
            // Check if the grocery is already on the list
            //
            const grocery = await collection.findOne(groceryFilter);

            if (grocery) {
                res.status(200).json({ message: 'Already on list' });
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
            if (!list) {
                res.status(500).json({ message: 'List not found' });
                return;
            }

            //
            // Add the grocery and update
            //
            req.body.grocery.checked = false;
            list.groceries.push(req.body.grocery);
            list.groceries.sort(compare);
            const result = await collection.replaceOne(listFilter, list);

            res.status(200).json(list);
            return;
        }
    } else if (req.method === 'PUT') {
        /********************************************
         UPDATE GROCERY
        ********************************************/
        const list_id: ObjectId = new ObjectId(req.body.list_id);
        const db = req.db;
        const collection = db.collection('groceryLists');

        let filter = {
            '_id': list_id,
            'user_id': req.jwt.user_id,
            'groceries.name': req.body.grocery.name
        };

        const result = await collection.updateOne(filter, { $set: { 'groceries.$': req.body.grocery } });
        res.status(200).json({ status: result.modifiedCount });
        return;
    }

    res.status(500).json({ message: 'Method not supported' });
    return;
}));