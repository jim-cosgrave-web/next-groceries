import { verify } from 'jsonwebtoken';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { MyNextApiRequest } from './myNextApiRequest';
import { MyJWT } from './myNextApiRequest';

const authenticate = (fn: NextApiHandler) => async (req: MyNextApiRequest, res: NextApiResponse) => {
    //
    // With header
    //
    // verify(req.headers.authorization, process.env.JWT_SECRET, async function (err, decoded) {
    //     if (!err && decoded) {
    //         return await fn(req, res);
    //     }

    //     res.status(401).json({ message: 'Sorry you are not authenticated' });
    // });

    //
    // With cookie
    //
    if(!req.cookies.auth || req.cookies.auth.length == 0) {
        res.status(401).json({ message: 'Sorry you are not authenticated' });
        return;
    }

    verify(req.cookies.auth, process.env.JWT_SECRET, async function (err, decoded) {
        if (!err && decoded) {
            let anyDecoded = decoded as any;
            
            //req.jwt = token;
            req.jwt = {} as MyJWT;
            req.jwt.user_id = anyDecoded.user_id;
            req.jwt.sub = anyDecoded.sub;
            req.jwt.name = anyDecoded.name;
            req.jwt.email = anyDecoded.email;
            req.jwt.roles = anyDecoded.roles;

            return await fn(req, res);
        }

        res.status(401).json({ message: 'Sorry you are not authenticated' });
    });
}

export { authenticate };