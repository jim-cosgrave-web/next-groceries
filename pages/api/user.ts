import { verify } from 'jsonwebtoken';
import { NextApiResponse } from 'next';
import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { database } from '../../middleware/database';
import cookie from 'cookie';
import { MyNextApiRequest, MyJWT } from '../../middleware/myNextApiRequest';
import { ObjectId } from 'mongodb';
import { authenticateNoRedirect } from '../../middleware/authenticateNoRedirect';

export default authenticateNoRedirect(database(async function login(
    req: MyNextApiRequest,
    res: NextApiResponse
) {
    if (req.method == 'POST') {
        const name: string = req.body.name;
        const email: string = req.body.email;
        const password: string = req.body.password;

        let method = 'login'

        if (name && name.trim().length > 0) {
            method = 'signup';
        }

        if (method === 'login') {
            //
            // Validate that parameters were supplied
            //
            if (!email || email.trim().length == 0 || !password || password.trim().length == 0) {
                res.status(500).json({ status: 'Name, email, and password are all required' });
                return;
            }

            const db = req.db;
            const existingUser = await db.collection('users').findOne({ "email": email });

            if (!existingUser) {
                res.status(401).json({ status: 'Unsuccessful login' });
            } else {
                compare(password, existingUser.password, function (err, result) {
                    //
                    // result will be true/false
                    //
                    if (!err && result) {
                        //
                        // Create json token here
                        //
                        const claims = { sub: existingUser._id, name: existingUser.name, email: existingUser.email, user_id: existingUser._id.toString() };
                        const jwt = sign(claims, process.env.JWT_SECRET, { expiresIn: '24h' });

                        res.setHeader('Set-Cookie', cookie.serialize('auth', jwt, {
                            httpOnly: true,
                            secure: process.env.NODE_ENV !== 'development',
                            sameSite: 'strict',
                            maxAge: 86400,
                            path: '/'
                        }));

                        //res.json({ authToken: jwt });
                        res.status(200).json({ status: 'Logged in' });
                    } else {
                        res.status(401).json({ status: 'Oops.  Something went wrong' });
                    }
                });
            }
        } else {
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
            if (password.length < 10) {
                res.status(500).json({ status: 'Password must be at least 10 characters long' });
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

                    res.status(200).json({ status: 'ok' });
                });
            }
        }

        //
        // END POST
        //
    } else if (req.method === 'GET') {
        const db = req.db;
        const collection = db.collection('users');
        const method = req.query.method;

        /********************************************
         GET STORES
        ********************************************/
        if (method === 'getStores') {
            const user = await collection.findOne({ _id: new ObjectId(req.jwt.user_id) });

            if (!user) {
                res.status(500).json({ message: 'User not found' });
                return;
            }

            res.status(200).json({ stores: user.stores });
            return;
        } else if (method === 'logout') {
            /********************************************
             LOGOUT
            ********************************************/
            res.setHeader('Set-Cookie', cookie.serialize('auth', '', {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                sameSite: 'strict',
                maxAge: 0,
                path: '/'
            }));

            res.status(200).json({ status: 'ok' });
            return;
        }

        res.status(500).json({ message: 'Method not supported' });
    }
}));