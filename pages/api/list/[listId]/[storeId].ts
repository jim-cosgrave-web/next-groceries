import { MyNextApiRequest } from "../../../../middleware/myNextApiRequest";
import { NextApiResponse } from "next";
import { authenticate } from "../../../../middleware/authenticate";
import { database } from "../../../../middleware/database";

export default authenticate(database(async function getStoreList(
    req: MyNextApiRequest,
    res: NextApiResponse
) {
    if(req.method != 'GET') {
        res.status(500).json({status: 'GET only'});
        return;
    }

    const listId = req.query.listId;
    const storeId = req.query.storeId

    res.status(200).json({ listId, storeId });
}))