import { NextApiResponse } from 'next';
import { authenticate } from '../../middleware/authenticate';
import { database } from '../../middleware/database';
import { MyNextApiRequest } from '../../middleware/myNextApiRequest';
import { compare } from '../../util/compare';
import { titleCase } from '../../util/titleCase';
import { GROCERY_API_PUT_GROCERY } from '../../util/constants';
import { ObjectId } from 'mongodb';

export default authenticate(database(async function groceriesList(
    req: MyNextApiRequest,
    res: NextApiResponse
) {
    const db = req.db;
    const collection = db.collection('groceries');
    const storeCollection = db.collection('stores');
    const recipeCollection = db.collection('recipes');

    if (req.method == 'GET') {
        //
        // No method specified, get all groceries
        //
        if (!req.query.method) {
            const groceries = await collection.find().toArray();

            const filter = { "user_id": req.jwt.user_id };
            const recipes = await recipeCollection.find(filter).toArray();

            //return;


            groceries.sort(compare);

            res.status(200).json(groceries);
            return;
        } else if (req.query.method === 'sync') {
            const groceries = await collection.find().toArray();
            groceries.sort(compare);

            const stores = await storeCollection.find().toArray();

            let storeGroceries = [];

            for (let i = 0; i < stores.length; i++) {
                const store = stores[i];

                for (let j = 0; j < store.categories.length; j++) {
                    const category = store.categories[j];

                    for (let k = 0; k < category.groceries.length; k++) {
                        storeGroceries.push(category.groceries[k]);
                    }
                }
            }

            let groceriesToAdd = [];
            let groceriesToUpdate = [];

            for (let i = 0; i < storeGroceries.length; i++) {
                const current = storeGroceries[i].groceryName;
                const exists = groceries.find(g => g.name.toLowerCase().trim() === current.toLowerCase().trim());

                if (!exists) {
                    groceriesToAdd.push({ name: titleCase(current), createdOn: new Date(), modifiedOn: new Date(), modifiedBy: 'Sync' });
                } else {
                    if (current != exists.name) {
                        groceriesToUpdate.push({ name: titleCase(current), modifiedOn: new Date(), modifiedBy: 'Sync' });
                    }
                }
            }

            if (groceriesToAdd.length > 0) {
                await collection.insertMany(groceriesToAdd);
            }

            res.status(200).json({ message: 'OK', groceriesToAdd, groceriesToUpdate });
            return;
        } else if (req.query.method === 'clean') {
            const groceries = await collection.find().toArray();
            let uniqueGroceries = [];
            let duplicateGroceries = [];

            //
            // Find the uniques and the duplicates
            //
            for (let i = 0; i < groceries.length; i++) {
                let grocery = groceries[i];
                grocery.originalName = grocery.name;
                grocery.name = titleCase(grocery.name);

                let index = uniqueGroceries.map(g => { return titleCase(g.name); }).indexOf(grocery.name);

                if (index == -1) {
                    uniqueGroceries.push(grocery);
                } else {
                    duplicateGroceries.push(grocery);
                }
            }

            //
            // Remove duplicates
            //
            let duplicatesToRemove = duplicateGroceries.map(g => { return g._id });

            if (duplicatesToRemove.length > 0) {
                await collection.deleteMany({ _id: { $in: duplicatesToRemove } });
            }

            let testGroceries = uniqueGroceries.filter(g => g.name.toLowerCase().indexOf('new') > -1 || g.name.toLowerCase().indexOf('test') > -1);

            if (testGroceries.length > 0) {
                let testIds = testGroceries.map(g => { return g._id });
                await collection.deleteMany({ _id: { $in: testIds } });
            }

            for (let i = 0; i < uniqueGroceries.length; i++) {
                let grocery = uniqueGroceries[i];

                if (grocery.name != grocery.originalName) {
                    const filter = { _id: grocery._id };
                    const update = { $set: { name: grocery.name, modifiedOn: new Date(), modifiedBy: 'Clean' } };

                    await collection.updateOne(filter, update);
                    //console.log('doing an update')
                }
            }

            res.status(200).json({ message: 'OK', duplicatesToRemove, testGroceries });
            return;
        }
    } else if (req.method == 'PUT') {
        if (req.body.method === GROCERY_API_PUT_GROCERY) {
            const filter = { _id: new ObjectId(req.body.grocery._id) };
            const set = { $set: { name: req.body.newName, modifiedOn: new Date(), modifiedBy: req.jwt.email } };

            await collection.updateOne(filter, set);

            res.status(200).json({ message: 'OK' });
            return;
        }
    } else if (req.method == 'DELETE') {
        const filter = { _id: new ObjectId(req.body.grocery._id) };
        await collection.deleteOne(filter);

        res.status(200).json({ message: 'OK' });
        return
    } else {
        res.status(500).json({ message: 'Method not supported' });
        return;
    }
}));