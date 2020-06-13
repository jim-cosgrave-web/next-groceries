import { MongoClient } from 'mongodb';
import { DATABASE_NAME } from './constants';

const client = new MongoClient(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function writeLog(action, document) {
    try {
        if (!client.isConnected()) {
            await client.connect();
        }
    
        const db = client.db(DATABASE_NAME);
        const collection = db.collection('log');
        await collection.insertOne({ action, timestamp: new Date(), data: document });
    } catch (e) {
        console.log(e);
    }
}

export { writeLog };