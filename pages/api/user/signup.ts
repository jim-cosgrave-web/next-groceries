import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';
import { hash } from 'bcrypt';
import { database, MyNextApiRequest } from '../../../middleware/database';

export default database(async function signup(
    req: MyNextApiRequest,
    res: NextApiResponse
) {
    if(req.method != 'POST') {
        res.status(500).json({status: 'POST only'});
        return;
    }

    const name: string = req.body.name;
    const email: string = req.body.email;
    const password: string = req.body.password;

    //
    // Validate that parameters were supplied
    //
    if (!name || name.trim().length == 0 || !email || email.trim().length == 0 || !password || password.trim().length == 0) {
        res.status(500).json({ status: 'Name, email, and password are all required' });
        return;
    }

    //
    // Validate password length
    //
    if(password.length < 10) {
        res.status(500).json({ status: 'Password must be at least 10 characters long'});
        return;
    }

    const db = req.db;
    const collection = db.collection('users');
    const existingUser = await collection.findOne({ "email": email });

    if (existingUser) {
        res.status(500).json({ status: 'Email address already in use' });
    } else {
        hash(req.body.password, 10, async function (err, hash) {
            const user = {
                username: email,
                email: email,
                name: name,
                password: hash,
                stores: []
            };

            await collection.insertOne(user);

            res.status(200).json({status: 'ok'});
        });
    }
});