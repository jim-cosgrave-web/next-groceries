const DATABASE_NAME = 'groceriesDB';
const UPDATE_STORE_GROCERY_CATEGORY_API_METHOD = 'UPDATE_STORE_GROCERY_CATEGORY';
const UPDATE_STORE_GROCERY_API_METHOD = 'UPDATE_STORE_GROCERY';
const ADD_STORE_CATEGORY_API_METHOD = 'ADD_STORE_CATEGORY';
const SUBSCRIBE_TO_STORE_API_METHOD = 'SUBSCRIBE_TO_STORE';
const MOVE_STORE_CATEGORY_API_METHOD = 'MOVE_STORE_CATEGORY';
const UNSUBSCRIBE_FROM_STORE_API_METHOD = 'UNSUBSCRIBE_FROM_STORE';
const REORGANIZE_STORE_GROCERIES_API_METHOD = 'REORGANIZE_STORE_GROCERIES';
const DELETE_STORE_CATEGORY_API_METHOD = 'DELETE_STORE_CATEGORY';
const UPDATE_STORE_CATEGORY_API_METHOD = 'UPDATE_STORE_CATEGORY';
const ADD_STORE_GROCERY_API_METHOD = 'ADD_STORE_GROCERY';
const DELETE_STORE_GROCERY_API_METHOD = 'DELETE_STORE_GROCERY';
const CHECK_ACTIVATION_CODE_API_METHOD = 'CHECK_ACTIVATION_CODE';

const LIST_API_POST_RECIPE = 'LIST_API_POST_RECIPE';

const RECIPE_API_PUT_DETAILS = 'RECIPE_API_PUT_DETAILS';
const RECIPE_API_POST_RECIPE = 'RECIPE_API_POST_RECIPE';
const RECIPE_API_POST_INGREDIENT = 'RECIPE_API_POST_INGREDIENT';
const RECIPE_API_POST_CATEGORY = 'RECIPE_API_POST_CATEGORY';
const RECIPE_API_DELETE_INGREDIENT = 'RECIPE_API_DELETE_INGREDIENT';
const RECIPE_API_DELETE_CATEGORY = 'RECIPE_API_DELETE_CATEGORY';
const RECIPE_API_DELETE_RECIPE = 'RECIPE_API_DELETE_RECIPE';

const USER_API_RENAME_CATEGORY = 'USER_API_RENAME_CATEGORY';
const USER_API_ADD_TO_HOME_OK = 'USER_API_ADD_TO_HOME_OK';

const USER_MEAL_API_GET = 'USER_MEAL_API_GET';
const USER_MEAL_API_ADD = 'USER_MEAL_API_ADD';
const USER_MEAL_API_DELETE = 'USER_MEAL_API_DELETE';
const USER_MEAL_API_PUT = 'USER_MEAL_API_PUT';

const ADMIN_API_POST_STORE = 'ADMIN_API_POST_STORE';
const ADMIN_API_STORE_CLEAN_GROCERIES = 'ADMIN_API_STORE_CLEAN_GROCERIES';
const ADMIN_API_STORE_RESTORE = 'ADMIN_API_STORE_RESTORE';
const ADMIN_API_CHANGE_USER_PASSWORD = 'ADMIN_API_CHANGE_USER_PASSWORD';
const ADMIN_API_DELETE_USER = 'ADMIN_API_DELETE_USER';

const GROCERY_API_PUT_GROCERY = 'GROCERY_API_PUT_GROCERY';

const UNCATEGORIZED = '__ Uncategorized __';
const NOT_AVAILABLE_AT_STORE = 'Not Available At Store';

const LOCAL_STORAGE_USER = 'GROCERY_USER';
const LOCAL_STORAGE_STORE_LIST = 'STORE_LIST'
const LOCAL_STORAGE_A_Z_LIST = 'A_Z_LIST';
const LOCAL_STORAGE_SUBSCRIBED_STORES = 'SUBSCRIBED_STORES';

export {
    DATABASE_NAME,

    UPDATE_STORE_GROCERY_CATEGORY_API_METHOD,
    UPDATE_STORE_GROCERY_API_METHOD,
    ADD_STORE_CATEGORY_API_METHOD,
    SUBSCRIBE_TO_STORE_API_METHOD,
    UNSUBSCRIBE_FROM_STORE_API_METHOD,
    REORGANIZE_STORE_GROCERIES_API_METHOD,
    UPDATE_STORE_CATEGORY_API_METHOD,
    DELETE_STORE_CATEGORY_API_METHOD,
    ADD_STORE_GROCERY_API_METHOD,
    DELETE_STORE_GROCERY_API_METHOD,
    MOVE_STORE_CATEGORY_API_METHOD,
    CHECK_ACTIVATION_CODE_API_METHOD,

    LIST_API_POST_RECIPE,

    USER_API_RENAME_CATEGORY,
    USER_API_ADD_TO_HOME_OK,

    USER_MEAL_API_GET,
    USER_MEAL_API_ADD,
    USER_MEAL_API_DELETE,
    USER_MEAL_API_PUT,

    RECIPE_API_PUT_DETAILS,
    RECIPE_API_POST_INGREDIENT,
    RECIPE_API_POST_CATEGORY,
    RECIPE_API_DELETE_INGREDIENT,
    RECIPE_API_DELETE_CATEGORY,
    RECIPE_API_POST_RECIPE,
    RECIPE_API_DELETE_RECIPE,

    ADMIN_API_POST_STORE,
    ADMIN_API_STORE_CLEAN_GROCERIES,
    ADMIN_API_CHANGE_USER_PASSWORD,
    ADMIN_API_DELETE_USER,
    ADMIN_API_STORE_RESTORE,

    GROCERY_API_PUT_GROCERY,

    UNCATEGORIZED,
    NOT_AVAILABLE_AT_STORE,

    LOCAL_STORAGE_USER,
    LOCAL_STORAGE_STORE_LIST,
    LOCAL_STORAGE_A_Z_LIST,
    LOCAL_STORAGE_SUBSCRIBED_STORES
};