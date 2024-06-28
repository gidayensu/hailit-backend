import { paginatedRequest } from "../utils/paginatedRequest.js";
import { v4 as uuid } from "uuid";
import { addVehicleToDB, deleteVehicleFromDB, getAllVehiclesFromDB, getOneVehicleFromDB, updateVehicleOnDB, getVehiclesCount } from '../model/vehicle.model.js';
import { allowedPropertiesOnly } from "../utils//util.js";
import { errorHandler } from "../utils/errorHandler.js";

export const getAllVehiclesService = async (page) => {
  try {
    
    const limit = 7;
    let offset = 0;

    page > 1 ? offset = limit * page : page;

    const allVehicles = await getAllVehiclesFromDB(limit, offset);
    
    const totalCount = await getVehiclesCount();
    
    return await paginatedRequest(totalCount, allVehicles, offset, limit, "vehicles")
    
  } catch (err) {
    return errorHandler("Server error occurred getting all vehicles", `${err}`, 500, "Vehicle Service");
  }
};

export const getOneVehicleService = async (vehicle_id) => {
  try {

    const getVehicle = await getOneVehicleFromDB(vehicle_id);
    return getVehicle;

  } catch (err) {
    return errorHandler("Server error occurred", `${err}`, 500, "Vehicle Service");
  }
};

export const addVehicleService = async (vehicleDetails) => {
  const vehicle_id =  uuid();
  const allowedVehicleProperties = ["vehicle_name", "plate_number", "vehicle_type", "vehicle_model", "insurance_details", "road_worthy", "vehicle_id"]
  const completeVehicleDetails = {
    vehicle_id,
    ...vehicleDetails,
  };

  const validVehicleDetails = allowedPropertiesOnly(completeVehicleDetails, allowedVehicleProperties)

  try {
    const addVehicleResult = await addVehicleToDB(
      validVehicleDetails
    );
      return addVehicleResult;
    
  } catch (err) {
    
    return errorHandler("Error occurred. Vehicle not added", `${err}`, 500, "Vehicle Service");
  }
};

export const updateVehicleService = async (vehicle_id, vehicleUpdateDetails) => {
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
    return errorHandler("Server Error. Vehicle not updated", `${err}`, 500, "Vehicle Service");
  }
};

export const deleteVehicleService = async (vehicle_id) => {
  try {
    const deleteVehicle = await deleteVehicleFromDB(vehicle_id);
    return deleteVehicle
    
  } catch (err) {
    return errorHandler("Vehicle not deleted. Server Error", `${err}`, 500, "Vehicle Service");
  }
};

