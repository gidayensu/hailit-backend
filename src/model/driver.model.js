import { v4 as uuid } from "uuid";
import {
  addOne,
  checkOneDetail,
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
    if (allDrivers.error) {
      return { error: "No driver found" };
    }
    return allDrivers;
  } catch (err) {
    console.log(err)
    return { error: "server error occurred getting drivers" };
  }
};

export const getOneDriverFromDB = async (driver_id) => {
  try {
    const driverIdColumn = driverTableColumns[0];
    const driver = await getOne(driverTableName, driverIdColumn, driver_id);
    if (!driver) {
      return { error: "Driver not found" };
    }

    return driver[0];
  } catch (err) {
    return { error: "Error occurred. Driver not fetched" };
  }
};

export const getDriverDetailOnCondition = async (columnName, condition) => {
  try {
    const driverDetails = await checkOneDetail(
      driverTableName,
      columnName,
      condition
    );

    if (driverDetails.rowCount === 0) {
      return { error: "driver detail not found" };
    }

    return driverDetails.rows;
  } catch (err) {
    return { error: "Error occurred finding driver details" };
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
    return { error: `Error occurred in retrieving drivers: ${err}` };
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
    return { error: "User is driver" };
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
    if (addedDriver) {
      return addedDriver;
    }
  } catch (err) {
    return { error: "error" };
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

    if (driverUpdate.rowCount === 0) {
      return { error: "Driver details not updated" };
    }
    return driverUpdate.rows[0];
  } catch (err) {
    return { error: `Error occurred in updating driver details ${err}` };
  }
};

export const deleteDriverFromDB = async (driver_id) => {
  const driverDelete = await deleteOne(
    driverTableName,
    driverTableColumns[0],
    driver_id
  );
  if (driverDelete) {
    return driverDelete;
  } else {
    return { error: "driver not deleted" };
  }
};
