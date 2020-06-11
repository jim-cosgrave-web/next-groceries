import { NextApiResponse } from 'next';
import { authenticate } from '../../../middleware/authenticate';
import { database } from '../../../middleware/database';
import { MyNextApiRequest } from '../../../middleware/myNextApiRequest';
import { ObjectId } from 'mongodb';

export default authenticate(database(async function getStores(
    req: MyNextApiRequest,
    res: NextApiResponse
) {
    if (req.method != 'GET') {
        res.status(500).json({ status: 'GET only' });
        return;
    }

    const db = req.db;
    const collection = db.collection('users');
    
    const user = await collection.findOne({ _id: new ObjectId(req.jwt.user_id)});

    if(!user) {
        res.status(500).json({message: 'User not found'});
    }

    res.status(200).json({ stores: user.stores });
}));