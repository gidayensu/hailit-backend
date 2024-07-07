import { errorHandler } from "../utils/errorHandler.js";
import { v4 as uuid } from "uuid";
import { addOne } from "./DB/addDbFunctions.js";
import {deleteOne} from "./DB/deleteDbFunctions.js"
import { getDispatchersVehicleJoin } from "./DB/usersDbFunctions.js";
import {
  selectOnCondition,
  getSpecificDetails,
  getOne,
  getCountOnOneCondition,
  getSpecificDetailsUsingId,
} from "./DB/getDbFunctions.js";
import {updateOne} from "./DB/updateDbFunctions.js"


const riderTableName = "rider";
const riderColumnsForAdding = ["rider_id", "vehicle_id", "user_id"];

const defaultVehicleId = "04daa784-1dab-4b04-842c-a9a3ff8ae016";
const firstName = "users.first_name";
const lastName = "users.last_name";
const usersTable = "users";
const vehicleTable = "vehicle";
const userIdRider = "rider.user_id";
const userIdUsers = "users.user_id";
const emailColumn = "users.email";
const vehicleNameColumn = "vehicle.vehicle_name";
const vehiclePlateColumn = "vehicle.plate_number";
const riderVehicleId = "rider.vehicle_id";
const vehicleId = "vehicle.vehicle_id";
const riderId = "rider_id";
const phoneNumber = "users.phone_number";

export const getAllRiders = async (limit, offset) => {
  try {
    const allRiders = await getDispatchersVehicleJoin(
      riderTableName,
      usersTable,
      vehicleTable,
      firstName,
      lastName,
      phoneNumber,
      emailColumn,
      vehicleNameColumn,
      vehiclePlateColumn,
      userIdRider,
      userIdUsers,
      riderVehicleId,
      vehicleId,
      riderId,
      limit,
      offset
    );
    if (allRiders.error) {
      return errorHandler(allRiders.error, null, 500, "All Riders Model");
    }
    return allRiders;
  } catch (err) {
    return errorHandler("Server error occurred getting all riders", `${err}`, 500, "All Riders Model");
  }
};

export const getRidersCount = async()=> {
  try {
    const ridersCount = await getCountOnOneCondition(riderTableName);
    
    return ridersCount;
    
  } catch(err) {
    return errorHandler("Error occurred getting Riders Count", `${err}`, 500, "Rider Model: Riders Count")
  }
}

export const getOneRiderFromDB = async (rider_id) => {
  try {
    const riderIdColumn = riderColumnsForAdding[0];
    const rider = await getOne(
      riderTableName,
      riderIdColumn,
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
      riderTableName,
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
      riderTableName,
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
    const userIsRider = await getSpecificDetailsUsingId(riderTableName, user_id, 'user_id', 'rider_id');
    
    if (userIsRider.length >= 1) {
      return errorHandler("User is rider", "User already exists", 400, "Rider Model");
    }
    const rider_id = uuid();
    const riderDetails = [rider_id, defaultVehicleId, user_id];
    const addingMotor = await addOne(
      riderTableName,
      riderColumnsForAdding,
      riderDetails
    );
    
      return addingMotor;
    
  } catch (err) {
    return errorHandler("Error occurred adding rider", `${err}`, 500, "Rider Model");
  }
};

export const updateRiderOnDB = async (riderDetails) => {
  const { rider_id } = riderDetails;
  const idColumn = riderColumnsForAdding[0];
  const tableColumns = Object.keys(riderDetails);
  const riderDetailsArray = Object.values(riderDetails);

  try {
    const riderUpdate = await updateOne(
      riderTableName,
      tableColumns,
      rider_id,
      idColumn,
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
      riderTableName,
      riderColumnsForAdding[0],
      rider_id
    );

    
      return riderDelete;
    
    
  } catch (err) {
    return errorHandler("Error Occurred Deleting Rider", `${err}`, 500, "Rider Model");
  }
};
