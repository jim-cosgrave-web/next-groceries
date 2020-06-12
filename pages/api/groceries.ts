import { NextApiResponse } from 'next';
import { authenticate } from '../../middleware/authenticate';
import { database } from '../../middleware/database';
import { MyNextApiRequest } from '../../middleware/myNextApiRequest';
import { compare } from '../../util/compare';

export default authenticate(database(async function groceriesList(
    req: MyNextApiRequest,
    res: NextApiResponse
) {
    if (req.method == 'GET') {
        const db = req.db;
        const collection = db.collection('groceries');
        const groceries = await collection.find().toArray();

        groceries.sort(compare);
    
        res.status(200).json(groceries);
        return;
    } else {
        res.status(500).json({message: 'Method not supported'});
    }
}));