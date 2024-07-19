import { v4 as uuid } from "uuid";
import {
  ALLOWED_VEHICLE_PROPERTIES,
  VEHICLE_TYPE_COLUMN,
} from "../constants/vehicleConstants.js";
import {
  addVehicleToDB,
  deleteVehicleFromDB,
  getAllVehiclesFromDB,
  getOneVehicleFromDB,
  getVehiclesCount,
  updateVehicleOnDB,
} from "../model/vehicle.model.js";
import { allowedPropertiesOnly } from "../utils//util.js";
import { errorHandler } from "../utils/errorHandler.js";
import { paginatedRequest } from "../utils/paginatedRequest.js";

export const getAllVehiclesService = async (page, vehicleType) => {
  try {
    const limit = 7;
    let offset = 0;

    page > 1 ? (offset = limit * page - limit) : page;

    const vehiclesArgs = [limit, offset];
    const totalCountArgs = [];
    if (vehicleType === "car" || vehicleType === "motor") {
      vehiclesArgs.push(vehicleType, VEHICLE_TYPE_COLUMN);
      totalCountArgs.push(vehicleType, VEHICLE_TYPE_COLUMN);
    }

    const allVehicles = await getAllVehiclesFromDB(...vehiclesArgs);

    const totalCount = await getVehiclesCount(...totalCountArgs);

    return await paginatedRequest(
      totalCount,
      allVehicles,
      offset,
      limit,
      "vehicles"
    );
  } catch (err) {
    return errorHandler(
      "Server error occurred getting all vehicles",
      `${err}`,
      500,
      "Vehicle Service"
    );
  }
};

export const getOneVehicleService = async (vehicle_id) => {
  try {
    const getVehicle = await getOneVehicleFromDB(vehicle_id);
    return getVehicle;
  } catch (err) {
    return errorHandler(
      "Server error occurred",
      `${err}`,
      500,
      "Vehicle Service"
    );
  }
};

export const addVehicleService = async (vehicleDetails) => {
  const vehicle_id = uuid();

  const completeVehicleDetails = {
    vehicle_id,
    ...vehicleDetails,
  };

  const validVehicleDetails = allowedPropertiesOnly(
    completeVehicleDetails,
    ALLOWED_VEHICLE_PROPERTIES
  );

  try {
    const addVehicleResult = await addVehicleToDB(validVehicleDetails);
    return addVehicleResult;
  } catch (err) {
    return errorHandler(
      "Error occurred. Vehicle not added",
      `${err}`,
      500,
      "Vehicle Service"
    );
  }
};

export const updateVehicleService = async (
  vehicle_id,
  vehicleUpdateDetails
) => {
  try {
    const updateVehicle = await updateVehicleOnDB(
      vehicle_id,
      vehicleUpdateDetails
    );
    if (updateVehicle.error) {
      return { error: updateVehicle.error };
    }

    return updateVehicle;
  } catch (err) {
    return errorHandler(
      "Server Error. Vehicle not updated",
      `${err}`,
      500,
      "Vehicle Service"
    );
  }
};

export const deleteVehicleService = async (vehicle_id) => {
  try {
    const deleteVehicle = await deleteVehicleFromDB(vehicle_id);
    return deleteVehicle;
  } catch (err) {
    return errorHandler(
      "Vehicle not deleted. Server Error",
      `${err}`,
      500,
      "Vehicle Service"
    );
  }
};
