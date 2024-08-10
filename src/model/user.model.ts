import {
  USER_COLUMNS_FOR_ADDING,
  USER_EMAIL_COLUMN,
  USER_ID_COLUMN,
  USER_ROLE,
  USER_ROLE_COLUMN,
  USER_TABLE_NAME
} from "../constants/usersConstants";
import { errorHandler } from "../utils/errorHandler";
import { addOne } from "./DB/addDbFunctions";
import { deleteOne } from "./DB/deleteDbFunctions";
import {
  getCountOnOneCondition,
  getOne,
  getSpecificDetailsUsingId
} from "./DB/getDbFunctions";
import { detailExists } from "./DB/helperDbFunctions";
import { updateOne } from "./DB/updateDbFunctions";
import { getAllCustomers } from "./DB/usersDbFunctions";
import { customersCount } from "./DB/usersDbFunctions";

export const getAllUsersFromDB = async (
  limit,
  offset,
  sortColumn,
  sortDirection,
  search
) => {
  try {
    const allUsers = await getAllCustomers(
      USER_TABLE_NAME,
      limit,
      offset,
      sortColumn,
      sortDirection,
      search
    );

    if (!allUsers) {
      return errorHandler({
        error: "No user found",
        errorMessage: null,
        errorCode: 404,
        errorSource: "User Model"
      }
      );
    }

    return allUsers;
  } catch (err) {
    return errorHandler(
      {
        error: "Server error occurred getting all users",
        errorMessage: err,
        errorCode: 500,
        errorSource: "User Model: Get All Users"
      }
      
    );
  }
};

export const getCustomerCount = async (search) => {
  try {
    const customerCount = await customersCount(
      USER_TABLE_NAME,
      search
    );

    

    return customerCount;
  } catch (err) {
    return errorHandler(
      {
        error: "Server error occurred getting customer count",
        errorMessage: err,
        errorCode: 500,
        errorSource: "User Model: Customer Count"
      }
      
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
      {
        error: "Error occurred getting user details",
        errorMessage: err,
        errorCode: 500,
        errorSource: "User Model"
      }
      
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
        {
          error: "User email or number exists",
          errorMessage: null,
          errorCode: 400,
          errorSource: "User Model"
        }
        
      );
    }
  } catch (err) {
    return errorHandler(
      {
        error: "Error occurred adding user",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "User Model"
      }
      
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
      {
        error: "Error occurred: this error",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "User Model"
      }
      
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
      {
        error: `Error occurred: ${specificDetails.error}`,
        errorMessage: null,
        errorCode: 500,
        errorSource: "User Model"
      }
      
    );
  }

  return specificDetails;
};

export const deleteUserFromDB = async (userId) => {
  try {
  
    //check if user exists
    const userExist = await userExists(userId); //returns true/false or error
    
    if(userExist.error ) {
      return userExist 
    }
    // if(userExist.error || !userExist) {
    //   userExist.error ? userExist : errorHandler("User does not exist", null, 404, "User Mode: Delete User")
    // }

    //delete if user exists
    if (userExist) {
      await deleteOne(USER_TABLE_NAME, USER_ID_COLUMN, userId);
      return { success: "user deleted" };
    } 
  } catch (err) {
    return errorHandler({
      error: "Server Error occurred",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "User Model: Delete User"
    }
    )
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
      {
        error: "Error occurred getting customers count",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "User Model: Customers Count"
      }
      
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
    return errorHandler({
      error: "Error checking if email exists",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "User Service: Email Exists"
    }
    );
  }
};

//check if phone number exists
export const phoneNumberExists = async (phoneNumber) => {
  try {
    const phoneNumberColumn = USER_COLUMNS_FOR_ADDING[4];
    return await detailExists(USER_TABLE_NAME, phoneNumberColumn, phoneNumber);
  } catch (err) {
    return errorHandler({
      error: "Error checking if phone number exists",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "User Service: Phone Number Exists"
    }
    );
  }
};


export const userExists = async (userId)=> {
  try {

    const exists = await detailExists(USER_TABLE_NAME, USER_ID_COLUMN, userId)//returns true/false or error
   
    
    if(!exists) {
      return errorHandler({
        error: "User does not exist",
        errorMessage: null,
        errorCode: 404,
        errorSource: "User Model: Update User"
      }
      )
    }
    
    return exists //will return error or true;
  } catch (err) {
    return errorHandler(
      {
        error: "Server error occurred",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "User Model: userExists"
      }
      )
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
          {
            error: "Error occurred getting user ID",
            errorMessage: `${err}`,
            errorCode: 500,
            errorSource: "User Model: User ID with User Email"
          }
          
        );
      }
    };
    