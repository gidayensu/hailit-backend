
import { v4 as uuid } from "uuid";
import { addVehicleToDB, deleteVehicleFromDB, getAllVehiclesFromDB, getOneVehicleFromDB, updateVehicleOnDB } from '../model/vehicle.model.js';
import { allowedPropertiesOnly } from "../utils//util.js";


export const getAllVehiclesService = async () => {
  try {
    const allVehicles = await getAllVehiclesFromDB();
    
    return allVehicles;
  } catch (err) {
    return { error:  "server error" };
  }
};

export const getOneVehicleService = async (vehicle_id) => {
  const getVehicle = await getOneVehicleFromDB(vehicle_id);

  if (getVehicle.vehicle_name) {
    return {
      ...getVehicle
    };
  } else {
    return { error: "Not Found" };
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
console.log('valid vehicle:', validVehicleDetails)
  try {
    const addVehicleResult = await addVehicleToDB(
      validVehicleDetails
    );

    if (addVehicleResult.error) {
      return {error: addVehicleResult.error}
    }
    
      return addVehicleResult;
    
  } catch (err) {
    
    return { error: "Error occurred. Vehicle not added" };
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
    return { error: "Server Error" };
  }
};

export const deleteVehicleService = async (vehicle_id) => {
  try {
    const deleteVehicle = await deleteVehicleFromDB(vehicle_id);
    if (deleteVehicle) {
      return { success: "vehicle deleted" };
    } else {
      return { error: "Vehicle does not exist. No vehicle deleted" };
    }
  } catch (err) {
    return { error: "Vehicle not deleted. Server Error" };
  }
};

