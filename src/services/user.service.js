import { deleteDriverFromDB, getDriverDetailOnCondition } from "../model/driver.model.js";
import { deleteRiderFromDB, getRiderOnConditionFromDB } from "../model/rider.model.js";
import { addUserToDB, deleteUserFromDB, getAllUsersFromDB, getCustomersCount, getOneUserFromDB, getUserIdUsingEmail, updateUserOnDB } from "../model/user.model.js";
import { errorHandler } from "../utils/errorHandler.js";
import { paginatedRequest } from "../utils/paginatedRequest.js";
import { allowedPropertiesOnly } from "../utils/util.js";
import { addDriverIfApplicable, addRiderIfApplicable, riderOrDriverDetails, updateDriverRole, updateRiderRole } from "./dispatcherRole.service.js";

let allowedProperties = [
  "user_id",
  "first_name",
  "last_name",
  "email",
  "phone_number",
  "user_role",
  "onboard"
];

//GET ALL CUSTOMERS (USERS WITH CUSTOMER ROLE)
export const getAllUsersService = async (page) => {
  try {
    const limit = 7;
    let offset = 0;

    page > 1 ? offset = (limit * page) - limit : page;

    const users = await getAllUsersFromDB(limit, offset);
    const totalCount = await getCustomersCount();
    
    return await paginatedRequest(totalCount, users, offset, limit, "users") 
    
  } catch (err) {
    
    return errorHandler("Error occurred getting all users", `${err}`, 500, "User service");
  }
};

//GET USER
export const getOneUserService = async (userId) => {
  try {
    const user = await getOneUserFromDB(userId);
    if (user.user_role && user.user_role === "Driver" || user.user_role === "Rider") {
      const getRiderOrDriverDetails = await riderOrDriverDetails (user.user_role, userId); 
      return {...user, ...getRiderOrDriverDetails}
    }
    
    return user;
  } catch (err) {
    
    return errorHandler("Server error occurred in getting user", `${err}`, 500, "User Service: Get One User");

  }
};


//GET USER ID WITH EMAIL

export const getUserIdUsingEmailService = async (userEmail) => {
  try {
    const user = await getUserIdUsingEmail(userEmail);
    return user;
  } catch (err) {
    
    return errorHandler("Error occurred in getting user", `${err}`, 500, "User Service");
  }
};

//ADD USER
export const addUserService = async (userDetails) => {
  const user_id_property = "user_id";
  allowedProperties.unshift(user_id_property);
  
  try {
    const user_id = userDetails.user_id;
    const userDetailsWithId = { user_id, ...userDetails };
    const validUserDetailsWithId = allowedPropertiesOnly(userDetailsWithId, allowedProperties);

    const addedUser = await addUserToDB(validUserDetailsWithId);
    
    if (addedUser.error) {
      return addedUser; //Error details will be returned
    }

    const userRole = validUserDetailsWithId.user_role;
    if (userRole) {
      if (userRole === "rider") {
        return await addRiderIfApplicable(user_id, addedUser);
      } else if (userRole === "Driver") {
        return await addDriverIfApplicable(user_id, addedUser);
      }
    }

    return addedUser;
  } catch (err) {
    
return errorHandler("Error occurred in adding user", `${err}`, 500, "User Service");
  }
};

//UPDATE USER
export const updateUserService = async (userId, userDetails) => {
  try {
    const validUserDetails = allowedPropertiesOnly(userDetails, allowedProperties);
    const updatedDetails = await updateUserOnDB(userId, validUserDetails);
    
    if (validUserDetails.user_role) {
      if (validUserDetails.user_role === "Rider") {
        return await updateRiderRole(userId, updatedDetails);
      } else if (validUserDetails.user_role === "Driver") {
        return await updateDriverRole(userId, updatedDetails);
      }
    }

    return updatedDetails;
  } catch (err) {
    
    return errorHandler("Error User not updated", `${err}`, 500, "Update User Service");
  }
};

 
//DELETE USER
export const deleteUserService = async (userId) => {
  try {
    //user is rider, delete rider
    const isRider =  await getRiderOnConditionFromDB('user_id', userId);
        
        if(!isRider.error) {
          const {rider_id} = isRider.rows[0]
          await deleteRiderFromDB(rider_id)
        }

    //user is driver, delete driver
    const isDriver =  await getDriverDetailOnCondition('user_id', userId);
    
        if (!isDriver.error) {
          const { driver_id } = isDriver[0]
          await deleteDriverFromDB(driver_id)
        }
    const deleteUser = await deleteUserFromDB(userId);
    
    return deleteUser;
  } catch (err) { 
    return errorHandler("Error occurred deleting user", `${err}`, 500, "User Service: Delete user");
  }
};