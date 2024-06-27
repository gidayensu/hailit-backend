import { paginatedRequest } from "../utils/paginatedRequest.js";
import {addRiderToDB, deleteRiderFromDB, getAllRiders, getOneRiderFromDB, updateRiderOnDB, getRidersCount} from "../model/rider.model.js";
import { getOneVehicleFromDB } from "../model/vehicle.model.js";
import { getSpecificUserDetailsUsingId } from "../model/user.model.js";

import { allowedPropertiesOnly } from "../utils/util.js";
import { errorHandler } from "../utils/errorHandler.js";



export const getAllRidersService = async (page) => {
  try {
    const limit = 7;
    let offset = 0;

    page > 1 ? offset = limit * page : '';
    const riders = await getAllRiders(limit, offset);

    const totalCount = await getRidersCount();
    return await paginatedRequest(totalCount, riders, offset, limit, "riders")

    return riders;
  } catch (err) {
    return errorHandler("Error occurred getting all riders", `${err}`, 500, "Rider Service");
  }
};

export const getOneRiderService = async (rider_id) => {
  
  try {
    const rider = await getOneRiderFromDB(rider_id);
    if (rider.error) {
      return {error: rider.error};
    } 
    let riderDetails = {...rider}
    const {user_id} = rider;
    const columns = ["first_name", "last_name", "phone_number"]
    const riderNamePhone = await getSpecificUserDetailsUsingId(user_id, columns);
    if(riderNamePhone.error) {
      return {error: riderNamePhone.error}
    }
    riderDetails = {...rider, ...riderNamePhone[0]}

    
    const {vehicle_id} = rider;
    const vehicleDetails = await getOneVehicleFromDB(vehicle_id);
    if(vehicleDetails.error) {
      return {...rider, vehicle: "No vehicle assigned"}
    }
      return {...riderDetails, vehicle: vehicleDetails};
    
  } catch (err) {
    return errorHandler("Error occurred getting rider", `${err}`, 500, "Rider Service");
  }
};

export const addRiderService = async (user_id, vehicle_id) => {
  try {

    const riderAdd = await addRiderToDB(user_id, vehicle_id);
    return riderAdd;
  } catch (err) {
    return errorHandler("Server error occurred", `${err}`, 500, "Rider Service")
  }

};

export const updateRiderService = async (riderDetails) => {
  
  const allowedProperties = ["rider_id", "vehicle_id", "license_number", "rider_availability"];
  try {
    const validRiderDetails =  allowedPropertiesOnly(
      riderDetails,
      allowedProperties
    );
    const riderUpdate = await updateRiderOnDB(validRiderDetails);
    
    return riderUpdate;
    
  } catch (err) {
    return errorHandler("Error occurred updating rider details", `${err}`, 500, "Rider Service");
  }
};

export const deleteRiderService = async (rider_id) => {
  try {
    const riderDelete = await deleteRiderFromDB(rider_id);
    return riderDelete;
    
  } catch (err) {
    return errorHandler("Error occurred deleting rider", `${err}`, 500, "Rider Service");
  }
};

