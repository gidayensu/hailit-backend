import { errorHandler } from "../utils/errorHandler.js";
import {addUserToDB, deleteUserFromDB, getAllUsersFromDB, getOneUserFromDB, updateUserOnDB, getUserIdUsingEmail } from "../model/user.model.js";
import {addDriverToDB, deleteDriverFromDB, getDriverDetailOnCondition } from "../model/driver.model.js";
import {addRiderToDB, deleteRiderFromDB, getRiderOnConditionFromDB} from "../model/rider.model.js";
import { allowedPropertiesOnly } from "../utils/util.js";

let allowedProperties = [
  "user_id",
  "first_name",
  "last_name",
  "email",
  "phone_number",
  "user_role",
  "onboard"
];

export const getAllUsersService = async () => {
  try {
    const users = await getAllUsersFromDB();
    return users;
  } catch (err) {
    return errorHandler("Error occurred getting all users", err, 500, "User service");
  }
};

export const getOneUserService = async (userId) => {
  try {
    const user = await getOneUserFromDB(userId);
    if (user.user_role && user.user_role === "driver" || user.user_role === "rider") {
      const getRiderOrDriverDetails = await riderOrDriverDetails (user.user_role, userId); 
      return {...user, ...getRiderOrDriverDetails}
    }
    
    return user;
  } catch (err) {
    
    return errorHandler("Server error occurred in getting user", err, 500, "User Service");

  }
};

const riderOrDriverDetails = async (user_role, userId)=> {
  if (user_role === "driver") {
    const driverDetails = await getDriverDetailOnCondition(
      "user_id",
      userId
    );

    
    
  //if user is driver  but no details in database add driver to driver table

    if (driverDetails.error) {
        const addDriver = await addDriverToDB(userId);
        
        return {driver:addDriver}
    }
    
    
    return {driver: driverDetails[0] };
    
  }

  if (user_role === "rider") {
    const riderDetails = await getRiderOnConditionFromDB(
      "user_id",
      userId
    );
    
    //if user is rider but no details in database add rider to rider table

    if (riderDetails.rows.length < 1) {
        const addRider = await addRiderToDB(userId)
        return {rider: addRider}
    }
    const returnedRiderDetails = riderDetails.rows[0]
    return { rider: returnedRiderDetails };
  }
  
}


export const getUserIdUsingEmailService = async (userEmail) => {
  try {
    const user = await getUserIdUsingEmail(userEmail);
    return user;
  } catch (err) {
    
    return errorHandler("Error occurred in getting user", err, 500, "User Service");
  }
};


export const addUserService = async (userDetails) => {
  const user_id_property = "user_id";
  allowedProperties.unshift(user_id_property);
  
  try {
    const user_id = userDetails.user_id;
    const userDetailsWithId = { user_id, ...userDetails };
    const validUserDetailsWithId = allowedPropertiesOnly(userDetailsWithId, allowedProperties);

    const addedUser = await addUserToDB(validUserDetailsWithId);
    if (addedUser.error) {
      return addedUser; //Error message will be returned
    }

    const userRole = validUserDetailsWithId.user_role;
    if (userRole) {
      if (userRole === "rider") {
        return await addRiderIfApplicable(user_id, addedUser);
      } else if (userRole === "driver") {
        return await addDriverIfApplicable(user_id, addedUser);
      }
    }

    return addedUser;
  } catch (err) {
    
return errorHandler("Error occurred in adding user", err, 500, "User Service");
  }
};

const addRiderIfApplicable = async (user_id, addedUser) => {
  try {
    const addRider = await addRiderToDB(user_id);
    if (addRider.error) {
      return addRider //Error message will be returned
    }
    const addedRider = addRider[0];
    return { ...addedUser, rider: addedRider };
  } catch (err) {
    return errorHandler("Error adding rider", err, 500, "User Service");
  }
};

const addDriverIfApplicable = async (user_id, addedUser) => {
  try {
    const addDriver = addDriverToDB(user_id);
    if (addDriver.error) {
      return addDriver //error message will be returned
    }
    const addedDriver = addDriver[0];
    return { ...addedUser, driver: addedDriver };
  } catch (err) {
    console.log(err)
    return errorHandler("Error. User not updated", err, 500, "User Service");
  }
};

export const updateUserService = async (userId, userDetails) => {
  try {
    const validUserDetails = allowedPropertiesOnly(userDetails, allowedProperties);
    const updatedDetails = await updateUserOnDB(userId, validUserDetails);

    if (validUserDetails.user_role) {
      if (validUserDetails.user_role === "rider") {
        return await updateRiderRole(userId, updatedDetails);
      } else if (validUserDetails.user_role === "driver") {
        return await updateDriverRole(userId, updatedDetails);
      }
    }

    return updatedDetails;
  } catch (err) {
    console.log(err)
    return errorHandler("Error User not updated", err, 500, "Update User Service");
  }
};

 const updateRiderRole = async (userId, updatedDetails) => {
  try {
    const isDriver = await getDriverDetailOnCondition('user_id', userId);
    if (!isDriver.error && isDriver.length > 0) {
      const { driver_id } = isDriver[0];
      await deleteDriverFromDB(driver_id);
    }

    const riderExists = await getRiderOnConditionFromDB('user_id', userId);
    if (riderExists.rows.length >= 1) {
      const riderDetails = riderExists.rows[0];
      return { ...updatedDetails, rider: riderDetails };
    }

    const addRider = await addRiderToDB(userId);
    const addedRiderDetails = addRider[0];
    if (addedRiderDetails.rider_id) {
      return { ...updatedDetails, rider: addedRiderDetails };
    }

    return updatedDetails;
  } catch (err) {
    return errorHandler("Error updating rider role", err, 500, "User Service");

  }
};

const updateDriverRole = async (userId, updatedDetails) => {
  try {
    const isRider = await getRiderOnConditionFromDB('user_id', userId);
    if (isRider.rows.length >= 1) {
      const { rider_id } = isRider.rows[0];
      await deleteRiderFromDB(rider_id);
    }

    const driverExists = await getDriverDetailOnCondition('user_id', userId);
    if (!driverExists.error && driverExists.length > 0) {
      const driverDetails = driverExists[0];
      return { ...updatedDetails, driver: driverDetails };
    }

    const addDriver = await addDriverToDB(userId);
    const addedDriverDetails = addDriver[0];
    if (addedDriverDetails.driver_id) {
      return { ...updatedDetails, driver: addedDriverDetails };
    }

    return updatedDetails;
  } catch (err) {
    return errorHandler("Error updating driver role", err, 500, "User Service");
  }
};

export const deleteUserService = async (userId) => {
  try {
    //user is rider, delete rider
    const isRider =  await getRiderOnConditionFromDB('user_id', userId);
    
        if(isRider.rows.length >= 1) {
          
          const {rider_id} = isRider.rows[0]
          await deleteRiderFromDB(rider_id)
        }

    //user is driver, delete driver
    const isDriver =  await getDriverDetailOnCondition('user_id', userId);
    
        if (!isDriver.error) {
          const { driver_id } = isDriver[0]
          await deleteDriverFromDB(driver_id)
        }
      
    return await deleteUserFromDB(userId);
  } catch (err) {  
    return errorHandler("Error occurred deleting user", err, 500, "User Service");
  }
};