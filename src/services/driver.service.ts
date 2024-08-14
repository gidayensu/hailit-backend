import {
  ALLOWED_DRIVER_UPDATE_PROPERTIES,
  GET_DRIVER_COLUMNS,
} from "../constants/driverConstants";
import { DEFAULT_LIMIT } from "../constants/sharedConstants";
import {
  addDriverToDB,
  deleteDriverFromDB,
  getAllDriversFromDB,
  getDriversCount,
  getOneDriverFromDB,
  updateDriverOnDB,
} from "../model/driver.model";
import { getSpecificUserDetailsUsingId } from "../model/user.model";
import { getOneVehicleFromDB } from "../model/vehicle.model";
import { handleError } from "../utils/handleError";
import { allowedPropertiesOnly, isErrorResponse, userIsUserRole } from "../utils/util";
import { getAllEntitiesService } from "./helpers.service";

//types
import { GetAll } from "../types/getAll.types";
import { EntityName } from "../types/shared.types";
import { DispatcherDetails } from "../types/dispatcher.types";

export const getAllDriversService = async ({
  page,
  limit = DEFAULT_LIMIT,
  sortColumn,
  sortDirection,
  search} : GetAll
) => {
  
  try {
    const drivers = await getAllEntitiesService(
      {page,
      limit ,
      sortColumn,
      sortDirection,
      search,
      getAllEntitiesFromDB: getAllDriversFromDB,
      getCount:getDriversCount,
      entityName:EntityName.Drivers}
    );
  
    return drivers;
  } catch (err) {
    
    return handleError(
      {
        error: "Server error occurred getting drivers",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Get All Drivers Service"
      }
      
    );
  }
};

export const getOneDriverService = async ({driverId, requesterUserId}:{driverId:string, requesterUserId?:string}) => {
  try {
    const driver = await getOneDriverFromDB(driverId);
    if (isErrorResponse( driver)) {
      return driver;
    }
    const { user_id } = driver;

    let driverDetails = { ...driver };

    //fetching driver name and related details
    const isAdmin = requesterUserId && await userIsUserRole({userId: requesterUserId, userRole: "Admin"});

    isAdmin ? GET_DRIVER_COLUMNS.push("email") : "";
    const driverNamePhone = await getSpecificUserDetailsUsingId(
      {userId: user_id,
      columns: GET_DRIVER_COLUMNS}
    );
    if (isErrorResponse(driverNamePhone)) {
      return driverNamePhone;
    }
    driverDetails = { ...driver, ...driverNamePhone[0] };

    const vehicle_id = driver.vehicle_id;

    const vehicleDetails = await getOneVehicleFromDB(vehicle_id);
    if (isErrorResponse(vehicleDetails)) {
      return { ...driver, vehicle: "No vehicle assigned" };
    }
    return { ...driverDetails, vehicle: vehicleDetails };
  } catch (err) {
    return handleError(
      {
        error: "Error occurred getting one driver",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Service"
      }
      
    );
  }
};

export const addDriverService = async ({userId, vehicleId}: {userId:string, vehicleId:string}) => {
  const driverAdd = await addDriverToDB({userId, vehicleId});
  return driverAdd;
};



export const updateDriverService = async (driverDetails:DispatcherDetails) => {
  try {
    const validDispatcherDetails = allowedPropertiesOnly(
      {data:driverDetails,
      allowedProperties:ALLOWED_DRIVER_UPDATE_PROPERTIES}
    );
    const driverUpdate = await updateDriverOnDB(validDispatcherDetails);
    if (driverUpdate.error) {
      return { error: driverUpdate.error };
    }
    return driverUpdate;
  } catch (err) {
    return handleError(
      {
        error: "Error occurred updating driver details",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Service"
      }
      
    );
  }
};

export const deleteDriverService = async (driver_id:string) => {
  try {
    const driverDelete = await deleteDriverFromDB(driver_id);
    
    return driverDelete;
  } catch (err) {
    return handleError(
      {
        error: "Server Error occurred deleting driver",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Driver Service"
      }
      
    );
  }
};

