import { Db, ObjectId } from 'mongodb';
import { NextApiRequest } from 'next';

export interface MyJWT {
    user_id: string,
    sub: string,
    name: string,
    email: string,
    iat: number;
    exp: number;
    authenticated: boolean;
}

export interface MyNextApiRequest extends NextApiRequest {
    db: Db,
    jwt: MyJWT
}