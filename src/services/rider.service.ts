//constants
import {
  ALLOWED_UPDATE_RIDER_PROPERTIES,
  RIDER_DETAILS,
} from "../constants/riderConstants";
import { DEFAULT_LIMIT } from "../constants/sharedConstants";

//model functions
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

//types
import { GetAll } from "../types/getAll.types";
import { DispatcherDetails } from "../types/shared.types";

//helpers
import { handleError } from "../utils/handleError";
import { allowedPropertiesOnly, userIsUserRole } from "../utils/util";
import { getAllEntitiesService } from "./helpers.service";

export const getAllRidersService = async (
  {page,
  limit = DEFAULT_LIMIT,
  sortColumn,
  sortDirection,
  search} : GetAll
) => {
  try {
    const riders = await getAllEntitiesService(
      {page,
      limit,
      sortColumn,
      sortDirection,
      search,
      getAllEntitiesFromDB: getAllRiders,
      getCount: getRidersCount,
      entityName: "riders"}
    );
    return riders;
  } catch (err) {
    return handleError(
      {
        error: "Error occurred getting all riders",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Rider Service: Get All Riders"
      }
      
    );
  }
};

export const getOneRiderService = async ({riderId, requesterUserId}: {riderId:string, requesterUserId?:string}) => {
  try {
    const rider = await getOneRiderFromDB(riderId);
    if (rider.error) {
      return { error: rider.error };
    }
    let riderDetails = { ...rider };
    const { user_id } = rider;
    //fetching rider name and related details
    const isAdmin = requesterUserId && await userIsUserRole({userId: requesterUserId, userRole:"Admin"});

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
    return handleError(
      {
        error: "Error occurred getting rider",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Rider Service"
      }
      
    );
  }
};

export const addRiderService = async (userId:string) => {
  try {
    const riderAdd = await addRiderToDB(userId);
    return riderAdd;
  } catch (err) {
    return handleError(
      {
        error: "Server error occurred",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Rider Service"
      }
      
    );
  }
};

export const updateRiderService = async (riderDetails: RiderDetails) => {
  try {
    const validRiderDetails:RiderDetails = allowedPropertiesOnly({
      data: riderDetails,
      allowedProperties: ALLOWED_UPDATE_RIDER_PROPERTIES,
    });

    const riderUpdate = await updateRiderOnDB(validRiderDetails);

    return riderUpdate;
  } catch (err) {
    return handleError(
      {
        error: "Error occurred updating rider details",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Rider Service"
      }
      
    );
  }
};

export const deleteRiderService = async (rider_id:string) => {
  try {
    const riderDelete = await deleteRiderFromDB(rider_id); //returns true/false or error
    
    return riderDelete;
  } catch (err) {
    return handleError(
      {
        error: "Error occurred deleting rider",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Rider Service"
      }
      
    );
  }
};

export interface RiderDetails extends DispatcherDetails {
  rider_id?: string,
}