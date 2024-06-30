import { errorHandler } from "../utils/errorHandler.js";
import { v4 as uuid } from "uuid";
import {
  addOne,
  selectOnCondition,
  deleteOne,
  getDispatchersVehicleJoin,
  getAll,
  getOne,
  getSpecificDetails,
  getSpecificDetailsUsingId,
  increaseByValue,
  updateOne,
} from "./dBFunctions.js";

const driverTableName = "driver";
const driverTableColumns = ["driver_id", "user_id", "vehicle_id"];
const defaultVehicleId = "04daa784-1dab-4b04-842c-a9a3ff8ae016";
const firstName = "users.first_name";
const lastName = "users.last_name";
const usersTable = "users";
const vehicleTable = "vehicle";
const userIdDriver = "driver.user_id";
const userIdUsers = "users.user_id";
const emailColumn = "users.email";
const vehicleNameColumn = "vehicle.vehicle_name";
const vehiclePlateColumn = "vehicle.plate_number";
const driverVehicleId = "driver.vehicle_id";
const vehicleId = "vehicle.vehicle_id";
const driverId = "driver_id";
const phoneNumber = "users.phone_number";

export const getAllDriversFromDB = async (limit, offset) => {
  try {
    const allDrivers = await getDispatchersVehicleJoin(
      driverTableName,
      usersTable,
      vehicleTable,
      firstName,
      lastName,
      phoneNumber,
      emailColumn,
      vehicleNameColumn,
      vehiclePlateColumn,
      userIdDriver,
      userIdUsers,
      driverVehicleId,
      vehicleId,
      driverId,
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
    const driversCount = await getCountOnOneCondition(driverTableName);
    
    return driversCount;
    
  } catch(err) {
    return errorHandler("Error occurred getting drivers count", `${err}`, 500, "Driver Model: Drivers Count")
  }
}

export const getOneDriverFromDB = async (driver_id) => {
  try {
    const driverIdColumn = driverTableColumns[0];
    const driver = await getOne(driverTableName, driverIdColumn, driver_id);
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
      driverTableName,
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
      driverTableName,
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
    driverTableName,
    user_id,
    "user_id",
    "driver_id"
  );
  if (userIsDriver.length >= 1) {
    return errorHandler("User is driver", "User already exists as driver", 400, "Driver Model");

  }

  const driver_id = uuid();
  let driverVehicleId = "";
  vehicle_id
    ? (driverVehicleId = vehicle_id)
    : (driverVehicleId = defaultVehicleId);
  const driverDetails = [driver_id, user_id, driverVehicleId];
  try {
    const addedDriver = await addOne(
      driverTableName,
      driverTableColumns,
      driverDetails
    );
    
  return addedDriver;
  
  } catch (err) {
    return errorHandler("Error occurred adding driver", `${err}`, 500, "Driver Model");

  }
};

export const updateDriverOnDB = async (driverDetails) => {
  const { driver_id } = driverDetails;
  const idColumn = driverTableColumns[0];
  const tableColumns = Object.keys(driverDetails);
  const driverDetailsArray = Object.values(driverDetails);

  try {
    const driverUpdate = await updateOne(
      driverTableName,
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
      driverTableName,
      driverTableColumns[0],
      driver_id
    );
    
      return driverDelete;
    
  } catch (err) {
    return errorHandler("Server Error occurred deleting driver", `${err}`, 500, "Driver Model")
  }
};
