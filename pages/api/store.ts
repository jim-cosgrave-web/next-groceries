import { NextApiResponse } from 'next';
import { ObjectId, Collection } from 'mongodb';
import { database } from '../../middleware/database';
import { MyNextApiRequest } from '../../middleware/myNextApiRequest';
import { authenticate } from '../../middleware/authenticate';
import { compare } from '../../util/compare';
import { UPDATE_STORE_GROCERY_API_METHOD, UNCATEGORIZED } from '../../util/constants';

export default authenticate(
    database(async function storeApi(
        req: MyNextApiRequest,
        res: NextApiResponse
    ) {
        try {
            const db = req.db;
            const collection = db.collection('stores');
            const groceryCollection = db.collection('groceries');

            console.log(req.query);

            if (req.method === 'GET') {
                if (!req.query.method) {
                    const stores = await collection.find().toArray();

                    res.status(200).json({ stores });
                    return;
                } else if (req.query.method == 'getStoreDetails') {
                    const filter = { _id: new ObjectId(req.query.store_id.toString()) };
                    const store = await collection.findOne(filter);

                    res.status(200).json({ store });
                    return;
                }
            } else if (req.method === 'PUT') {
                if (req.body.method === UPDATE_STORE_GROCERY_API_METHOD) {
                    /********************************************
                     UPDATE STORE GROCERY
                    ********************************************/

                    //
                    // Get request body
                    //
                    const storeId = new ObjectId(req.body.store);
                    const groceryName = req.body.groceryName;
                    const categoryName = req.body.category;

                    const storeFilter = { _id: storeId };

                    //
                    // Check if the store exists
                    //
                    const store = await collection.findOne(storeFilter);

                    if (!store) {
                        res.status(500).json({ message: 'Store does not exist' });
                        return;
                    }

                    let newGrocery = {};
                    let category = undefined;
                    let push = undefined;
                    let pull = undefined;
                    let currentCategoryName = '';

                    //
                    // Update the grocery collection in case this doesnt currently exist
                    //
                    groceryCollection.update({ name: groceryName.toLowerCase() }, { name: groceryName }, { upsert: true });

                    let groceryCategory = findCategoryWithGrocery(store, groceryName);

                    if (groceryCategory && groceryCategory.name != categoryName) {
                        pull = { $pull: { "categories.$.groceries": { groceryName: groceryName } } };
                        currentCategoryName = groceryCategory.name;
                    }

                    //
                    // Find the category in the store if categories exist
                    //
                    if (categoryName != UNCATEGORIZED) {
                        category = await addCategoryIfNotExists(collection, categoryName, store, storeId);


                        //
                        // If the category exists, find the grocery
                        //
                        const existing = category.groceries.find(g => { return g.groceryName == groceryName });

                        //
                        // If it already exists, dont add it as a duplicate
                        //
                        if (existing) {
                            res.send('duplicate grocery');
                            return;
                        }

                        //
                        // Get the max order and set the new grocery to that order + 1
                        //
                        let order = Math.max.apply(Math, category.groceries.map(function (g) { return g.order; }));

                        if (order == Number.NEGATIVE_INFINITY) {
                            order = 0;
                        }

                        newGrocery = { groceryName: groceryName, order: order + 1 };
                        category.groceries.push(newGrocery);
                        push = { $push: { 'categories.$.groceries': newGrocery } };
                    }

                    //
                    // Update the collection
                    //
                    if (push) {
                        const pushFilter = { _id: storeId, 'categories.name': categoryName };
                        await collection.update(pushFilter, push);
                    }

                    if (pull) {
                        const pullFilter = { _id: storeId, 'categories.name': currentCategoryName }
                        await collection.update(pullFilter, pull);
                    }

                    res.status(200).json({ message: 'ok' });
                    return;
                } else {
                    res.status(500).json({ message: 'Method not supported' });
                    return;
                }
            } else {
                res.status(500).json({ message: 'Method not supported' });
                return;
            }
        } catch (e) {
            res.status(500).json({ error: e, message: 'Error occurred' });
            return;
        }
    })
);

//
// Add a category to a store if it doesnt exist
//
async function addCategoryIfNotExists(collection: Collection<any>, categoryName: string, store: any, storeId: ObjectId) {
    //
    // If we didnt get a store, find it
    //
    const storeFilter = { _id: storeId };

    if (!store) {
        store = collection.findOne(storeFilter);
    }

    //
    // If we still dont have a store, it doesnt exist.  Exit method.
    //
    if (!store) {
        return;
    }

    let category = store.categories ? store.categories.find(c => { return c.name == categoryName }) : [];

    //
    // If the category doesnt exist, create a new one
    //
    if (!category || category.length == 0) {
        let order = Math.max.apply(Math, store.categories.map(function (c) { return c.order; }));

        if (order == Number.NEGATIVE_INFINITY) {
            order = 0;
        }

        let newCategory = { name: categoryName ? categoryName : "Uncategorized", order: order + 1, groceries: [] };

        if (!store.categories) {
            store.categories = []
        }

        store.categories.push(newCategory);

        console.log('pushing...');

        let push = { $push: { 'categories': newCategory } };
        await collection.update(storeFilter, push);
        category = newCategory;
    }

    return category;
}

function findCategoryWithGrocery(store: any, groceryName: string) {
    if (!store || !store.categories || store.categories.length == 0) {
        return null;
    }

    let retCategory = null;

    for (let i = 0; i < store.categories.length; i++) {
        let category = store.categories[i];

        let existingGrocery = category.groceries.find(g => { return g.groceryName == groceryName });

        if (existingGrocery) {
            retCategory = category;
            break;
        }
    }

    return retCategory;
}