import {
  ALLOWED_UPDATE_RIDER_PROPERTIES,
  RIDER_DETAILS,
} from "../constants/riderConstants.js";
import { DEFAULT_LIMIT } from "../constants/sharedConstants.js";
import {
  addRiderToDB,
  deleteRiderFromDB,
  getAllRiders,
  getOneRiderFromDB,
  getRidersCount,
  updateRiderOnDB,
} from "../model/rider.model.js";
import { getSpecificUserDetailsUsingId } from "../model/user.model.js";
import { getOneVehicleFromDB } from "../model/vehicle.model.js";
import { errorHandler } from "../utils/errorHandler.js";
import { allowedPropertiesOnly, userIsUserRole } from "../utils/util.js";
import { getAllEntitiesService } from "./helpers.service.js";

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
      limit = DEFAULT_LIMIT,
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
      "Error occurred getting all riders",
      `${err}`,
      500,
      "Rider Service: Get All Riders"
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
      "Error occurred getting rider",
      `${err}`,
      500,
      "Rider Service"
    );
  }
};

export const addRiderService = async (user_id, vehicle_id) => {
  try {
    const riderAdd = await addRiderToDB(user_id, vehicle_id);
    return riderAdd;
  } catch (err) {
    return errorHandler(
      "Server error occurred",
      `${err}`,
      500,
      "Rider Service"
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
      "Error occurred updating rider details",
      `${err}`,
      500,
      "Rider Service"
    );
  }
};

export const deleteRiderService = async (rider_id) => {
  try {
    const riderDelete = await deleteRiderFromDB(rider_id); //returns true/false or error

    return riderDelete;
  } catch (err) {
    return errorHandler(
      "Error occurred deleting rider",
      `${err}`,
      500,
      "Rider Service"
    );
  }
};
