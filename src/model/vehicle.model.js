import { v4 as uuid } from "uuid";
import { addOne, checkOneDetail, deleteOne, detailExists, getAll, getOne, getSpecificDetails, getSpecificDetailsUsingId, increaseByValue, updateOne} from "./dBFunctions.js"

const tableName = "vehicle";
const columnsForUpdate = [
  "vehicle_name",
  "vehicle_model",
  "plate_number",
  "vehicle_type",
];
const columnsForAdding = ["vehicle_id", ...columnsForUpdate];
const vehicleIdColumn = 'vehicle_id';

export const getAllVehiclesFromDB = async () => {
  try {
    const allVehicles = await getAll(tableName);
    if(allVehicles.error) {
      return {error: "Error occurred fetching vehicle"}
    }
    return allVehicles;
  } catch (err) {
    return { error: `Error occurred, ${err} ` };
  }
};

export const getOneVehicleFromDB = async (vehicle_id) => {
  try {
    

    const getVehicle = await getOne(
      tableName,
      vehicleIdColumn,
      vehicle_id
    );
    console.log('vehicle_id:', vehicle_id)
    if (getVehicle.error) {
      console.log('getVehicle.error:', getVehicle.error)
      return {error:"Vehicle does not exist"};
    }

    return getVehicle[0];
  } catch (err) {
    return { error: `Error occurred, ${err} ` };
  }
};

export const addVehicleToDB = async (completeVehicleDetails) => {
  
  const columnsForAdding = Object.keys(completeVehicleDetails);
  const vehicleDetailsArray = Object.values(completeVehicleDetails);
  const plate_number_column = 'plate_number';
  const {plate_number} = completeVehicleDetails;
  try {
    const vehicleExists = await dbFunctions.detailExists(
      tableName,
      plate_number_column,
      plate_number
    );

    if (vehicleExists) {
      return { error: "Vehicle exists. It has already been added" };
    }
    const addVehicleResult = await addOne(
      tableName,
      columnsForAdding,
      vehicleDetailsArray
    );

    if (addVehicleResult.error) {
      return {error: `Error occurred adding vehicle: ${addVehicleResult.error}`}
    }

    return addVehicleResult[0];
    
  } catch (err) {
    return { error: `Error occurred: ${err}` };
  }
};

export const updateVehicleOnDB = async (vehicle_id, vehicleUpdateDetails) => {
  const validColumnsForUpdate = Object.keys(vehicleUpdateDetails);
  const vehicleDetails = Object.values(vehicleUpdateDetails);
  const vehicleIdColumn = columnsForAdding[0];
  

  try {
    const vehicleUpdate = await updateOne(
      tableName,
      validColumnsForUpdate,
      vehicle_id,
      vehicleIdColumn,
      ...vehicleDetails
    );
    if(vehicleUpdate.error) {
      return {error: "Vehicle not updated"}
    }

    return vehicleUpdate.rows[0];
    
  } catch (err) {
    return { error: `Error occurred, ${err} ` };
  }
};

export const deleteVehicleFromDB = async (vehicle_id) => {
  try {
    const vehicleDeletion = await deleteOne(
      tableName,
      vehicleIdColumn,
      vehicle_id
    ); 

    if (vehicleDeletion.error) {
      return {error: "Error occurred in deleting vehicle"}
    }
    return vehicleDeletion;
  } catch (err) {
    return { error: `Error occurred, ${err} ` };
  }
};


