import { DEFAULT_LIMIT } from "../constants/sharedConstants";
import {
  ALLOWED_PROPERTIES,
  USER_ID_COLUMN,
} from "../constants/usersConstants";
import {
  deleteDriverFromDB,
  getDriverDetailOnCondition,
} from "../model/driver.model";
import {
  deleteRiderFromDB,
  getRiderOnConditionFromDB,
} from "../model/rider.model";
import {
  addUserToDB,
  deleteUserFromDB,
  emailExists,
  getAllUsersFromDB,
  getCustomerCount,
  getOneUserFromDB,
  getUserIdUsingEmail,
  phoneNumberExists,
  updateUserOnDB,
  userExists
} from "../model/user.model";
import { GetAll } from "../types/getAll.types";
import { handleError } from "../utils/handleError";
import { allowedPropertiesOnly } from "../utils/util";
import {
  addDriverIfApplicable,
  addRiderIfApplicable,
  riderOrDriverDetails,
  updateDriverRole,
  updateRiderRole,
} from "./dispatcherRole.service";
import { getAllEntitiesService } from "./helpers.service";

//GET ALL CUSTOMERS (USERS WITH CUSTOMER ROLE)
export const getAllUsersService = async (
  {page,
  limit = DEFAULT_LIMIT,
  sortColumn,
  sortDirection,
  search} :GetAll
) => {
  try {
    const users = await getAllEntitiesService(
      {page,
      limit,
      sortColumn,
      sortDirection,
      search,
      getAllEntitiesFromDB: getAllUsersFromDB,
      getCount: getCustomerCount,
      entityName: "users"}
    );
    return users;
  } catch (err) {
    return handleError(
      {
        error: "Error occurred getting all users",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "User Service"
      }
      
    );
  }
};

//GET USER
export const getOneUserService = async (userId) => {
  try {
    const user = await getOneUserFromDB(userId);
    if (
      (user.user_role && user.user_role === "Driver") ||
      user.user_role === "Rider"
    ) {
      const getRiderOrDriverDetails = await riderOrDriverDetails(
        user.user_role,
        userId
      );
      return { ...user, ...getRiderOrDriverDetails };
    }

    return user;
  } catch (err) {
    return handleError(
      {
        error: "Server error occurred in getting user",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "User Service: Get One User"
      }
      
    );
  }
};

//GET USER ID WITH EMAIL

export const getUserIdUsingEmailService = async (userEmail) => {
  try {
    const user = await getUserIdUsingEmail(userEmail);
    return user;
  } catch (err) {
    return handleError(
      {
        error: "Error occurred in getting user",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "User Service: get user id using email"
      }
      
    );
  }
};

//ADD USER
export const addUserService = async (userDetails) => {
  const user_id_property = "user_id";
  ALLOWED_PROPERTIES.unshift(user_id_property);

  try {
    const user_id = userDetails.user_id;
    const userDetailsWithId = { user_id, ...userDetails };
    const validUserDetailsWithId = allowedPropertiesOnly(
      {data:userDetailsWithId,
      allowedProperties:ALLOWED_PROPERTIES}
    );

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
    return handleError(
      {
        error: "Error occurred in adding user",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "User Service"
      }
      
    );
  }
};

//UPDATE USER
export const updateUserService = async (userId, userDetails) => {
  try {
    //VALIDATION - SHOULD BE MOVED TO A SEPARATE MIDDLEWARE
    let validUserDetails = allowedPropertiesOnly(
      {data:userDetails,
      allowedProperties:ALLOWED_PROPERTIES}
    );
    if (validUserDetails.length < 1) {
      return handleError(
        {
          error: "No valid details added",
          errorMessage: null,
          errorCode: 403,
          errorSource: "User Service: Update User"
        }
        
      );
    }
    const date_updated = "now()";
    validUserDetails = { ...validUserDetails, date_updated };

    //check if user exists
    const userExist = await userExists(userId);
    if (userExist.error || !userExist) {
      return userExist; //returns with error message and code
    }

    //get user data to check for existing email/phone_number
    const userData = await getOneUserFromDB(userId);

    const { email = "", phone_number = "" } = validUserDetails;
    //check if email exists and it belongs to the user being updated
    const emailExist = await detailExistsUserAssociation(
      email,
      "email",
      emailExists,
      userData
    );

    if (emailExist.error) {
      return emailExist; //with error message
    }

    //check if phone number exists and it belongs to the user being updated
    const numberExist = await detailExistsUserAssociation(
      phone_number,
      "phone_number",
      phoneNumberExists,
      userData
    );
    if (numberExist.error) {
      return numberExist;
    }

    const updatedDetails = await updateUserOnDB(userId, validUserDetails);

    //return data with driver/rider details
    if (userData.user_role === "Rider") {
      return await updateRiderRole(userId, updatedDetails);
    }

    if (userData.user_role === "Driver") {
      return await updateDriverRole(userId, updatedDetails);
    }
    //return only user details

    return updatedDetails;
  } catch (err) {
    return handleError(
      {
        error: "Error: User not updated",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Update User Service"
      }
      
    );
  }
};

//DELETE USER
export const deleteUserService = async (userId) => {
  try {
    //user is rider, delete rider
    const isRider = await getRiderOnConditionFromDB(USER_ID_COLUMN, userId);

    if (isRider.error && isRider.errorCode !== 404) {
      return isRider;
    }
    //delete rider if no error

    if (!isRider.error) {
      const { rider_id } = isRider.rows[0];
      await deleteRiderFromDB(rider_id);
    }

    //user is driver, delete driver

    const isDriver = await getDriverDetailOnCondition(USER_ID_COLUMN, userId);

    if (isDriver.error && isDriver.errorCode !== 404) {
      return isDriver;
    }
    if (!isDriver.error) {
      const { driver_id } = isDriver[0];
      await deleteDriverFromDB(driver_id);
    }
    //delete driver if no error

    const deleteUser = await deleteUserFromDB(userId);

    return deleteUser;
  } catch (err) {
    return handleError(
      {
        error: "Error occurred deleting user",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "User Service: Delete User"
      }
      
    );
  }
};

export const detailExistsUserAssociation = async (
  detail,
  detailProp,
  existChecker,
  userData
) => {
  try {
    const detailExists = await existChecker(detail);

    const userDetail = userData[detailProp];
    if (detail && detailExists && detail !== userDetail) {
      return handleError(
        {
          error: `User not updated, use a different ${detailProp}`,
          errorMessage: null,
          errorCode: 400,
          errorSource: "User Service: Detail Exists"
        }
        
      );
    }
    return detailExists;
  } catch (err) {
    return handleError(
      {
        error: "Error checking ${detailProp} association",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "User Service: Detail Exists"
      }
      
    );
  }
};
