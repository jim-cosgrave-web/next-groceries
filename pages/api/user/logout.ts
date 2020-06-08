import { NextApiResponse } from 'next';
import { database, MyNextApiRequest } from '../../../middleware/database';
import cookie from 'cookie';

export default database(async function logout(
    req: MyNextApiRequest,
    res: NextApiResponse
) {
    if (req.method != 'GET') {
        res.status(500).json({ status: 'POST only' });
        return;
    }

    res.setHeader('Set-Cookie', cookie.serialize('auth', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 0,
        path: '/'
    }));

    res.status(200).json({ status: 'ok' });
});