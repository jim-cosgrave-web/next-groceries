import { MongoClient, Db } from 'mongodb';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

const client = new MongoClient(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

export interface MyNextApiRequest extends NextApiRequest {
    db: Db
}

const database = (fn: NextApiHandler) => async (req: MyNextApiRequest, res: NextApiResponse) => {
    if (!client.isConnected()) {
        await client.connect();
    }

    const db = client.db('groceriesDB');
    req.db = db;

    return await fn(req, res);

}

export { database };