import { MongoClient, Db } from 'mongodb';
import { NextApiHandler, NextApiResponse } from 'next';
import { MyNextApiRequest } from './myNextApiRequest';
import { DATABASE_NAME } from '../util/constants';

const client = new MongoClient(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const database = (fn: NextApiHandler) => async (req: MyNextApiRequest, res: NextApiResponse) => {
    if (!client.isConnected()) {
        await client.connect();
    }

    const db = client.db(DATABASE_NAME);
    req.db = db;

    return await fn(req, res);

}

export { database };