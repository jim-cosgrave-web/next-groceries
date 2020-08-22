import { verify } from 'jsonwebtoken';
import { NextApiResponse } from 'next';
import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { database } from '../../middleware/database';
import cookie from 'cookie';
import { MyNextApiRequest, MyJWT } from '../../middleware/myNextApiRequest';
import { ObjectId } from 'mongodb';
import { authenticateNoRedirect } from '../../middleware/authenticateNoRedirect';

import { 
    SUBSCRIBE_TO_STORE_API_METHOD, 
    UNSUBSCRIBE_FROM_STORE_API_METHOD, 
    CHECK_ACTIVATION_CODE_API_METHOD, 
    USER_API_RENAME_CATEGORY, 
    USER_MEAL_API_GET,
    USER_MEAL_API_ADD,
    USER_MEAL_API_DELETE,
    ADMIN_API_CHANGE_USER_PASSWORD
} from '../../util/constants';

export default authenticateNoRedirect(database(async function login(
    req: MyNextApiRequest,
    res: NextApiResponse
) {
    const db = req.db;
    const collection = db.collection('users');
    const listCollection = db.collection('groceryLists');
    const userCategoriesCollection = db.collection('userCategories');
    const mealsCollection = db.collection('userMeals');

    if (req.method == 'POST') {
        const name: string = req.body.name;
        const email: string = req.body.email;
        const password: string = req.body.password;

        let method = 'login'

        if (name && name.trim().length > 0) {
            method = 'signup';
        }

        if (req.body.method && req.body.method.length > 0) {
            method = req.body.method;
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
            const userFilter = { "email": email };
            const existingUser = await db.collection('users').findOne({ "email": email });

            if (!existingUser) {
                res.status(401).json({ status: 'Unsuccessful login' });
            } else {
                

                compare(password, existingUser.password, async function (err, result) {
                    //
                    // result will be true/false
                    //
                    if (!err && result) {
                        //
                        // Create json token here
                        //
                        const claims = { 
                            sub: existingUser._id, 
                            name: existingUser.name, 
                            email: existingUser.email, 
                            user_id: existingUser._id.toString(), 
                            roles: existingUser.roles 
                        };
                        
                        //const jwt = sign(claims, process.env.JWT_SECRET, { expiresIn: '7d' });

                        //
                        // No expiration
                        //
                        const jwt = sign(claims, process.env.JWT_SECRET);
                        const tenYears = (10 * 365 * 24 * 60 * 60);

                        res.setHeader('Set-Cookie', cookie.serialize('auth', jwt, {
                            httpOnly: true,
                            secure: process.env.NODE_ENV !== 'development',
                            sameSite: 'strict',
                            maxAge: tenYears,
                            path: '/'
                        }));

                        await db.collection('users').updateOne(userFilter, { "$set": { "lastLogin": new Date() } });

                        //res.json({ authToken: jwt });
                        res.status(200).json({ status: 'Logged in', jwt });
                    } else {
                        res.status(401).json({ status: 'Oops.  Something went wrong' });
                    }
                });
            }
        } else if (method === 'signup') {
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
                        stores: [],
                        roles: [],
                        createdOn: new Date()
                    };

                    const newUserResponse = await collection.insertOne(user);
                    const newUserId = newUserResponse.ops[0]._id;

                    const groceryList = {
                        user_id: newUserId.toString(),
                        user_email: email,
                        name: "Groceries",
                        groceries: []
                    };

                    await listCollection.insert(groceryList);

                    res.status(200).json({ status: 'ok'});
                    return;
                });
            }
        } else if (method == SUBSCRIBE_TO_STORE_API_METHOD ) {
            //let push = { $push: { 'categories': newCategory } };
            const store_id = new ObjectId(req.body.store_id);
            const userFilter = { _id: new ObjectId(req.jwt.user_id) };
            const user = await collection.findOne(userFilter);

            let alreadySubbed = false;

            for(let i = 0; i < user.stores.length; i++) {
                if(user.stores[i].name == req.body.name) {
                    alreadySubbed = true;
                    break;
                }
            }

            if(!alreadySubbed) {
                const newStore = { store_id: req.body.store_id, name: req.body.name }
                user.stores.push(newStore)
                await collection.updateOne(userFilter, { $push: { 'stores': newStore } });
            }

            res.status(200).json({ stores: user.stores });
            return;
        } else if (method == UNSUBSCRIBE_FROM_STORE_API_METHOD) {
            const pull = { $pull: { "stores": { store_id: req.body.store_id } } };
            const userFilter = { _id: new ObjectId(req.jwt.user_id) };
            const user = await collection.updateOne(userFilter, pull);

            res.status(200).json(user);
            return;
        } else if (method == USER_API_RENAME_CATEGORY) {
            const userId = req.jwt.user_id;
            const filter = { user_id: userId, store_id: req.body.store_id, category_id: req.body.category_id };
            const existing = await userCategoriesCollection.findOne(filter);

            if(existing) {
                if(req.body.name == req.body.originalName) {
                    //
                    // Do a delete
                    //
                    await userCategoriesCollection.deleteOne(filter);
                } else {
                    //
                    // Do an update
                    //
                    await userCategoriesCollection.updateOne(filter, { $set: { name: req.body.name, modifiedOn: new Date() } });
                }
            } else {
                //
                // Do an insert
                //
                await userCategoriesCollection.insertOne({
                    user_id: userId, 
                    store_id: req.body.store_id, 
                    category_id: req.body.category_id,
                    name: req.body.name,
                    originalName: req.body.originalName,
                    createdOn: new Date()
                });
            }

            res.status(200).json({ message: 'OK' });
            return;
        } else if (method === USER_MEAL_API_ADD) {
            const meal = req.body.meal;
            delete meal._id;

            meal.user_id = req.jwt.user_id;
            const doc = await mealsCollection.insertOne(meal);

            res.status(200).json({ message: 'OK', _id: doc.ops[0]._id })
            return;
        }

        //
        // END POST
        //
    } else if (req.method === 'GET') {
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
        } else if (method === CHECK_ACTIVATION_CODE_API_METHOD) {
            const activationCollection = db.collection('activationCodes');
            const code = req.query.code;
            const filter = { code: code };

            const doc = await activationCollection.findOne(filter);

            if(doc) {
                res.status(200).json({ valid: true });
                return
            }

            res.status(200).json({ valid: false });
            return;
        } else if (method === 'adminUsers') {
            const users = await collection.find().toArray();

            res.status(200).json({ message: 'OK', users });
            return;
        } else if (method === USER_MEAL_API_GET) {
            const filter = { user_id: req.jwt.user_id };
            const meals = await mealsCollection.find(filter).toArray();

            res.status(200).json({ message: 'OK', meals });
            return;
        } else {
            //
            // Standard GET user
            //
            let user = null;
            const filter = { _id: new ObjectId(req.jwt.user_id) };

            if(req.jwt && req.jwt.user_id) {
                user = await collection.findOne(filter);
            }

            if (!user) {
                res.status(500).json({ message: 'User not found' });
                return;
            }

            await collection.updateOne(filter, { "$set": { "lastUse": new Date() } });

            res.status(200).json({ user: { 
                _id: user._id.toString(), 
                username: user.username, 
                email: user.email, 
                name: user.name,
                roles: user.roles,
                stores: user.stores
            }});

            return;
        } 

        res.status(500).json({ message: 'Method not supported' });
    } else if (req.method === 'DELETE') {
        if(req.body.method === USER_MEAL_API_DELETE) {
            const filter = { _id: new ObjectId(req.body.meal._id) };
            await mealsCollection.deleteOne(filter);

            res.status(200).json({ message: 'OK' });
            return;
        }      
    } else if (req.method === 'PUT') {
        if(req.body.method === ADMIN_API_CHANGE_USER_PASSWORD) {
            const filter = { _id: new ObjectId(req.body.user._id) };
            
            hash(req.body.user.password, 10, async function (err, hash) {
                //const user = await collection.find(filter).toArray();
                await collection.updateOne(filter, { "$set": { "password": hash } });


                res.status(200).json({ message: 'OK' });
                return;
            });
        }
    }
}));