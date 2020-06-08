import { verify } from 'jsonwebtoken';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

const authenticate = (fn: NextApiHandler) => async (req: NextApiRequest, res: NextApiResponse) => {
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
            return await fn(req, res);
        }

        res.status(401).json({ message: 'Sorry you are not authenticated' });
    });
}

export { authenticate };