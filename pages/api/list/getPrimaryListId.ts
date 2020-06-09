import {  NextApiResponse } from 'next';
import {  ObjectId } from 'mongodb';
import { database } from '../../../middleware/database';
import { MyNextApiRequest } from '../../../middleware/myNextApiRequest';
import { authenticate } from '../../../middleware/authenticate';

export default authenticate(database(async function getPrimaryListid(
    req: MyNextApiRequest,
    res: NextApiResponse
) {
    if(req.method != 'GET') {
        res.status(500).json({status: 'PUT only'});
        return;
    }

    const db = req.db;
    const collection = db.collection('groceryLists');
    
    let filter = { 
        'user_id': req.jwt.user_id
    };

    const result = await collection.findOne(filter);

    if(result) {
        res.status(200).json({ list_id: result._id.toString() });
    } else {
        res.status(200).json({ status: 'no list'});
    }

    
}));