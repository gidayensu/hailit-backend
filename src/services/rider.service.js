import {addRiderToDB, deleteRiderFromDB, getAllRiders, getOneRiderFromDB, updateRiderOnDB} from "../model/rider.model.js";
import { getOneVehicleFromDB } from "../model/vehicle.model.js";
import { getSpecificUserDetailsUsingId } from "../model/user.model.js";

import { allowedPropertiesOnly } from "../utils/util.js";



export const getAllRidersService = async () => {
  try {
    const riders = await getAllRiders();
    return riders;
  } catch (err) {
    return {error: "Error occurred getting all riders"}
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
    return { error: `Error occurred getting rider: ${err}` };
  }
};

export const addRiderService = async (user_id, vehicle_id) => {
  const riderAdd = await addRiderToDB(user_id, vehicle_id);
  if (riderAdd) {
    return riderAdd;
  } else {
    return { error: "rider not added" };
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
    
    if (riderUpdate) {
      return riderUpdate;
    } else {
      
      return { error: "rider details not updated" };
    }
  } catch (err) {
    return { error: `Error occurred updating rider details: ${err}` };
  }
};

export const deleteRiderService = async (rider_id) => {
  try {
    const riderDelete = await deleteRiderFromDB(rider_id);
    if (riderDelete) {
      return riderDelete;
    } else {
      return { error: "rider not deleted" };
    }
  } catch (err) {
    return { error: "Error occurred deleting rider" };
  }
};

