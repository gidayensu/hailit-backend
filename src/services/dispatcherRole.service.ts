import { USER_ID_COLUMN } from "../constants/usersConstants";
import {
  addDriverToDB,
  deleteDriverFromDB,
  getDriverDetailOnCondition,
} from "../model/driver.model";
import {
  addRiderToDB,
  deleteRiderFromDB,
  getRiderOnConditionFromDB,
} from "../model/rider.model";
import { DispatcherDetails } from "../types/dispatcher.types";
import { handleError } from "../utils/handleError";
import { isErrorResponse } from "../utils/util";

export const riderOrDispatcherDetails = async (user_role, userId) => {
  if (user_role === "Driver") {
    const driverDetails = await getDriverDetailOnCondition({
      columnName: USER_ID_COLUMN,
      condition: userId,
    });

    //if user is driver  but no details in database add driver to driver table
    if (isErrorResponse(driverDetails)) {
      const addDriver = await addDriverToDB(userId);

      return { driver: addDriver };
    }

    return { driver: driverDetails[0] };
  }

  if (user_role === "Rider") {
    const riderDetails = await getRiderOnConditionFromDB(
      {columnName: USER_ID_COLUMN,
      condition: userId}
    );

    //if user is rider but no details in database add rider to rider table
    if (!isErrorResponse(riderDetails)) {
      const addRider = await addRiderToDB(userId);
      return { rider: addRider };
    }
    const returnedRiderDetails = riderDetails;
    return { rider: returnedRiderDetails };
  }
};

export const addRiderIfApplicable = async (user_id, addedUser) => {
  try {
    const addRider = await addRiderToDB(user_id);
    if (isErrorResponse(addRider)) {
      return addRider;
    }
    return { ...addedUser, rider: addRider[0] };
  } catch (err) {
    return handleError({
      error: "Error adding rider",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "User Service: Add Rider if Applicable",
    });
  }
};

export const addDriverIfApplicable = async (user_id, addedUser) => {
  try {
    const addDriver = await addDriverToDB(user_id);
    if (isErrorResponse(addDriver)) {
      return addDriver;
    } 
      
    return { ...addedUser, driver: addDriver[0] };
  } catch (err) {
    return handleError({
      error: "Error. User not updated",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "User Service",
    });
  }
};

export const updateRiderRole = async (userId, updatedDetails) => {
  try {
    const isDriver = await getDriverDetailOnCondition({
      columnName: USER_ID_COLUMN,
      condition: userId,
    });
    if (!isErrorResponse(isDriver)) {
      await deleteDriverFromDB(isDriver[0].driver_id);
    }

    const riderExists = await getRiderOnConditionFromDB({
      columnName: USER_ID_COLUMN,
      condition: userId,
    });
    if (!isErrorResponse(riderExists)) {
      return { ...updatedDetails, rider: riderExists[0] };
    }

    const addRider = await addRiderToDB(userId);
    return { ...updatedDetails, rider: addRider[0] };
  } catch (err) {
    return handleError({
      error: "Error updating rider role",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "User Service: Update Rider Role",
    });
  }
};

export const updateDriverRole = async (userId, updatedDetails) => {
  try {
    const isRider = await getRiderOnConditionFromDB({columnName: USER_ID_COLUMN, condition: userId});
    if (!isErrorResponse(isRider)) {
      await deleteRiderFromDB(isRider[0].rider_id);
    } 

    const driverExists = await getDriverDetailOnCondition(
      {columnName: USER_ID_COLUMN,
      condition: userId}
    );
    if (!isErrorResponse(driverExists)) {

      return { ...updatedDetails, driver: driverExists[0] };
    }
    const addDriver = await addDriverToDB(userId);
    if(isErrorResponse(addDriver)) {
      return {...updatedDetails, driver: ''}
    }
    const driver: DispatcherDetails =  addDriver[0]
    return { ...updatedDetails, driver: addDriver[0] };
  } catch (err) {
    return handleError({
      error: "Error updating driver role",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "User Service: Update Rider Role",
    });
  }
};
