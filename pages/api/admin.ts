import { NextApiResponse } from 'next';
import { database } from '../../middleware/database';
import { MyNextApiRequest } from '../../middleware/myNextApiRequest';
import { authenticate } from '../../middleware/authenticate';
import { writeLog } from '../../util/logger';

export default authenticate(database(async function adminAPI(
    req: MyNextApiRequest,
    res: NextApiResponse
) {
    try {
        if(req.method == 'GET') {

        } else if (req.method == 'POST') {

        } else if (req.method == 'PUT') {

        } else if (req.method == 'DELETE') {

        }

        return res.status(200).json({message: 'ok'});
    } catch(e) {
        await writeLog('Admin API', { exception: e })
        res.status(500).json({ message: 'Unexpected error' });
        return;
    }
}));