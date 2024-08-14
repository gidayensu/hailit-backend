import { PHONE_NUMBER } from "../constants/driverConstants";
import { DEFAULT_LIMIT } from "../constants/sharedConstants";
import {
  ALLOWED_PROPERTIES,
  USER_EMAIL_COLUMN,
  USER_ID_COLUMN,
  USER_PHONE_NUMBER_COLUMN,
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
import { EntityName } from "../types/shared.types";
import { User, UserKeys } from "../types/user.types";
import { ErrorResponse, handleError } from "../utils/handleError";
import { allowedPropertiesOnly, isErrorResponse } from "../utils/util";
import {
  addDriverIfApplicable,
  addRiderIfApplicable,
  riderOrDispatcherDetails,
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
      entityName: EntityName.Users}
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
export const getOneUserService = async (userId:string) => {
  try {
    const user = await getOneUserFromDB(userId);
    if(isErrorResponse(user)) {
      return user;
    }
    if (
      (user.user_role && user.user_role === "Driver") ||
      user.user_role === "Rider"
    ) {
      const getRiderOrDispatcherDetails = await riderOrDispatcherDetails({
        user_role: user.user_role,
        userId,
      });
      return { ...user, ...getRiderOrDispatcherDetails };
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

export const getUserIdUsingEmailService = async (userEmail:string) => {
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
export const addUserService = async (userDetails: User) => {
  
  ALLOWED_PROPERTIES.unshift(USER_ID_COLUMN);

  try {
    const userId = userDetails.user_id;
    
    const validUserDetailsWithId = allowedPropertiesOnly(
      {data:userDetails,
      allowedProperties:ALLOWED_PROPERTIES}
    );

    const addedUser = await addUserToDB(validUserDetailsWithId);

    if (isErrorResponse(addedUser)) {
      return addedUser; //Error details will be returned
    }

    const userRole = validUserDetailsWithId.user_role;
    if (userRole) {
      if (userRole === "rider") {
        return await addRiderIfApplicable({  userId, addedUser });
      } else if (userRole === "Driver") {
        return await addDriverIfApplicable({ userId, addedUser });
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
export const updateUserService = async ({userId, userDetails}: {userId:string, userDetails:User}) => {
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
          errorMessage: "",
          errorCode: 403,
          errorSource: "User Service: Update User"
        }
        
      );
    }
    const date_updated = "now()";
    validUserDetails = { ...validUserDetails, date_updated };

    
    const userExist = await userExists(userId);
    if (isErrorResponse(userExist) || !userExist) {
      return userExist; //returns with error message and code
    }

    
    const userData = await getOneUserFromDB(userId);

    if(isErrorResponse(userData)) {
      return userData //with error message
    }

    const { email = "", phone_number = "" } = validUserDetails;
    
    const emailExist = await detailExistsUserAssociation({
      detail: email,
      userProp: USER_EMAIL_COLUMN,
      existChecker: emailExists,
      userData,
    });

    if (isErrorResponse(emailExist)) {
      return emailExist; //with error message
    }

    //check if phone number exists and it belongs to the user being updated
    const numberExist = await detailExistsUserAssociation({
      detail: phone_number,
      userProp: USER_PHONE_NUMBER_COLUMN,
      existChecker: phoneNumberExists,
      userData,
    });
    if (isErrorResponse(numberExist)) {
      return numberExist;
    }

    const updatedDetails = await updateUserOnDB({userId, userDetails: validUserDetails});

    if(isErrorResponse(updatedDetails)) {
      return updatedDetails;
    }
    //return data with driver/rider details
    if (userData.user_role === "Rider") {
      return await updateRiderRole({userId, updatedDetails});
    }

    if (userData.user_role === "Driver") {
      return await updateDriverRole({userId, updatedDetails});
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
export const deleteUserService = async (userId:string) => {
  try {
    //user is rider, delete rider
    const isRider = await getRiderOnConditionFromDB({columnName: USER_ID_COLUMN, condition: userId});

    if (isErrorResponse(isRider)) {
      return isRider;
    }
    //delete rider if no error

    const { rider_id } = isRider[0];
    await deleteRiderFromDB(rider_id);
    

    //user is driver, delete driver

    const isDriver = await getDriverDetailOnCondition({columnName: USER_ID_COLUMN, condition: userId});

    if (isErrorResponse(isDriver)) {
      return isDriver;
    }
    const { driver_id } = isDriver;
    await deleteDriverFromDB(driver_id);
    
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

export const detailExistsUserAssociation = async ({
  detail,
  userProp,
  existChecker,
  userData,
}: {
  detail: string;
  userProp: UserKeys;
  existChecker: (condition:string)=> Promise<boolean | ErrorResponse>;
  userData: User;
}) => {
  try {
    const detailExists = await existChecker(detail);
    
    const userDetail = userData[userProp];
    if (detail && detailExists && detail !== userDetail) {
      return handleError({
        error: `User not updated, use a different ${userProp}`,
        errorMessage: "",
        errorCode: 400,
        errorSource: "User Service: Detail Exists",
      });
    }
    return detailExists;
  } catch (err) {
    return handleError({
      error: "Error checking ${userProp} association",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "User Service: Detail Exists",
    });
  }
};
