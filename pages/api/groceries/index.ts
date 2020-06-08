import { NextApiResponse } from 'next';
import { authenticate } from '../../../middleware/authenticate';
import { database } from '../../../middleware/database';
import { MyNextApiRequest } from '../../../middleware/myNextApiRequest';

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