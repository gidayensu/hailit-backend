import {addDriverToDB, deleteDriverFromDB, getAllDriversFromDB, getOneDriverFromDB, updateDriverOnDB} from "../model/driver.model.js";
import { getOneVehicleFromDB } from "../model/vehicle.model.js";
import {getSpecificUserDetailsUsingId} from "../model/user.model.js";

import { allowedPropertiesOnly } from "../utils/util.js";


export const getAllDriversService = async () => {
  try {
    const drivers = await getAllDriversFromDB();
    if(drivers.error) {
      
      return {error: drivers.error}
    }
    return drivers;
  } catch (err) {
    return {error: "server error occurred getting drivers"}
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
    return { error: `Error occurred getting driver: ${err}` };
  }
};

export const addDriverService = async (user_id, vehicle_id) => {
  const driverAdd = await addDriverToDB(user_id, vehicle_id);
  if (driverAdd) {
    return driverAdd;
  } else {
    return { error: "driver not added" };
  }
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
      return { error: "driver details not updated" };
    } 
    return driverUpdate;
  } catch (err) {
    return { error: `Error occurred updating driver details: ${err}` };
  }
};

export const deleteDriverService = async (driver_id) => {
  const driverDelete = await deleteDriverFromDB(driver_id);
  if (driverDelete) {
    return driverDelete;
  } else {
    return { error: "driver not deleted" };
  }
};
