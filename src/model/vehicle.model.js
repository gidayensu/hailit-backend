import {  PLATE_NUMBER_COLUMN, VEHICLE_ID_COLUMN, VEHICLE_TABLE_NAME } from "../constants/vehicleConstants.js";
import { addOne } from "./DB/addDbFunctions.js";
import { deleteOne } from "./DB/deleteDbFunctions.js";
import { getAll, getCountOnOneCondition, getOne,  } from "./DB/getDbFunctions.js";
import { updateOne } from "./DB/updateDbFunctions.js";
import { errorHandler } from "../utils/errorHandler.js";



export const getAllVehiclesFromDB = async (limit, offset, condition, conditionColumn) => {

  try {
    
    const allVehicles = await getAll(VEHICLE_TABLE_NAME, limit, offset, condition, conditionColumn);
    
    return allVehicles;
  } catch (err) {
    return errorHandler(`Error occurred getting all vehicles`, `${err}`, 500, "Vehicle Model");
  }
};

export const getVehiclesCount = async(countCondition, countConditionColumn)=> {
  try {
    const vehiclesCount = await getCountOnOneCondition(VEHICLE_TABLE_NAME, countCondition, countConditionColumn );
    
    
    return vehiclesCount;
    
  } catch(err) {
    return errorHandler("Error occurred getting vehicles count", `${err}`, 500, "Vehicle Model: Vehicles Count")
  }
}

export const getOneVehicleFromDB = async (vehicle_id) => {
  try {
    
    const getVehicle = await getOne(VEHICLE_TABLE_NAME, VEHICLE_ID_COLUMN, vehicle_id);
    if (getVehicle.error) {
      
      return getVehicle
    }

    return getVehicle[0];
  } catch (err) {
    return errorHandler(`Error occurred`, `${err}`, 500, "Vehicle Model");
  }
};

export const addVehicleToDB = async (completeVehicleDetails) => {
  const COLUMNS_FOR_ADDING = Object.keys(completeVehicleDetails);
  const vehicleDetailsArray = Object.values(completeVehicleDetails);
  
  const { plate_number } = completeVehicleDetails;
  try {
    const vehicleExists = await dbFunctions.detailExists(
      VEHICLE_TABLE_NAME,
      PLATE_NUMBER_COLUMN,
      plate_number
    );

    if (vehicleExists) {
      return errorHandler(
        "Vehicle exists. It has already been added",
        null,
        400,
        "Vehicle Model"
      );
    }
    const addVehicleResult = await addOne(
      VEHICLE_TABLE_NAME,
      COLUMNS_FOR_ADDING,
      vehicleDetailsArray
    );

    if (addVehicleResult.error) {
      return addVehicleResult //error details returned
    }

    return addVehicleResult[0];
  } catch (err) {
    return errorHandler(`Error occurred`, `${err}`, 500, "Vehicle Model");
  }
};

export const updateVehicleOnDB = async (vehicle_id, vehicleUpdateDetails) => {
  const validColumnsForUpdate = Object.keys(vehicleUpdateDetails);
  const vehicleDetails = Object.values(vehicleUpdateDetails);
  

  try {
    const vehicleUpdate = await updateOne(
      VEHICLE_TABLE_NAME,
      validColumnsForUpdate,
      vehicle_id,
      VEHICLE_ID_COLUMN,
      ...vehicleDetails
    );
    if (vehicleUpdate.error) {
      return vehicleUpdate //Error details returned
    }

    return vehicleUpdate.rows[0];
  } catch (err) {
    return errorHandler(`Error occurred`, `${err}`, 500, "Vehicle Model");
  }
};

export const deleteVehicleFromDB = async (vehicle_id) => {
  try {
    const vehicleDeletion = await deleteOne(
      VEHICLE_TABLE_NAME,
      VEHICLE_ID_COLUMN,
      vehicle_id
    );
    return vehicleDeletion;
  } catch (err) {
    return errorHandler(`Error occurred`, `${err}`, 500, "Vehicle Model");
  }
};
