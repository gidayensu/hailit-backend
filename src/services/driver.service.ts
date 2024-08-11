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
import { allowedPropertiesOnly, userIsUserRole } from "../utils/util";
import { getAllEntitiesService } from "./helpers.service";

//types
import { GetAll } from "../types/getAll.types";
import { DispatcherDetails } from "../types/shared.types";

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
      entityName:"drivers"}
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

export const getOneDriverService = async ({driverId, requesterUserId}:{driverId:string, requesterUserId:string}) => {
  try {
    const driver = await getOneDriverFromDB(driverId);
    if (driver.error) {
      return { error: driver.error };
    }

    let driverDetails = { ...driver };
    const { user_id } = driver;

    //fetching driver name and related details
    const isAdmin = await userIsUserRole({userId: requesterUserId, userRole: "Admin"});

    isAdmin ? GET_DRIVER_COLUMNS.push("email") : "";
    const driverNamePhone = await getSpecificUserDetailsUsingId(
      user_id,
      GET_DRIVER_COLUMNS
    );
    if (driverNamePhone.error) {
      return { error: driverNamePhone.error };
    }
    driverDetails = { ...driver, ...driverNamePhone[0] };

    const vehicle_id = driver.vehicle_id;

    const vehicleDetails = await getOneVehicleFromDB(vehicle_id);
    if (vehicleDetails.error) {
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
  if (driverAdd.error) {
    return driverAdd.error; 
  }
  return driverAdd;
};



export const updateDriverService = async (driverDetails:DriverDetails) => {
  try {
    const validDriverDetails = allowedPropertiesOnly(
      {data:driverDetails,
      allowedProperties:ALLOWED_DRIVER_UPDATE_PROPERTIES}
    );
    const driverUpdate = await updateDriverOnDB(validDriverDetails);
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

export interface DriverDetails extends DispatcherDetails {
  driver_id?: string,
}