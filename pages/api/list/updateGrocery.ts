import {  NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';
import { database } from '../../../middleware/database';
import { MyNextApiRequest } from '../../../middleware/myNextApiRequest';

export default database(async function updateGrocery(
    req: MyNextApiRequest,
    res: NextApiResponse
) {
    if(req.method != 'PUT') {
        res.status(500).json({status: 'PUT only'});
        return;
    }

    const list_id: string = req.body.list_id;
    const grocery: string = req.body.grocery;

    console.log(list_id, grocery);

    const db = req.db;
    //const existingUser = await db.collection('users').findOne({ "email": email });

    res.status(200).json({status: 'Updated...'});
});