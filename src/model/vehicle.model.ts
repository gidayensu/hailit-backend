import { PLATE_NUMBER_COLUMN, VEHICLE_ID_COLUMN, VEHICLE_TABLE_NAME } from "../constants/vehicleConstants";
import { GetAllFromDB } from "../types/getAll.types";
import { TotalCount } from "../types/shared.types";
import { Vehicle } from "../types/vehicle.types";
import { ErrorResponse, handleError } from "../utils/handleError";
import { isErrorResponse } from "../utils/util";
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
    return handleError(
      {
        error: "Error occurred getting all vehicles",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Vehicle Model"
      }
      
    );
  }
};

export const getVehiclesCount = async(search?:string)=> {
  try {
    const count = await vehiclesCount(search);
    
    
    return count;
    
  } catch(err) {
    return handleError({
      error: "Error occurred getting vehicles count",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Vehicle Model: Vehicles Count"
    }
    )
  }
}

export const getOneVehicleFromDB = async (vehicle_id: string) => {
  try {
    
    const getVehicle: ErrorResponse | Vehicle[] = await getOne({
      tableName: VEHICLE_TABLE_NAME,
      columnName: VEHICLE_ID_COLUMN,
      condition: vehicle_id,
    });
    if (isErrorResponse(getVehicle)) {
      
      return getVehicle
    }
    const vehicle: Vehicle = getVehicle[0]
    return vehicle;
  } catch (err) {
    return handleError({
      error: "Error occurred",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Vehicle Model"
    }
    );
  }
};

export const addVehicleToDB = async (completeVehicleDetails: Vehicle) => {
  const COLUMNS_FOR_ADDING: string[] = Object.keys(completeVehicleDetails);
  const vehicleDetailsArray: string[] = Object.values(completeVehicleDetails);
  
  const { plate_number } = completeVehicleDetails;
  try {
    const vehicleExists = await detailExists(
      {tableName: VEHICLE_TABLE_NAME,
      columnName: PLATE_NUMBER_COLUMN,
      detail: plate_number}
    );

    if (vehicleExists) {
      return handleError(
        {
          error: "Vehicle exists. It has already been added",
          errorMessage: "",
          errorCode: 400,
          errorSource: "Vehicle Model"
        }
        
      );
    }
    const addVehicleResult = await addOne({
      tableName: VEHICLE_TABLE_NAME,
      columns: COLUMNS_FOR_ADDING,
      values: vehicleDetailsArray,
    });

    if (isErrorResponse(addVehicleResult)) {
      return addVehicleResult //error details returned
    }
    const vehicle = addVehicleResult[0] 
    return vehicle;
  } catch (err) {
    return handleError({
      error: "Error occurred",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Vehicle Model"
    }
    );
  }
};

export const updateVehicleOnDB = async ({
  vehicle_id,
  vehicleUpdateDetails,
}: {
  vehicle_id: string;
  vehicleUpdateDetails: Vehicle;
}) => {
  const validColumnsForUpdate: string[] = Object.keys(vehicleUpdateDetails);
  const vehicleDetails: string[] = Object.values(vehicleUpdateDetails);

  try {
    const vehicleUpdate = await updateOne({
      tableName: VEHICLE_TABLE_NAME,
      columns: validColumnsForUpdate,
      id: vehicle_id,
      idColumn: VEHICLE_ID_COLUMN,
      details: vehicleDetails,
    });
    if (isErrorResponse(vehicleUpdate)) {
      return vehicleUpdate; //Error details returned
    }
    const vehicle: Vehicle = vehicleUpdate.rows[0] 
    return vehicle;
  } catch (err) {
    return handleError({
      error: "Error occurred",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Vehicle Model",
    });
  }
};

export const deleteVehicleFromDB = async (vehicle_id:string) => {
  try {
    const vehicleDeletion = await deleteOne(
      {tableName: VEHICLE_TABLE_NAME,
      columnName: VEHICLE_ID_COLUMN,
      id: vehicle_id}
    );
    return vehicleDeletion;
  } catch (err) {
    return handleError({
      error: "Error occurred",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Vehicle Model"
    }
    );
  }
};
