import { NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { database } from '../../middleware/database';
import { MyNextApiRequest } from '../../middleware/myNextApiRequest';
import { authenticate } from '../../middleware/authenticate';
import { compare } from '../../util/compare';
import { RECIPE_API_PUT_DETAILS, RECIPE_API_POST_INGREDIENT, RECIPE_API_DELETE_INGREDIENT, RECIPE_API_POST_CATEGORY, RECIPE_API_DELETE_CATEGORY } from '../../util/constants';

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

                recipe.ingredients.sort((a, b) => (a.name > b.name) ? 1 : -1);
                recipe.categories.sort((a, b) => (a > b) ? 1 : -1);

                res.status(200).json({ recipe });
                return;
            } else if (req.query.method === 'getCategories') {
                const categoryCollection = db.collection('recipeCategories');
                let categories = await categoryCollection.find().toArray();

                categories.sort(compare);

                res.status(200).json({ categories });
                return;
            }
        } else if (req.method === 'POST') {
            if(req.body.method === RECIPE_API_POST_INGREDIENT) {
                const filter = { _id: new ObjectId(req.body.recipe_id.toString()), user_id: req.jwt.user_id };

                const recipe = await collection.findOne(filter);

                if(!recipe) {
                    res.status(500).json({ message: 'Not Found'} );
                    return;
                }

                const exists = recipe.ingredients.find(i => i.name === req.body.grocery);

                if(exists) {
                    res.status(200).json({ message: 'Already Exists'} );
                    return;
                }

                const push = { $push: { ingredients: { name: req.body.grocery } } };

                await collection.updateOne(filter, push);

                res.status(200).json({ message: 'OK' });
                return;
            } else if (req.body.method === RECIPE_API_POST_CATEGORY) {
                const filter = { _id: new ObjectId(req.body.recipe_id.toString()), user_id: req.jwt.user_id };

                const recipe = await collection.findOne(filter);

                if(!recipe) {
                    res.status(500).json({ message: 'Not Found'} );
                    return;
                }

                const exists = recipe.categories.find(c => c === req.body.category);

                if(exists) {
                    res.status(200).json({ message: 'Already Exists'} );
                    return;
                }

                const push = { $push: { categories: req.body.category } };

                await collection.updateOne(filter, push);

                res.status(200).json({ message: 'OK' });
                return;
            }
        } else if (req.method === 'PUT') {
            if(req.body.method === RECIPE_API_PUT_DETAILS) {
                const filter = { _id: new ObjectId(req.body.recipe_id.toString()), user_id: req.jwt.user_id };
                const set = { $set: { name: req.body.name, link: req.body.link } };

                await collection.updateOne(filter, set);

                res.status(200).json({ message: 'OK' });
                return;
            }
        } else if (req.method === 'DELETE') {
            if(req.body.method === RECIPE_API_DELETE_INGREDIENT) {
                const filter = { _id: new ObjectId(req.body.recipe_id.toString()), user_id: req.jwt.user_id };
                const pull = { $pull: { ingredients: { name: req.body.ingredient.name } } };

                await collection.updateOne(filter, pull);
                
                res.status(200).json({ message: 'OK' });
                return;
            } else if(req.body.method === RECIPE_API_DELETE_CATEGORY) {
                const filter = { _id: new ObjectId(req.body.recipe_id.toString()), user_id: req.jwt.user_id };
                const pull = { $pull: { categories: req.body.category } };

                await collection.updateOne(filter, pull);
                
                res.status(200).json({ message: 'OK' });
                return;
            }
        }

        res.status(500).json({ message: 'Method not supported' });
        return;
    } catch (e) {
        res.status(500).json({ message: 'Unexpected error' });
        return;
    }
}));