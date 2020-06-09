import {  NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';
import { database } from '../../../middleware/database';
import { MyNextApiRequest } from '../../../middleware/myNextApiRequest';
import { authenticate } from '../../../middleware/authenticate';

export default authenticate(database(async function updateGrocery(
    req: MyNextApiRequest,
    res: NextApiResponse
) {
    if(req.method != 'PUT') {
        res.status(500).json({status: 'PUT only'});
        return;
    }

    const list_id: ObjectId = new ObjectId(req.body.list_id);
    const db = req.db;
    const collection = db.collection('groceryLists');
    
    let filter = { 
        '_id': list_id, 
        'user_id': req.jwt.user_id, 
        'groceries.name': req.body.grocery.name 
    };

    const result = await collection.updateOne(filter, { $set: { 'groceries.$': req.body.grocery }});
    res.status(200).json({status: result.modifiedCount});
}));