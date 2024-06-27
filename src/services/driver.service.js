import { paginatedRequest } from "../utils/paginatedRequest.js";
import { errorHandler } from "../utils/errorHandler.js";
import {addDriverToDB, deleteDriverFromDB, getAllDriversFromDB, getOneDriverFromDB, updateDriverOnDB, getDriversCount} from "../model/driver.model.js";
import { getOneVehicleFromDB } from "../model/vehicle.model.js";
import {getSpecificUserDetailsUsingId} from "../model/user.model.js";

import { allowedPropertiesOnly } from "../utils/util.js";


export const getAllDriversService = async (page) => {
  try {
    const limit = 7;
    let offset = 0;

    page > 1 ? offset = limit * page : '';
    const drivers = await getAllDriversFromDB(limit, offset);
    
    if(drivers.error) {
      
      return {error: drivers.error}
    };
    const totalCount = await getDriversCount();
    
    
    return await paginatedRequest(totalCount, drivers, offset, limit, "drivers")
    
    
  } catch (err) {
    return errorHandler("server error occurred getting drivers", `${err}`, 500, "get all drivers service");
  }
};

export  const getOneDriverService = async (driver_id) => {
  try {
    const driver = await getOneDriverFromDB(driver_id);
    if (driver.error) {
      return {error: driver.error}
    
    }

    let driverDetails = {...driver}
    const {user_id} = driver;
    const columns = ["first_name", "last_name", "phone_number"]
    const driverNamePhone = await getSpecificUserDetailsUsingId(user_id, columns);
    if(driverNamePhone.error) {
      return {error: driverNamePhone.error}
    }
    driverDetails = {...driver, ...driverNamePhone[0]}
    
    const vehicle_id = driver.vehicle_id;
    
    const vehicleDetails = await getOneVehicleFromDB(vehicle_id);
    if(vehicleDetails.error) {
    
      return {...driver, vehicle: "No vehicle assigned"}
    }
      return {...driverDetails, vehicle: vehicleDetails};
  } catch (err) {
    return errorHandler("Error occurred getting one driver", `${err}`, 500, "service");
  }
};

export const addDriverService = async (user_id, vehicle_id) => {
  const driverAdd = await addDriverToDB(user_id, vehicle_id);
  if (driverAdd.error) {
    return driverAdd.error;
  }
  return driverAdd
};

export const updateDriverService = async (driverDetails) => {
  const allowedProperties = [
    "driver_id",
    "vehicle_id",
    "license_number",
    "driver_availability",
  ];
  try {
    const validDriverDetails = allowedPropertiesOnly(
      driverDetails,
      allowedProperties
    );
    const driverUpdate = await updateDriverOnDB(validDriverDetails);
    if (driverUpdate.error) {
      return { error: driverUpdate.error };
    } 
    return driverUpdate;
  } catch (err) {
    return errorHandler("Error occurred updating driver details", `${err}`, 500, "service");
  }
};

export const deleteDriverService = async (driver_id) => {
  try {

    const driverDelete = await deleteDriverFromDB(driver_id);
    if (driverDelete.error) {
      return driverDelete.error;
    } 
    return driverDelete;
  } catch (err) {
    return errorHandler('Server Error occurred deleting driver', `${err}`, 500, "Driver Service" )
  }
};


