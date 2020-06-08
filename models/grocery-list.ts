import { ObjectId } from 'mongodb';
import { GroceryListItem } from './grocery-list-item';

export interface GroceryList {
    _id: ObjectId,
    user_id: string,
    name: string,
    groceries: GroceryListItem[];
}