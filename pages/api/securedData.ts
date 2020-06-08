import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { MongoClient } from 'mongodb';
import { authenticate } from '../../middleware/authenticate';
import { database, MyNextApiRequest } from '../../middleware/database';

export default authenticate(database(async function groceriesList(
    req: MyNextApiRequest,
    res: NextApiResponse
) {
    if (req.method != 'GET') {
        res.json({ status: 'GET only' });
        return;
    }

    // const db = req.db;
    // const collection = db.collection('<YOUR_COLLECTION_NAME_HERE>');
    // const data = await collection.find().toArray();

    const data = {
        site: 'Next Starter',
        source: 'api/securedData',
        method: 'GET',
        secured: true    
    }

    res.json(data);
}));