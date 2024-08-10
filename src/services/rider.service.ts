import {
  ALLOWED_UPDATE_RIDER_PROPERTIES,
  RIDER_DETAILS,
} from "../constants/riderConstants";
import { DEFAULT_LIMIT } from "../constants/sharedConstants";
import {
  addRiderToDB,
  deleteRiderFromDB,
  getAllRiders,
  getOneRiderFromDB,
  getRidersCount,
  updateRiderOnDB,
} from "../model/rider.model";
import { getSpecificUserDetailsUsingId } from "../model/user.model";
import { getOneVehicleFromDB } from "../model/vehicle.model";
import { errorHandler } from "../utils/errorHandler";
import { allowedPropertiesOnly, userIsUserRole } from "../utils/util";
import { getAllEntitiesService } from "./helpers.service";

export const getAllRidersService = async (
  page,
  limit = DEFAULT_LIMIT,
  sortColumn,
  sortDirection,
  search
) => {
  try {
    const riders = await getAllEntitiesService(
      page,
      limit,
      sortColumn,
      sortDirection,
      search,
      getAllRiders,
      getRidersCount,
      "riders"
    );
    return riders;
  } catch (err) {
    return errorHandler(
      {
        error: "Error occurred getting all riders",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Rider Service: Get All Riders"
      }
      
    );
  }
};

export const getOneRiderService = async (rider_id, requester_user_id) => {
  try {
    const rider = await getOneRiderFromDB(rider_id);
    if (rider.error) {
      return { error: rider.error };
    }
    let riderDetails = { ...rider };
    const { user_id } = rider;
    //fetching rider name and related details
    const isAdmin = await userIsUserRole(requester_user_id, "Admin");

    isAdmin ? RIDER_DETAILS.push("email") : "";
    const riderOtherDetails = await getSpecificUserDetailsUsingId(
      user_id,
      RIDER_DETAILS
    );
    if (riderOtherDetails.error) {
      return { error: riderOtherDetails.error };
    }
    riderDetails = { ...rider, ...riderOtherDetails[0] };

    const { vehicle_id } = rider;
    const vehicleDetails = await getOneVehicleFromDB(vehicle_id);
    if (vehicleDetails.error) {
      return { ...rider, vehicle: "No vehicle assigned" };
    }
    return { ...riderDetails, vehicle: vehicleDetails };
  } catch (err) {
    return errorHandler(
      {
        error: "Error occurred getting rider",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Rider Service"
      }
      
    );
  }
};

export const addRiderService = async (user_id, vehicle_id) => {
  try {
    const riderAdd = await addRiderToDB(user_id, vehicle_id);
    return riderAdd;
  } catch (err) {
    return errorHandler(
      {
        error: "Server error occurred",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Rider Service"
      }
      
    );
  }
};

export const updateRiderService = async (riderDetails) => {
  try {
    const validRiderDetails = allowedPropertiesOnly(
      riderDetails,
      ALLOWED_UPDATE_RIDER_PROPERTIES
    );

    const riderUpdate = await updateRiderOnDB(validRiderDetails);

    return riderUpdate;
  } catch (err) {
    return errorHandler(
      {
        error: "Error occurred updating rider details",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Rider Service"
      }
      
    );
  }
};

export const deleteRiderService = async (rider_id) => {
  try {
    const riderDelete = await deleteRiderFromDB(rider_id); //returns true/false or error
      
    return riderDelete;
  } catch (err) {
    return errorHandler(
      {
        error: "Error occurred deleting rider",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Rider Service"
      }
      
    );
  }
};
