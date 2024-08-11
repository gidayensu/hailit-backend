import { PLATE_NUMBER_COLUMN, VEHICLE_ID_COLUMN, VEHICLE_TABLE_NAME } from "../constants/vehicleConstants";
import { GetAllFromDB } from "../types/getAll.types";
import { errorHandler } from "../utils/errorHandler";
import { addOne } from "./DB/addDbFunctions";
import { deleteOne } from "./DB/deleteDbFunctions";
import { getAllVehicles, getOne, vehiclesCount } from "./DB/getDbFunctions";
import { detailExists } from "./DB/helperDbFunctions";
import { updateOne } from "./DB/updateDbFunctions";


export const getAllVehiclesFromDB = async (
  {limit,
  offset,
  sortColumn,
  sortDirection,
  search}:GetAllFromDB
) => {
  try {
    const allVehicles = await getAllVehicles(
      {limit,
      offset,
      sortColumn,
      sortDirection,
      search}
    );

    return allVehicles;
  } catch (err) {
    return errorHandler(
      {
        error: "Error occurred getting all vehicles",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Vehicle Model"
      }
      
    );
  }
};

export const getVehiclesCount = async(search:string)=> {
  try {
    const count = await vehiclesCount(search);
    
    
    return count;
    
  } catch(err) {
    return errorHandler({
      error: "Error occurred getting vehicles count",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Vehicle Model: Vehicles Count"
    }
    )
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
    return errorHandler({
      error: "Error occurred",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Vehicle Model"
    }
    );
  }
};

export const addVehicleToDB = async (completeVehicleDetails) => {
  const COLUMNS_FOR_ADDING = Object.keys(completeVehicleDetails);
  const vehicleDetailsArray = Object.values(completeVehicleDetails);
  
  const { plate_number } = completeVehicleDetails;
  try {
    const vehicleExists = await detailExists(
      VEHICLE_TABLE_NAME,
      PLATE_NUMBER_COLUMN,
      plate_number
    );

    if (vehicleExists) {
      return errorHandler(
        {
          error: "Vehicle exists. It has already been added",
          errorMessage: null,
          errorCode: 400,
          errorSource: "Vehicle Model"
        }
        
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
    return errorHandler({
      error: "Error occurred",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Vehicle Model"
    }
    );
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
    return errorHandler({
      error: "Error occurred",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Vehicle Model"
    }
    );
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
    return errorHandler({
      error: "Error occurred",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Vehicle Model"
    }
    );
  }
};
