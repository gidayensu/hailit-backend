import {
  USER_COLUMNS_FOR_ADDING,
  USER_EMAIL_COLUMN,
  USER_ID_COLUMN,
  USER_ROLE,
  USER_ROLE_COLUMN,
  USER_TABLE_NAME
} from "../constants/usersConstants.js";
import { errorHandler } from "../utils/errorHandler.js";
import { addOne } from "./DB/addDbFunctions.js";
import { deleteOne } from "./DB/deleteDbFunctions.js";
import {
  getCountOnOneCondition,
  getOne,
  getSpecificDetailsUsingId,
  selectOnCondition,
} from "./DB/getDbFunctions.js";
import { detailExists } from "./DB/helperDbFunctions.js";
import { updateOne } from "./DB/updateDbFunctions.js";

export const getAllUsersFromDB = async (limit, offset) => {
  try {
    const allUsers = await selectOnCondition(
      USER_TABLE_NAME,
      USER_ROLE_COLUMN,
      USER_ROLE,
      limit,
      offset
    );

    if (!allUsers) {
      return errorHandler("No user found", null, 404, "User Model");
    }

    return allUsers;
  } catch (err) {
    return errorHandler(
      "Server error occurred getting all users",
      err,
      500,
      "User Model"
    );
  }
};


export const getOneUserFromDB = async (userId) => {
  try {
    
    const user = await getOne(USER_TABLE_NAME, USER_ID_COLUMN, userId);

    if (user.error) {
      return user //returns error message and code
    }
    return user[0];
  } catch (err) {
    return errorHandler(
      "Error occurred getting user details",
      err,
      500,
      "User Model"
    );
  }
};



export const addUserToDB = async (userDetails) => {
  const { email } = userDetails;
  const columnsForAdding = Object.keys(userDetails);
  const userDetailsArray = Object.values(userDetails);

  try {
    const emailExist = await emailExists(email);

    if (!emailExist) {
      const insertUserDetails = await addOne(
        USER_TABLE_NAME,
        columnsForAdding,
        userDetailsArray
      );

      if (insertUserDetails) {
        const insertedDetails = insertUserDetails[0];
        return insertedDetails;
      }
    } else {
      return errorHandler(
        "user email or number exists",
        null,
        400,
        "User Model"
      );
    }
  } catch (err) {
    return errorHandler(
      `Error occurred adding user`,
      `${err}`,
      500,
      "User Model"
    );
  }
};



export const updateUserOnDB = async (userId, userDetails) => {
  try {
    const validColumnsForUpdate = Object.keys(userDetails);
    const userDetailsArray = Object.values(userDetails);
    

    const update = await updateOne(
      USER_TABLE_NAME,
      validColumnsForUpdate,
      userId,
      USER_ID_COLUMN,
      ...userDetailsArray
    );
    const updatedDetails = update.rows[0];

    return updatedDetails;
    
  } catch (err) {
    return errorHandler(
      `Error occurred this error`,
      `${err}`,
      500,
      "User Model"
    );
  }
};

export const getSpecificUserDetailsUsingId = async (userId, columns) => {
  
  const specificDetails = await getSpecificDetailsUsingId(
    USER_TABLE_NAME,
    userId,
    USER_ID_COLUMN,
    columns
  );
  if (specificDetails.error) {
    return errorHandler(
      `Error occurred: ${specificDetails.error}`,
      null,
      500,
      "User Model"
    );
  }

  return specificDetails;
};

export const deleteUserFromDB = async (userId) => {
  try {
  
    //check if user exists
    const userExist = await userExists(userId); //returns true/false or error
    console.log({userExist})
    if(userExist.error || !userExist) {
      userExist.error ? userExist : errorHandler("User does not exist", null, 404, "User Mode: Delete User")
    }

    //delete if user exists
    if (userExist) {
      await deleteOne(USER_TABLE_NAME, USER_ID_COLUMN, userId);
      return { success: "user deleted" };
    } 
  } catch (err) {
    return errorHandler("Server Error occurred", `${err}`, 500, "User Mode: Delete User")
  }
};


//STATS
export const getCustomersCount = async () => {
  try {
    const customersCount = await getCountOnOneCondition(
      USER_TABLE_NAME,
      USER_ROLE,
      USER_ROLE_COLUMN
    );

    return customersCount;
  } catch (err) {
    return errorHandler(
      "Error occurred getting customers count",
      `${err}`,
      500,
      "User Model: Customers Count"
    );
  }
};

//HELPERS

//check if email exists
export const emailExists = async (email) => {
  try {
    const columnName = USER_COLUMNS_FOR_ADDING[3];
    return await detailExists(USER_TABLE_NAME, columnName, email);
  } catch (err) {
    return errorHandler("Error checking if email exists", `${err}`, 500, "User Service: Email Exists");
  }
};

//check if phone number exists
export const phoneNumberExists = async (phoneNumber) => {
  try {
    const phoneNumberColumn = USER_COLUMNS_FOR_ADDING[4];
    return await detailExists(USER_TABLE_NAME, phoneNumberColumn, phoneNumber);
  } catch (err) {
    return errorHandler("Error checking if phone number exists", `${err}`, 500, "User Service: Phone Number Exists");
  }
};


export const userExists = async (userId)=> {
  try {

    const exists = await detailExists(USER_TABLE_NAME, USER_ID_COLUMN, userId)//returns true/false or error
   
    
    if(!exists) {
      return errorHandler("User does not exist", null, 404, "User Mode: Update User")
    }
    
    return exists //will return error or true;
  } catch (err) {
    return errorHandler(
      `Server error occurred `,
      `${err}`,
      500,
      "User Model: userExists")
  }
    }; 


    export const isUserRole = async (userId, user_role) => {
      const data = await getOneUserFromDB(userId);
    
      if (data.user_role === user_role) {
        return true;
      } else {
        return false;
      }
    };
    
    export const getUserIdUsingEmail = async (userEmail) => {
      try {
        
        const userDetails = await getOne(
          USER_TABLE_NAME,
          USER_EMAIL_COLUMN,
          userEmail
        );
    
        if (userDetails.error) {
          return userDetails; //error message included
        } else {
          const userId = { user_id: userDetails[0].user_id };
          return userId;
        }
      } catch (err) {
        return errorHandler(
          "Error occurred getting uesr ID",
          `${err}`,
          500,
          "User Model: User ID with User Email"
        );
      }
    };
    