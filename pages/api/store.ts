import { NextApiResponse } from 'next';
import { ObjectId, Collection } from 'mongodb';
import { database } from '../../middleware/database';
import { MyNextApiRequest } from '../../middleware/myNextApiRequest';
import { authenticate } from '../../middleware/authenticate';
import { authenticateRoles } from '../../middleware/authenticateRoles';
import {
    UNCATEGORIZED,
    REORGANIZE_STORE_GROCERIES_API_METHOD,
    UPDATE_STORE_CATEGORY_API_METHOD,
    DELETE_STORE_CATEGORY_API_METHOD,
    ADD_STORE_GROCERY_API_METHOD,
    DELETE_STORE_GROCERY_API_METHOD,
    UPDATE_STORE_GROCERY_API_METHOD,
    ADD_STORE_CATEGORY_API_METHOD,
    MOVE_STORE_CATEGORY_API_METHOD,
    UPDATE_STORE_GROCERY_CATEGORY_API_METHOD,
    ADMIN_API_POST_STORE,
    NOT_AVAILABLE_AT_STORE,
    ADMIN_API_STORE_CLEAN_GROCERIES,
    ADMIN_API_STORE_RESTORE
} from '../../util/constants';
import { titleCase } from '../../util/titleCase';

export default authenticate(
    authenticateRoles(
        database(async function storeApi(
            req: MyNextApiRequest,
            res: NextApiResponse
        ) {
            try {
                const db = req.db;
                const collection = db.collection('stores');
                const backupCollection = db.collection('storeBackup');
                const groceryCollection = db.collection('groceries');

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
                    } else if (req.query.method == 'backup') {
                        /*
                          Take a backup of the stores
                        */
                        var stores = await collection.find().toArray();

                        for (var i = 0; i < stores.length; i++) {
                            const store = stores[i];
                            const storeId = store._id.toString();
                            delete store._id;

                            store.timestamp = new Date();
                            store.storeId = storeId;

                            await backupCollection.insertOne(store);
                        }

                        res.status(200).json({ message: 'OK' });
                        return;
                    }
                } else if (req.method === 'POST') {
                    if (req.body.method === ADD_STORE_GROCERY_API_METHOD) {
                        const groceryName = titleCase(req.body.grocery.groceryName);
                        const newGrocery = { groceryName: groceryName, order: req.body.grocery.order };
                        const storeId = new ObjectId(req.body.store_id);
                        const filter = { _id: storeId, "categories.name": req.body.categoryName };
                        const push = { '$push': { 'categories.$.groceries': newGrocery } };

                        await collection.updateOne(filter, push);

                        const grocery = await groceryCollection.findOne({ name: groceryName });

                        if (!grocery) {
                            await groceryCollection.insertOne({ name: groceryName, createdOn: new Date(), createdBy: req.jwt.email, modifiedOn: new Date(), modifiedBy: req.jwt.email });
                        }

                        res.status(200).json({ message: 'OK', grocery });
                        return;
                    } else if (req.body.method === ADD_STORE_CATEGORY_API_METHOD) {
                        const storeId = new ObjectId(req.body.storeId);
                        const filter = { _id: storeId };
                        const push = { '$push': { 'categories': req.body.category } };

                        await collection.updateOne(filter, push);

                        res.status(200).json({ message: 'OK' });
                        return;
                    } else if (req.body.method === ADMIN_API_POST_STORE) {
                        const store = req.body.store;
                        delete store.isNew;

                        const filter = { name: store.name, city: store.city, state: store.state };
                        const existing = await collection.findOne(filter);

                        if (existing) {
                            res.status(500).json({ message: 'Store Already Exists' });
                            return;
                        }

                        store.categories.push({
                            name: NOT_AVAILABLE_AT_STORE,
                            groceries: [],
                            order: 1,
                            notAvailable: true
                        });

                        const resp = await collection.insertOne(store);
                        const storeId = resp.insertedId;

                        const newStore = await collection.findOne({ _id: new ObjectId(storeId.toString()) });

                        res.status(200).json({ message: 'OK', newStore });
                        return;
                    } else if (req.body.method === ADMIN_API_STORE_CLEAN_GROCERIES) {
                        //
                        // Get the store
                        //
                        const filter = { _id: new ObjectId(req.body.store._id) };
                        const store = await collection.findOne(filter);

                        let data = [];

                        //
                        // Loop over each category
                        //
                        for (let i = 0; i < store.categories.length; i++) {
                            const category = store.categories[i];

                            let uniqueGroceries = [];
                            let duplicateGroceries = [];

                            //
                            // Loop over each grocery in the category and find duplicates
                            //
                            for (let j = 0; j < category.groceries.length; j++) {
                                let grocery = category.groceries[j];
                                grocery.originalName = grocery.groceryName;
                                grocery.groceryName = titleCase(grocery.groceryName);

                                let index = uniqueGroceries.map(g => { return titleCase(g.groceryName); }).indexOf(grocery.groceryName);

                                if (index == -1) {
                                    uniqueGroceries.push(grocery);
                                } else {
                                    duplicateGroceries.push(grocery);
                                }
                            }

                            //
                            // Remove duplicates
                            //
                            let duplicatesToRemove = duplicateGroceries.map(g => { return g.order });

                            if (duplicatesToRemove.length > 0) {
                                const filter = { _id: new ObjectId(req.body.store._id), "categories.name": category.name };
                                const pull = { "$pull": { "categories.$.groceries": { "order": { $in: duplicatesToRemove } } } };
                                data.push({ filter, pull });
                                await collection.updateMany(filter, pull);
                            }

                            for (let j = 0; j < uniqueGroceries.length; j++) {
                                let grocery = uniqueGroceries[j];

                                if (grocery.groceryName != grocery.originalName) {
                                    data.push({ updatedName: grocery.groceryName })

                                    const set = {
                                        '$set': {
                                            "categories.$[category].groceries.$[grocery].groceryName": grocery.groceryName,
                                            "categories.$[category].groceries.$[grocery].modifiedOn": new Date(),
                                            "categories.$[category].groceries.$[grocery].modifiedBy": "Clean"
                                        }
                                    };

                                    const arrayFilters = { 'arrayFilters': [{ "category.name": category.name }, { "grocery.groceryName": grocery.originalName }], multi: true };

                                    await collection.update(filter, set, arrayFilters);
                                }
                            }
                        }


                        res.status(200).json({ message: req.body, data });
                        return;
                    } else if (req.body.method === ADMIN_API_STORE_RESTORE) {
                        /* 
                        Restore the store data from the latest backup
                        */
                        const storeId = req.body.store._id.toString();

                        const backup = await backupCollection.findOne(
                            { storeId: storeId },
                            { sort: { timestamp: -1 } }
                        );

                        if (!backup) {
                            res.status(500).json({ message: 'No backups found' });
                            return;
                        }
                        const storeFilter = { _id: new ObjectId(req.body.store._id) };

                        //
                        // Check if the store exists
                        //
                        const store = await collection.findOne(storeFilter);

                        if (!store) {
                            res.status(500).json({ message: 'No store found' });
                            return;
                        }

                        delete backup.timestamp;
                        delete backup.storeId;
                        backup._id = store._id;

                        await collection.replaceOne(storeFilter, backup);

                        res.status(200).json({ store, backup });
                    } else {
                        res.status(500).json({ message: 'Method not supported' });
                        return;
                    }
                } else if (req.method === 'PUT') {
                    if (req.body.method === UPDATE_STORE_GROCERY_API_METHOD) {

                        const storeId = new ObjectId(req.body.storeId);
                        const categoryName = req.body.categoryName;
                        const originalName = req.body.grocery.originalName;
                        const newName = titleCase(req.body.grocery.groceryName);

                        const filter = { _id: storeId };
                        const set = { '$set': { "categories.$[category].groceries.$[grocery].groceryName": newName } };
                        const arrayFilters = { 'arrayFilters': [{ "category.name": categoryName }, { "grocery.groceryName": originalName }], multi: true };

                        await collection.update(filter, set, arrayFilters);

                        res.status(200).json({ message: 'OK', filter, set });
                        return;
                    } else if (req.body.method === UPDATE_STORE_GROCERY_CATEGORY_API_METHOD) {
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
                        //groceryCollection.update({ name: groceryName.toLowerCase() }, { name: groceryName }, { upsert: true });

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
                    } else if (req.body.method === REORGANIZE_STORE_GROCERIES_API_METHOD) {
                        //
                        // User reorganized category groceries for a store
                        //
                        const storeId = new ObjectId(req.body.store_id);
                        const updatedCategory = req.body.updatedCategory;
                        const uFilter = { _id: storeId, "categories.name": updatedCategory.name };
                        const uSet = { "$set": { "categories.$": updatedCategory } };

                        await collection.updateOne(uFilter, uSet);

                        res.status(200).json({ message: 'OK' });
                        return;
                    } else if (req.body.method === UPDATE_STORE_CATEGORY_API_METHOD) {
                        const storeId = new ObjectId(req.body.store_id);
                        const uFilter = { _id: storeId, "categories.name": req.body.previousCategoryName };
                        const uSet = {
                            "$set": {
                                "categories.$.name": req.body.newCategoryName,
                                "categories.$.subCategoryName": req.body.subCategoryName
                            }
                        };

                        await collection.updateOne(uFilter, uSet);

                        res.status(200).json({ message: 'OK' });
                    } else if (req.body.method === MOVE_STORE_CATEGORY_API_METHOD) {
                        const storeId = new ObjectId(req.body.storeId);

                        const filter1 = { _id: storeId, "categories.name": req.body.category1.name };
                        const set1 = { "$set": { "categories.$.order": req.body.category1.order } };

                        const resp1 = await collection.updateOne(filter1, set1);

                        const filter2 = { _id: storeId, "categories.name": req.body.category2.name };
                        const set2 = { "$set": { "categories.$.order": req.body.category2.order } };

                        const resp2 = await collection.updateOne(filter2, set2);

                        res.status(200).json({ message: 'OK' });
                        return;
                    } else {
                        res.status(500).json({ message: 'Method not supported' });
                        return;
                    }
                } else if (req.method === 'DELETE') {
                    if (req.body.method === DELETE_STORE_CATEGORY_API_METHOD) {
                        const storeId = new ObjectId(req.body.storeId);
                        const filter = { _id: storeId };
                        const pull = { "$pull": { "categories": { "name": req.body.categoryName } } };

                        await collection.updateOne(filter, pull);

                        res.status(200).json({ message: 'OK' });
                        return;
                    } else if (req.body.method === DELETE_STORE_GROCERY_API_METHOD) {
                        const storeId = new ObjectId(req.body.storeId);
                        const filter = { _id: storeId, "categories.name": req.body.categoryName };
                        const pull = { "$pull": { "categories.$.groceries": { "groceryName": req.body.groceryName } } };

                        await collection.updateOne(filter, pull);

                        res.status(200).json({ message: 'OK' });
                        return;
                    } else {
                        res.status(200).json({ message: 'Method not supported' });
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
        , ['admin', 'local-admin']) // End authenticate roles
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