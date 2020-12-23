import { NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { database } from '../../middleware/database';
import { MyNextApiRequest } from '../../middleware/myNextApiRequest';
import { authenticate } from '../../middleware/authenticate';
import { compare } from '../../util/compare';
import { UNCATEGORIZED, NOT_AVAILABLE_AT_STORE, LIST_API_POST_RECIPE } from '../../util/constants';
import { writeLog } from '../../util/logger';
import { hash } from 'bcrypt';
import { simpleHash } from '../../util/simpleHash';
import { titleCase } from '../../util/titleCase';

export default authenticate(database(async function getPrimaryListid(
    req: MyNextApiRequest,
    res: NextApiResponse
) {
    try {
        const mealsCollection = req.db.collection('userMeals');

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
                let list = {} as any;

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
                const userCategoriesCollection = db.collection('userCategories');

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

                const userCategories = await userCategoriesCollection.find({ user_id: req.jwt.user_id, store_id: storeId }).toArray();

                let categorizedList = [];
                let remainingGroceries = list.groceries.slice();
                let ddlCategories = [{ name: UNCATEGORIZED, value: '', uncategorized: true, order: 0 }];

                let locationMap = new Object();

                //
                // Loop over each category
                //
                for (let i = 0; i < store.categories.length; i++) {
                    const storeCategory = store.categories[i];

                    let category = {
                        id: storeCategory.id,
                        name: storeCategory.name,
                        subCategoryName: storeCategory.subCategoryName,
                        originalName: storeCategory.name,
                        order: storeCategory.order,
                        groceries: [],
                        hidden: false,
                        notAvailable: storeCategory.notAvailable,
                        isCustomized: false
                    };

                    //
                    // Check if the user has settings that override the default store settings
                    //
                    if (userCategories && userCategories.length > 0) {
                        const customCategory = userCategories.find(c => c.category_id == category.id);

                        if (customCategory) {
                            if (customCategory.name && customCategory.name.trim().length > 0) {
                                category.name = customCategory.name;
                                category.isCustomized = true;
                            }
                        }
                    }

                    ddlCategories.push({ name: storeCategory.name, value: storeCategory.name, order: storeCategory.order, uncategorized: false });

                    if (category.name === NOT_AVAILABLE_AT_STORE) {
                        category.order = 99;
                    }

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

                            //
                            // Normalize the name for comparison
                            //
                            var groceryNameMap = listGrocery.name.toLowerCase().trim();

                            //
                            // Check if the grocery is part of the category
                            //
                            if (groceryNameMap == storeGrocery.groceryName.toLowerCase().trim()) {
                                listGrocery.name = storeGrocery.groceryName;
                                listGrocery.order = order;
                                listGrocery.category = storeCategory;
                                category.groceries.push(listGrocery);

                                //
                                // Keep a map of the grocery name so we can tell which groceries are in multiple categories
                                //
                                if (!locationMap[groceryNameMap]) {
                                    //
                                    // Iniitalize an array if it doesnt exist already
                                    //
                                    locationMap[groceryNameMap] = [];
                                }

                                //
                                // Add the category
                                //
                                locationMap[groceryNameMap].push(storeCategory.name);

                                const index = remainingGroceries.indexOf(listGrocery);

                                if (index > -1) {
                                    remainingGroceries.splice(index, 1);
                                }
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

                ddlCategories.sort((a, b) => a.order - b.order);
                categorizedList = categorizedList.sort((a, b) => a.order - b.order);

                if (remainingGroceries && remainingGroceries.length > 0) {
                    let uncategorized = { name: UNCATEGORIZED, uncategorized: true, groceries: remainingGroceries, hidden: false };
                    categorizedList.splice(0, 0, uncategorized);
                }

                //
                // Loop over each category so we can set multiple locations for groceries that are in two spots
                //
                for (let i = 0; i < categorizedList.length; i++) {
                    const category = categorizedList[i];

                    // Loop over each grocery in the category
                    //
                    for (let j = 0; j < category.groceries.length; j++) {
                        let grocery = category.groceries[j];
                        const locations = locationMap[grocery.name.toLowerCase().trim()];

                        if (locations && locations.length > 1) {
                            grocery.locations = "Multiple locations: " + locations.join(", ");;
                        }
                    }
                }

                let resp = {
                    categorizedList,
                    categories: ddlCategories,
                    userCategories,
                    locationMap
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


                //
                // Pull db records that are checked
                //
                await collection.updateMany(filter, { $pull: { "groceries": { checked: true } } });

                //
                // Safety to make sure what the user sees as checked gets removed
                //
                if (req.body.checkedGroceries && req.body.checkedGroceries.length > 0) {
                    const groceryNames = req.body.checkedGroceries.map(g => { return titleCase(g.name); });
                    const pullName = { $pull: { "groceries": { name: { $in: groceryNames } } } };

                    await collection.updateMany(filter, pullName);
                }

                res.status(200).json({ message: 'OK' });
                return;
            } else if (req.body.method === LIST_API_POST_RECIPE) {
                const db = req.db;
                const collection = db.collection('groceryLists');
                const filter = { user_id: req.jwt.user_id };

                const list = await collection.findOne(filter);

                if (!list) {
                    res.status(500).json({ message: 'Not Found' });
                    return;
                }

                let newGroceries = [];
                let groceries = req.body.groceries;

                for (let i = 0; i < groceries.length; i++) {
                    let grocery = groceries[i];
                    let found = list.groceries.find(g => g.name.toLowerCase().trim() === grocery.name.toLowerCase().trim());

                    if (!found) {
                        newGroceries.push(grocery);
                    }
                }

                const push = { $push: { groceries: { $each: newGroceries } } };
                await collection.updateOne(filter, push);

                const meal = {
                    user_id: req.jwt.user_id,
                    name: req.body.recipeName,
                    recipeLink: req.body.recipeLink,
                    recipeId: req.body.recipeId,
                    addedOn: new Date()
                }

                await mealsCollection.insertOne(meal);

                res.status(200).json({ message: 'OK' });
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
                const groceryName = titleCase(req.body.grocery.name.trim());

                //
                // Upsert the grocery to create it if it doesnt exist already
                //
                //const upsertGroceryResp = await groceryCollection.update({ name: { $regex: new RegExp("^" + groceryName, "i") } }, { name: groceryName }, { upsert: true });
                const upsertGroceryResp = await groceryCollection.update(
                    {
                        name: { $regex: new RegExp("^" + groceryName, "i") }
                    },
                    {
                        name: titleCase(groceryName),
                        createdOn: new Date(),
                        createdBy: req.jwt.email,
                        modifiedOn: new Date(),
                        modifiedBy: req.jwt.email
                    },
                    {
                        upsert: true
                    }
                );

                //
                // Create list filter
                //
                //const groceryFilter = { _id: list_id, user_id: req.jwt.user_id, "groceries.name": { $regex: new RegExp("^" + groceryName, "i") } };
                const groceryFilter = { _id: list_id, user_id: req.jwt.user_id, "groceries.name": groceryName };

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
                const newGrocery = req.body.grocery;
                newGrocery.checked = false;
                newGrocery.name = titleCase(newGrocery.name.trim());

                let key = `${newGrocery.name}_${newGrocery.checked}_${newGrocery.note}`;
                let hashKey = simpleHash(key);
                newGrocery.hash = hashKey;

                list.groceries.push(newGrocery);
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

            const list = await collection.findOne({ _id: list_id });
            const current = list.groceries.find(g => { return g.name == req.body.grocery.name });

            //await writeLog('Update List Grocery', { current, updated: req.body.grocery });

            delete req.body.grocery.order;
            delete req.body.grocery.category;

            const newGrocery = req.body.grocery;

            let key = `${newGrocery.name}_${newGrocery.checked}_${newGrocery.note}`;
            let hashKey = simpleHash(key);
            newGrocery.hash = hashKey;

            const result = await collection.updateOne(filter, { $set: { 'groceries.$': newGrocery } });

            res.status(200).json({ status: result.modifiedCount });
            return;
        }

        res.status(500).json({ message: 'Method not supported' });
        return;
    } catch (e) {
        res.status(500).json({ message: 'Unexpected error' });
        return;
    }
}));