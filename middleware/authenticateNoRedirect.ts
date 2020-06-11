import { verify } from 'jsonwebtoken';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { MyNextApiRequest } from './myNextApiRequest';
import { MyJWT } from './myNextApiRequest';

const authenticateNoRedirect = (fn: NextApiHandler) => async (req: MyNextApiRequest, res: NextApiResponse) => {
    //
    // With cookie
    //
    verify(req.cookies.auth, process.env.JWT_SECRET, async function (err, decoded) {
        if (!err && decoded) {
            let anyDecoded = decoded as any;
            
            //req.jwt = token;
            req.jwt = {} as MyJWT;
            req.jwt.user_id = anyDecoded.user_id;
            req.jwt.sub = anyDecoded.sub;
            req.jwt.name = anyDecoded.name;
            req.jwt.email = anyDecoded.email;

            return await fn(req, res);
        }

        return await fn(req, res);
    });
}

export { authenticateNoRedirect };