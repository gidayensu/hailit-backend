

export const DRIVER_TABLE_NAME = "driver";
export const DRIVER_TABLE_COLUMNS = ["driver_id", "user_id", "vehicle_id"];
export const DEFAULT_VEHICLE_ID = "04daa784-1dab-4b04-842c-a9a3ff8ae016";
export const USER_FIRST_NAME = "users.first_name";
export const USER_LAST_NAME = "users.last_name";

export const VEHICLE_TABLE = "vehicle";
export const USER_ID_DRIVER = "driver.user_id";
export const USER_ID_USERS = "users.user_id";
export const EMAIL_COLUMN = "users.email";
export const VEHICLE_NAME_COLUMN = "vehicle.vehicle_name";
export const VEHICLE_PLATE_COLUMN = "vehicle.plate_number";
export const DRIVER_VEHICLE_ID = "driver.vehicle_id";
export const VEHICLE_ID_COLUMN = "vehicle.vehicle_id";
export const DRIVER_ID_COLUMN = "driver_id";
export const PHONE_NUMBER = "users.phone_number";
export const GET_DRIVER_COLUMNS = ["first_name", "last_name", "phone_number"]

export const ALLOWED_DRIVER_UPDATE_PROPERTIES = [
    "driver_id",
    "vehicle_id",
    "license_number",
    "available",
  ];

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
      "Full Name": "users.first_name, users.last_name",
      "Email": "users.email",
      "Phone Number": "users.phone_number",
      "License Number": "driver.license_number",
      "Rating": "driver.cumulative_rating",
      "Vehicle Name": "vehicle.vehicle_name",
      "Vehicle Number": "vehicle.plate_number",
      "Availability": "driver.available",
    };