import { LOCAL_STORAGE_USER } from '../util/constants';
import { decode } from 'jsonwebtoken';

function getUser() {
    let user = null;
    const lsUser = localStorage.getItem(LOCAL_STORAGE_USER);

    if (lsUser && lsUser.length > 0) {
        
        const jsonUser = JSON.parse(lsUser);
        user = decode(jsonUser.jwt);
    }

    return user;
}

export default getUser;