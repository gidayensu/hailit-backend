import { v4 as uuid } from "uuid";
import { errorHandler } from "../utils/errorHandler.js";
import {
  DRIVER_TABLE_NAME,
  DRIVER_TABLE_COLUMNS,
  DEFAULT_VEHICLE_ID, DRIVER_ID_COLUMN, DRIVER_VEHICLE_ID, EMAIL_COLUMN, PHONE_NUMBER, 
  USER_FIRST_NAME, USER_ID_DRIVER, USER_ID_USERS, USER_LAST_NAME, VEHICLE_ID_COLUMN, VEHICLE_NAME_COLUMN,
  VEHICLE_PLATE_COLUMN, VEHICLE_TABLE, 
} from '../constants/driverConstants.js';
import { USER_TABLE_NAME } from "../constants/usersConstants.js";
import { USER_ID_COLUMN } from "../constants/usersConstants.js";

import { addOne } from "./DB/addDbFunctions.js";
import { deleteOne } from "./DB/deleteDbFunctions.js";
import {
  getCountOnOneCondition,
  getOne,
  getSpecificDetails,
  getSpecificDetailsUsingId
} from "./DB/getDbFunctions.js";
import { updateOne } from "./DB/updateDbFunctions.js";
import { getDispatchersVehicleJoin } from "./DB/usersDbFunctions.js";

export const getAllDriversFromDB = async (limit, offset) => {
  try {
    const allDrivers = await getDispatchersVehicleJoin(
      DRIVER_TABLE_NAME,
      USER_TABLE_NAME,
      VEHICLE_TABLE,

      USER_FIRST_NAME,
      USER_LAST_NAME,
      PHONE_NUMBER,
      EMAIL_COLUMN,
      VEHICLE_NAME_COLUMN,
      VEHICLE_PLATE_COLUMN,
      USER_ID_DRIVER,
      USER_ID_USERS, 
      DRIVER_VEHICLE_ID,
      VEHICLE_ID_COLUMN, 
      DRIVER_ID_COLUMN,
      limit,
      offset
    );
    
    return allDrivers;
  } catch (err) {
    
    return errorHandler("server error occurred getting drivers", `${err}`, 500, "Driver Model");

  }
};


export const getDriversCount = async()=> {
  try {
    const driversCount = await getCountOnOneCondition(DRIVER_TABLE_NAME);
    
    return driversCount;
    
  } catch(err) {
    return errorHandler("Error occurred getting drivers count", `${err}`, 500, "Driver Model: Drivers Count")
  }
}

export const getOneDriverFromDB = async (driver_id) => {
  try {
    const driverIdColumn = DRIVER_TABLE_COLUMNS[0];
    const driver = await getOne(DRIVER_TABLE_NAME, driverIdColumn, driver_id);
    if (driver.error) {
      return driver; //error details returned
    }

    return driver[0];
  } catch (err) {
    return errorHandler("Error occurred. Driver not fetched", `${err}`, 500, "Driver Model");

  }
};

export const getDriverDetailOnCondition = async (columnName, condition) => {
  try {
    const driverDetails = await getOne(
      DRIVER_TABLE_NAME,
      columnName,
      condition
    );

       

    return driverDetails
  } catch (err) {
    return errorHandler("Error occurred finding driver details", `${err}`, 500, "Driver Model");

  }
};
export const getSpecificDriversFromDB = async (specificColumn, condition) => {
  try {
    const specificDrivers = await getSpecificDetails(
      DRIVER_TABLE_NAME,
      specificColumn,
      condition
    );
    return specificDrivers;
  } catch (err) {
    return errorHandler("Error occurred in retrieving drivers", `${err}`, 500, "Driver Model");

  }
};

export const addDriverToDB = async (user_id, vehicle_id) => {
  const userIsDriver = await getSpecificDetailsUsingId(
    DRIVER_TABLE_NAME,
    user_id,
    USER_ID_COLUMN,
    DRIVER_ID_COLUMN
  );
  if (userIsDriver.length >= 1) {
    return errorHandler("User is driver", "User already exists as driver", 400, "Driver Model");

  }

  const driver_id = uuid();
  let DRIVER_VEHICLE_ID = "";
  vehicle_id
    ? (DRIVER_VEHICLE_ID = vehicle_id)
    : (DRIVER_VEHICLE_ID = DEFAULT_VEHICLE_ID);
  const driverDetails = [driver_id, user_id, DRIVER_VEHICLE_ID];
  try {
    const addedDriver = await addOne(
      DRIVER_TABLE_NAME,
      DRIVER_TABLE_COLUMNS,
      driverDetails
    );
    
  return addedDriver;
  
  } catch (err) {
    return errorHandler("Error occurred adding driver", `${err}`, 500, "Driver Model");

  }
};

export const updateDriverOnDB = async (driverDetails) => {
  const { driver_id } = driverDetails;
  const idColumn = DRIVER_TABLE_COLUMNS[0];
  const tableColumns = Object.keys(driverDetails);
  const driverDetailsArray = Object.values(driverDetails);

  try {
    const driverUpdate = await updateOne(
      DRIVER_TABLE_NAME,
      tableColumns,
      driver_id,
      idColumn,
      ...driverDetailsArray
    );

    if (driverUpdate.error) {
      return driverUpdate; //Error details returned
    }
    if (driverUpdate.rowCount === 0) {
      return errorHandler("Driver details not updated", "Driver detail not found", 400, "Driver Model");

    }
    return driverUpdate.rows[0];
  } catch (err) {
    
    return errorHandler("Error occurred in updating driver details", `${err}`, 500, "Driver Model");
  }
};

export const deleteDriverFromDB = async (driver_id) => {
  try {

    const driverDelete = await deleteOne(
      DRIVER_TABLE_NAME,
      DRIVER_TABLE_COLUMNS[0],
      driver_id
    );
    
      return driverDelete;
    
  } catch (err) {
    return errorHandler("Server Error occurred deleting driver", `${err}`, 500, "Driver Model")
  }
};
