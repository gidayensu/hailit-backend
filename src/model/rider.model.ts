import { v4 as uuid } from "uuid";
import {
  DEFAULT_VEHICLE_ID,
  EMAIL_COLUMN,
  PHONE_NUMBER,
  RIDER_COLUMNS_FOR_ADDING,
  RIDER_ID_COLUMN,
  RIDER_TABLE_NAME,
  RIDER_VEHICLE_ID,
  USER_FIRST_NAME,
  USER_ID_RIDER,
  USER_ID_USERS,
  USER_LAST_NAME,
  VEHICLE_ID,
  VEHICLE_NAME_COLUMN,
  VEHICLE_PLATE_COLUMN,
} from "../constants/riderConstants.js";
import { USER_ID_COLUMN, USER_TABLE_NAME } from "../constants/usersConstants.js";
import { VEHICLE_TABLE_NAME } from "../constants/vehicleConstants.js";
import { errorHandler } from "../utils/errorHandler.js";
import { addOne } from "./DB/addDbFunctions.js";
import { deleteOne } from "./DB/deleteDbFunctions.js";
import {
  
  getOne,
  getSpecificDetails,
  getSpecificDetailsUsingId,
} from "./DB/getDbFunctions.js";
import { updateOne } from "./DB/updateDbFunctions.js";
import { getDispatchersVehicleJoin, getDispatcherCount } from "./DB/usersDbFunctions.js";


export const getAllRiders = async (limit,
  offset,
  sortColumn,
  sortDirection,
  search) => {
  try {
    const allRiders = await getDispatchersVehicleJoin(
      RIDER_TABLE_NAME,
      USER_TABLE_NAME,
      VEHICLE_TABLE_NAME,
      USER_FIRST_NAME,
      USER_LAST_NAME,
      PHONE_NUMBER,
      EMAIL_COLUMN,
      VEHICLE_NAME_COLUMN,
      VEHICLE_PLATE_COLUMN,
      USER_ID_RIDER,
      USER_ID_USERS,
      RIDER_VEHICLE_ID,
      VEHICLE_ID,
      RIDER_ID_COLUMN,
      limit,
      offset,
      sortColumn,
      sortDirection,
      search
    );
    if (allRiders.error) {
      return errorHandler(allRiders.error, null, 500, "All Riders Model");
    }
    return allRiders;
  } catch (err) {
    return errorHandler("Server error occurred getting all riders", `${err}`, 500, "All Riders Model");
  }
};

export const getRidersCount = async(search)=> {
  try {
    const ridersCount = await getDispatcherCount(
      RIDER_TABLE_NAME,
      USER_TABLE_NAME,
      VEHICLE_TABLE_NAME,
      USER_FIRST_NAME,
      USER_LAST_NAME,
      PHONE_NUMBER,
      EMAIL_COLUMN,
      VEHICLE_NAME_COLUMN,
      VEHICLE_PLATE_COLUMN,
      USER_ID_RIDER,
      USER_ID_USERS,
      RIDER_VEHICLE_ID,
      VEHICLE_ID,
      RIDER_ID_COLUMN,
      search
    );
    
    return ridersCount;
    
  } catch(err) {
    return errorHandler("Error occurred getting Riders Count", `${err}`, 500, "Rider Model: Riders Count")
  }
}

export const getOneRiderFromDB = async (rider_id) => {
  try {
    
    const rider = await getOne(
      RIDER_TABLE_NAME,
      RIDER_ID_COLUMN,
      rider_id
    );
    if (rider.error) {
      return errorHandler("Rider not found", null, 404, "Rider Model");
    }
    return rider[0];
  } catch (err) {
    return errorHandler("Error occurred. Rider not fetched", `${err}`, 500, "Rider Model"); 
  }
};

export const getRiderOnConditionFromDB = async (columnName, condition) => {
  try {
    const riderDetails = await getOne(
      RIDER_TABLE_NAME,
      columnName,
      condition
    );
    return riderDetails;
  } catch (err) {
    return errorHandler("No Rider Details Found", null, 404, "Rider Model");
  }
};

export const getSpecificRidersFromDB = async (specificColumn, condition) => {
  try {
    const specificRiders = await getSpecificDetails(
      RIDER_TABLE_NAME,
      specificColumn,
      condition
    );
    return specificRiders;
  } catch (err) {
    return errorHandler("Error occurred in retrieving riders", `${err}`, 500, "Rider Model");
  }
};

export const addRiderToDB = async (user_id) => {
  try {
    const userIsRider = await getSpecificDetailsUsingId(RIDER_TABLE_NAME, user_id, USER_ID_COLUMN, RIDER_ID_COLUMN);
    
    if (userIsRider.length >= 1) {
      return errorHandler("User is rider", "User already exists", 400, "Rider Model");
    }
    const rider_id = uuid();
    const riderDetails = [rider_id, DEFAULT_VEHICLE_ID, user_id];
    const addingMotor = await addOne(
      RIDER_TABLE_NAME,
      RIDER_COLUMNS_FOR_ADDING,
      riderDetails
    );
    
      return addingMotor;
    
  } catch (err) {
    return errorHandler("Error occurred adding rider", `${err}`, 500, "Rider Model");
  }
};

export const updateRiderOnDB = async (riderDetails) => {
  const { rider_id } = riderDetails;
  
  const tableColumns = Object.keys(riderDetails);
  const riderDetailsArray = Object.values(riderDetails);

  try {
    const riderUpdate = await updateOne(
      RIDER_TABLE_NAME,
      tableColumns,
      rider_id,
      RIDER_ID_COLUMN,
      ...riderDetailsArray
    );
    if (riderUpdate.error) {
      return riderUpdate //error details returned
    }
    if (riderUpdate.rowCount === 0) {
      return errorHandler("Rider details not updated", "Rider detail not found", 400, "Rider Model");
    }
    return riderUpdate.rows[0];
  } catch (err) {
    return errorHandler("Error occurred in updating rider details", `${err}`, 500, "Rider Model");
  }
};

export const deleteRiderFromDB = async (rider_id) => {
  try {
    const riderDelete = await deleteOne(
      RIDER_TABLE_NAME,
      RIDER_ID_COLUMN,
      rider_id
    );

    
      return riderDelete;
    
    
  } catch (err) {
    return errorHandler("Error Occurred Deleting Rider", `${err}`, 500, "Rider Model");
  }
};
