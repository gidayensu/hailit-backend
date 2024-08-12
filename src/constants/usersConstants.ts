

export const USER_ID_COLUMN = 'user_id';
export const ALLOWED_PROPERTIES = [
    "user_id",
    "first_name",
    "last_name",
    "email",
    "phone_number",
    "user_role",
    "onboard"
  ];
export const SORTABLE_PROPERTIES = [
    "user_id",
    "first_name",
    "last_name",
    "email",
    "phone_number",
    "user_role",
    "onboard",
    "date_created"
  ];

  export const USER_TABLE_NAME = "users";

  export const USER_COLUMNS_FOR_ADDING = [
    "user_id",
    "first_name",
    "last_name",
    "email",
    "phone_number",
    "user_role",
    
  ];

  export const DEFAULT_USER_ID = '92e6ff67-a1d0-4f56-830c-60d23a63913d';
  export const USER_EMAIL_COLUMN = "email";
  export const USER_PHONE_NUMBER_COLUMN = "phone_number";
  export const USER_ROLE = "Customer";
  export const USER_ROLE_COLUMN = "user_role";
  export const ALLOWED_USER_ROLES = ['Admin', 'Driver', 'Rider', 'Customer', 'Dispatcher'];

  export const CLIENT_SORT_COLUMNS = [
    "First Name",
    "Last Name",
    "Email",
    "Phone Number",
    "User Role",
    "Onboard Status",
    "Date Joined",
  ];


  export const CLIENT_COLS_DB_COLS_MAP = {
    "First Name": "first_name",
    "Last Name": "last_name",
    "Email": "email",
    "Phone Number": "phone_number",
    "User Role": "user_role",
    "Onboard Status": "onboard",
    "Date Joined": "date_created",
  };