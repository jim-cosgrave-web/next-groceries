import { NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { database } from '../../middleware/database';
import { MyNextApiRequest } from '../../middleware/myNextApiRequest';
import { authenticate } from '../../middleware/authenticate';

export default authenticate(database(async function recipesAPI(
    req: MyNextApiRequest,
    res: NextApiResponse
) {
    try {
        const db = req.db;
        const collection = db.collection('recipes');

        if (req.method === 'GET') {
            if(!req.query.method || req.query.method === '') {
                const filter = { "user_id": req.jwt.user_id };
                const recipes = await collection.find(filter).toArray();

                res.status(200).json({ recipes });
                return;
            } else if (req.query.method === 'getById') {
                const filter = { "_id": new ObjectId(req.query.id.toString()), "user_id": req.jwt.user_id };
                const recipe = await collection.findOne(filter);

                res.status(200).json({ recipe });
                return;
            }
        } else if (req.method === 'POST') {

        } else if (req.method === 'PUT') {

        } else if (req.method === 'DELETE') {

        }

        res.status(500).json({ message: 'Method not supported' });
        return;
    } catch (e) {
        res.status(500).json({ message: 'Unexpected error' });
        return;
    }
}));