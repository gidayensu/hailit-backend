

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