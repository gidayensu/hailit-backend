import {
  addDriverToDB,
  deleteDriverFromDB,
  getDriverDetailOnCondition,
} from "../model/driver.model.js";
import {
  addRiderToDB,
  deleteRiderFromDB,
  getRiderOnConditionFromDB,
} from "../model/rider.model.js";
import { USER_ID_COLUMN } from "../constants/usersConstants.js";
import { errorHandler } from "../utils/errorHandler.js";

export const riderOrDriverDetails = async (user_role, userId) => {
  if (user_role === "Driver") {
    const driverDetails = await getDriverDetailOnCondition(USER_ID_COLUMN, userId);
    
    //if user is driver  but no details in database add driver to driver table
    if (driverDetails.error) {
      const addDriver = await addDriverToDB(userId);

      return { driver: addDriver };
    }

    return { driver: driverDetails[0] };
  }

  if (user_role === "Rider") {
    const riderDetails = await getRiderOnConditionFromDB(USER_ID_COLUMN, userId);

    //if user is rider but no details in database add rider to rider table
    if (riderDetails.length < 1) {
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
    if (addRider.error) return addRider;
    return { ...addedUser, rider: addRider[0] };
  } catch (err) {
    return errorHandler("Error adding rider", `${err}`, 500, "User Service");
  }
};

export const addDriverIfApplicable = async (user_id, addedUser) => {
  try {
    const addDriver = await addDriverToDB(user_id);
    if (addDriver.error) return addDriver;
    return { ...addedUser, driver: addDriver[0] };
  } catch (err) {
    return errorHandler(
      "Error. User not updated",
      `${err}`,
      500,
      "User Service"
    );
  }
};

export const updateRiderRole = async (userId, updatedDetails) => {
  try {
    const isDriver = await getDriverDetailOnCondition(USER_ID_COLUMN, userId);
    if (!isDriver.error && isDriver.length > 0)
      await deleteDriverFromDB(isDriver[0].driver_id);

    const riderExists = await getRiderOnConditionFromDB(USER_ID_COLUMN, userId);
    if (riderExists.length > 0)
      return { ...updatedDetails, rider: riderExists[0] };

    const addRider = await addRiderToDB(userId);
    return { ...updatedDetails, rider: addRider[0] };
  } catch (err) {
    return errorHandler(
      "Error updating rider role",
      `${err}`,
      500,
      "User Service: Update Rider Role"
    );
  }
};

export const updateDriverRole = async (userId, updatedDetails) => {
  try {
    const isRider = await getRiderOnConditionFromDB(USER_ID_COLUMN, userId);
    if (isRider.length > 0) await deleteRiderFromDB(isRider[0].rider_id);

    const driverExists = await getDriverDetailOnCondition(USER_ID_COLUMN, userId);
    if (!driverExists.error && driverExists.length > 0)
      return { ...updatedDetails, driver: driverExists[0] };

    const addDriver = await addDriverToDB(userId);
    return { ...updatedDetails, driver: addDriver[0] };
  } catch (err) {
    return errorHandler(
      "Error updating driver role",
      `${err}`,
      500,
      "User Service"
    );
  }
};
