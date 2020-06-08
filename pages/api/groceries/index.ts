import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { MongoClient } from 'mongodb';
import { authenticate } from '../../../middleware/authenticate';
import { database, MyNextApiRequest } from '../../../middleware/database';

export default authenticate(database(async function groceriesList(
    req: MyNextApiRequest,
    res: NextApiResponse
) {
    if (req.method != 'GET') {
        res.json({ status: 'GET only' });
        return;
    }

    const db = req.db;
    const collection = db.collection('groceries');
    const groceries = await collection.find().toArray();

    res.json(groceries);
}));