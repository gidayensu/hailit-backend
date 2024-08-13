import { v4 as uuid } from "uuid";

//constants
import { DEFAULT_LIMIT } from "../constants/sharedConstants";
import {
  ALLOWED_VEHICLE_PROPERTIES
} from "../constants/vehicleConstants";

//DB functions
import {
  addVehicleToDB,
  deleteVehicleFromDB,
  getAllVehiclesFromDB,
  getOneVehicleFromDB,
  getVehiclesCount,
  updateVehicleOnDB,
} from "../model/vehicle.model";

//helpers
import { allowedPropertiesOnly } from "../utils/util";
import { ErrorResponse, handleError } from "../utils/handleError";
import { getAllEntitiesService } from "./helpers.service";

//types
import { GetAll } from "../types/getAll.types";
import { Vehicle } from "../types/vehicle.types";
import { EntityName } from "../types/shared.types";

export const getAllVehiclesService = async (
 { page,
  limit = DEFAULT_LIMIT,
  sortColumn,
  sortDirection,
  search}:GetAll
) => {
  try {
    
    const allVehicles = await getAllEntitiesService(
      {page,
      limit,
      sortColumn,
      sortDirection,
      search,
      getAllEntitiesFromDB: getAllVehiclesFromDB,
      getCount: getVehiclesCount,
      entityName: EntityName.Vehicles}
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

export const getOneVehicleService = async (vehicle_id:string) => {
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

export const addVehicleService = async (vehicleDetails: Vehicle) => {
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

export const updateVehicleService = async ({
  vehicle_id,
  vehicleUpdateDetails,
}: {
  vehicle_id: string;
  vehicleUpdateDetails: Vehicle;
}) => {
  try {
    const updateVehicle = await updateVehicleOnDB({
      vehicle_id: vehicle_id,
      vehicleUpdateDetails,
    });

    return updateVehicle;
  } catch (err) {
    return handleError({
      error: "Server Error. Vehicle not updated",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Vehicle Service",
    });
  }
};

export const deleteVehicleService = async (vehicle_id:string) => {
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
