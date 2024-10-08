import { v4 as uuid } from "uuid";
import { DEFAULT_LIMIT } from "../constants/sharedConstants";
import {
  ALLOWED_VEHICLE_PROPERTIES
} from "../constants/vehicleConstants";
import {
  addVehicleToDB,
  deleteVehicleFromDB,
  getAllVehiclesFromDB,
  getOneVehicleFromDB,
  getVehiclesCount,
  updateVehicleOnDB,
} from "../model/vehicle.model";
import { allowedPropertiesOnly } from "../utils/util";
import { ErrorResponse, handleError } from "../utils/handleError";
import { getAllEntitiesService } from "./helpers.service";
import { GetAll } from "../types/getAll.types";
import { Vehicle } from "../types/vehicle.types";

export const getAllVehiclesService = async (
 { page,
  limit = DEFAULT_LIMIT,
  sortColumn,
  sortDirection,
  search}:GetAll
) => {
  try {
    
    
    const allVehicles: Vehicle | ErrorResponse = await getAllEntitiesService(
      {page,
      limit,
      sortColumn,
      sortDirection,
      search,
      getAllEntitiesFromDB: getAllVehiclesFromDB,
      getCount: getVehiclesCount,
      entityName: "vehicles"}
    );


    return allVehicles;

  } catch (err) {
    return handleError({ error:
      "Server error occurred getting all vehicles",
      errorMessage: 
      `${err}`,
      errorCode: 500,
      errorSource:"Vehicle Service"}
    );
  }
};

export const getOneVehicleService = async (vehicle_id) => {
  try {
    const getVehicle = await getOneVehicleFromDB(vehicle_id);
    return getVehicle;
  } catch (err) {
    return handleError({
      error:"Server error occurred",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Vehicle Service" }
    );
  }
};

export const addVehicleService = async (vehicleDetails) => {
  const vehicle_id = uuid();

  const completeVehicleDetails = {
    vehicle_id,
    ...vehicleDetails,
  };

  const validVehicleDetails = allowedPropertiesOnly({
    data: completeVehicleDetails,
    allowedProperties: ALLOWED_VEHICLE_PROPERTIES,
  });

  try {
    const addVehicleResult = await addVehicleToDB(validVehicleDetails);
    return addVehicleResult;
  } catch (err) {
    return handleError({
      error:"Error occurred. Vehicle not added",
      errorMessage:`${err}`,
      errorCode:500,
      errorSource:"Vehicle Service"}
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
    return handleError({
      error:"Server Error. Vehicle not updated",
      errorMessage:`${err}`,
      errorCode:500,
      errorSource:"Vehicle Service"}
    );
  }
};

export const deleteVehicleService = async (vehicle_id) => {
  try {
    const deleteVehicle = await deleteVehicleFromDB(vehicle_id);
    return deleteVehicle;
  } catch (err) {
    return handleError({
      error: "Server Error. Vehicle not deleted",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Vehicle Service"
    }
    
    );
  }
};
