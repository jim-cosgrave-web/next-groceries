import { MyNextApiRequest } from "../../../../middleware/myNextApiRequest";
import { NextApiResponse } from "next";
import { authenticate } from "../../../../middleware/authenticate";
import { database } from "../../../../middleware/database";
import { ObjectId } from "mongodb";

//http://localhost:3000/api/list/5e8aa1294e83c727e89890c2/5e8d429a5b1e405eb00f75c5
export default authenticate(database(async function getStoreList(
    req: MyNextApiRequest,
    res: NextApiResponse
) {
    try {
        if (req.method != 'GET') {
            res.status(500).json({ status: 'GET only' });
            return;
        }

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
    } catch (e) {
        res.status(500).json({e});
    }
}))