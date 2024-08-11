//constants
import {
  DEFAULT_VEHICLE_ID,
  DRIVER_ID_COLUMN,
  DRIVER_TABLE_COLUMNS,
  DRIVER_TABLE_NAME,
} from "../constants/driverConstants.js";
import { USER_ID_COLUMN } from "../constants/usersConstants";

//DB functions
import { addOne } from "./DB/addDbFunctions";
import { deleteOne } from "./DB/deleteDbFunctions";
import {
  getOne,
  getSpecificDetails,
  getSpecificDetailsUsingId,
} from "./DB/getDbFunctions";
import { updateOne } from "./DB/updateDbFunctions";
import {
  getDispatcherCount,
  getDispatchersVehicleJoin,
} from "./DB/usersDbFunctions";

//helpers
import { v4 as uuid } from "uuid";
import { handleError } from "../utils/handleError.js";

//types
import { DriverDetails } from "../services/driver.service.js";
import { GetAllFromDB } from "../types/getAll.types.js";

export const getAllDriversFromDB = async ({
  limit,
  offset,
  sortColumn,
  sortDirection,
  search,
}: GetAllFromDB) => {
  try {
    const allDrivers = await getDispatchersVehicleJoin({
      limit,
      offset,
      sortColumn,
      sortDirection,
      search,
      dispatcherRole: "Driver",
    });

    return allDrivers;
  } catch (err) {
    return handleError({
      error: "server error occurred getting drivers",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Driver Model",
    });
  }
};

export const getDriversCount = async (search: string) => {
  try {
    const driversCount = await getDispatcherCount({
      search,
      dispatcherRole: "Driver",
    });

    return driversCount;
  } catch (err) {
    return handleError({
      error: "Error occurred getting drivers count",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Driver Model: Drivers Count",
    });
  }
};

export const getOneDriverFromDB = async (driver_id: string) => {
  try {
    const driver = await getOne({
      tableName: DRIVER_TABLE_NAME,
      columnName: DRIVER_ID_COLUMN,
      condition: driver_id,
    });
    if (driver.error) {
      return driver; //error details returned
    }

    return driver[0];
  } catch (err) {
    return handleError({
      error: "Error occurred. Driver not fetched",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Driver Model",
    });
  }
};

export const getDriverDetailOnCondition = async (columnName, condition) => {
  try {
    const driverDetails = await getOne({
      tableName: DRIVER_TABLE_NAME,
      columnName: columnName,
      condition: condition,
    });

    return driverDetails;
  } catch (err) {
    return handleError({
      error: "Error occurred finding driver details",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Driver Model",
    });
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
    return handleError({
      error: "Error occurred in retrieving drivers",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Driver Model",
    });
  }
};

export const addDriverToDB = async ({
  userId,
  vehicleId,
}: {
  userId: string;
  vehicleId: string;
}) => {
  const userIsDriver = await getSpecificDetailsUsingId({
    tableName: DRIVER_TABLE_NAME,
    id: userId,
    idColumn: USER_ID_COLUMN,
    columns: DRIVER_ID_COLUMN,
  });
  if (userIsDriver.length >= 1) {
    return handleError({
      error: "User is driver",
      errorMessage: "User already exists as driver",
      errorCode: 400,
      errorSource: "Driver Model",
    });
  }

  const driver_id = uuid();
  let DRIVER_VEHICLE_ID = "";
  vehicleId
    ? (DRIVER_VEHICLE_ID = vehicleId)
    : (DRIVER_VEHICLE_ID = DEFAULT_VEHICLE_ID);
  const driverDetails = [driver_id, userId, DRIVER_VEHICLE_ID];
  try {
    const addedDriver = await addOne(
      DRIVER_TABLE_NAME,
      DRIVER_TABLE_COLUMNS,
      driverDetails
    );

    return addedDriver;
  } catch (err) {
    return handleError({
      error: "Error occurred adding driver",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Driver Model",
    });
  }
};

export const updateDriverOnDB = async (driverDetails: DriverDetails) => {
  const { driver_id } = driverDetails;

  const tableColumns = Object.keys(driverDetails);
  const driverDetailsArray = Object.values(driverDetails);

  try {
    const driverUpdate = await updateOne(
      DRIVER_TABLE_NAME,
      tableColumns,
      driver_id,
      DRIVER_ID_COLUMN,
      ...driverDetailsArray
    );

    if (driverUpdate.error) {
      return driverUpdate; //Error details returned
    }
    if (driverUpdate.rowCount === 0) {
      return handleError({
        error: "Driver details not updated",
        errorMessage: "Driver detail not found",
        errorCode: 400,
        errorSource: "Driver Model",
      });
    }
    return driverUpdate.rows[0];
  } catch (err) {
    return handleError({
      error: "Error occurred in updating driver details",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Driver Model",
    });
  }
};

export const deleteDriverFromDB = async (driver_id: string) => {
  try {
    const driverDelete = await deleteOne(
      DRIVER_TABLE_NAME,
      DRIVER_ID_COLUMN,
      driver_id
    );

    return driverDelete;
  } catch (err) {
    return handleError({
      error: "Server Error occurred deleting driver",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Driver Model",
    });
  }
};
