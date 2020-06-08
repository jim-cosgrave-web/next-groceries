import { MongoClient, Db } from 'mongodb';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { MyNextApiRequest } from './myNextApiRequest';

const client = new MongoClient(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const database = (fn: NextApiHandler) => async (req: MyNextApiRequest, res: NextApiResponse) => {
    if (!client.isConnected()) {
        await client.connect();
    }

    const db = client.db('groceriesDB');
    req.db = db;

    return await fn(req, res);

}

export { database };