import { decode } from 'jsonwebtoken';
import { NextApiHandler, NextApiResponse } from 'next';
import { MyNextApiRequest } from './myNextApiRequest';
import { MyJWT } from './myNextApiRequest';

const authenticateRoles = (fn: NextApiHandler, roles: string[]) => async (req: MyNextApiRequest, res: NextApiResponse) => {
    if(!req.cookies.auth || req.cookies.auth.length == 0 || !req.jwt) {
        res.status(401).json({ message: 'Sorry you are not authenticated' });
        return;
    } 

    const found = roles.some(r => req.jwt.roles.indexOf(r) >= 0);

    if(found) {
        return await fn(req, res);
    }

    res.status(401).json({ message: 'Sorry you are not authenticated' });
    return;
}

export { authenticateRoles };