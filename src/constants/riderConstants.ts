export const ALLOWED_UPDATE_RIDER_PROPERTIES = ["rider_id", "vehicle_id", "license_number", "available"];
export const RIDER_DETAILS = ["first_name", "last_name", "phone_number"];
export const RIDER_TABLE_NAME = "rider";
export const RIDER_COLUMNS_FOR_ADDING = ["rider_id", "vehicle_id", "user_id"];
export const DEFAULT_VEHICLE_ID = "04daa784-1dab-4b04-842c-a9a3ff8ae016";
export const USER_FIRST_NAME = "users.first_name";
export const USER_LAST_NAME = "users.last_name";
export const USERS_TABLE = "users";
export const USER_ID_RIDER = "rider.user_id";
export const USER_ID_USERS = "users.user_id";
export const EMAIL_COLUMN = "users.email";
export const VEHICLE_NAME_COLUMN = "vehicle.vehicle_name";
export const VEHICLE_PLATE_COLUMN = "vehicle.plate_number";
export const RIDER_VEHICLE_ID = "rider.vehicle_id";
export const VEHICLE_ID = "vehicle.vehicle_id";
export const RIDER_ID_COLUMN = "rider_id";
export const PHONE_NUMBER = "users.phone_number";

export const RATING_COUNT_COLUMN = 'rating_count';

export const CLIENT_SORT_COLUMNS = [
  "Full Name",
  "Email",
  "Phone Number",
  "License Number",
  "Rating",
  "Vehicle Name",
  "Vehicle Number",
  "Availability",
]

export const CLIENT_COLS_DB_COLS_MAP = {
    "Full Name": "users.first_name",
    "Email": "users.email",
    "Phone Number": "users.phone_number",
    "License Number": "rider.license_number",
    "Rating": "rider.cumulative_rating",
    "Vehicle Name": "vehicle.vehicle_name",
    "Vehicle Number": "vehicle.plate_number",
    "Availability": "rider.available",
  };