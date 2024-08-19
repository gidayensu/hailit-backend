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
import { User, UserRole } from "../types/user.types";
import { handleError } from "../utils/handleError";
import { isErrorResponse } from "../utils/util";

export const riderOrDispatcherDetails = async ({user_role, userId}: {user_role: UserRole, userId:string}) => {
  if (user_role === "Driver") {
    const driverDetails = await getDriverDetailOnCondition({
      columnName: USER_ID_COLUMN,
      condition: userId,
    });

    //if user is driver  but no details in database add driver to driver table
    if (isErrorResponse(driverDetails)) {
      const addDriver = await addDriverToDB({ userId });

      return { driver: addDriver };
    }

    return { driver: driverDetails };
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

export const addRiderIfApplicable = async ({userId, addedUser}: {userId:string, addedUser:User}) => {
  try {
    const addRider = await addRiderToDB(userId);
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

export const addDriverIfApplicable = async ({userId, addedUser}: {userId:string, addedUser:User}) => {
  try {
    const addDriver = await addDriverToDB({ userId });
    if (isErrorResponse(addDriver)) {
      return addDriver;
    } 
      
    return { ...addedUser, driver: addDriver };
  } catch (err) {
    return handleError({
      error: "Error. User not updated",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "User Service",
    });
  }
};

export const updateRiderRole = async ({userId, updatedDetails}: {userId:string, updatedDetails:User}) => {
  try {
    const isDriver = await getDriverDetailOnCondition({
      columnName: USER_ID_COLUMN,
      condition: userId,
    });
    if (!isErrorResponse(isDriver)) {
      await deleteDriverFromDB(isDriver.driver_id);
    }

    const riderExists = await getRiderOnConditionFromDB({
      columnName: USER_ID_COLUMN,
      condition: userId,
    });
    if (!isErrorResponse(riderExists)) {
      return { ...updatedDetails, rider: riderExists };
    }

    const addRider = await addRiderToDB(userId);
    return { ...updatedDetails, rider: addRider };
  } catch (err) {
    return handleError({
      error: "Error updating rider role",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "User Service: Update Rider Role",
    });
  }
};

export const updateDriverRole = async ({userId, updatedDetails}: {userId:string, updatedDetails: User}) => {
  try {
    const isRider = await getRiderOnConditionFromDB({columnName: USER_ID_COLUMN, condition: userId});
    if (!isErrorResponse(isRider)) {
      await deleteRiderFromDB(isRider.rider_id);
    } 

    const driverExists = await getDriverDetailOnCondition(
      {columnName: USER_ID_COLUMN,
      condition: userId}
    );
    if (!isErrorResponse(driverExists)) {

      return { ...updatedDetails, driver: driverExists };
    }
    const addDriver = await addDriverToDB({ userId });
    if(isErrorResponse(addDriver)) {
      return {...updatedDetails, driver: ''}
    }
    
    return { ...updatedDetails, driver: addDriver };
  } catch (err) {
    return handleError({
      error: "Error updating driver role",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "User Service: Update Rider Role",
    });
  }
};
