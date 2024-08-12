import {
  USER_COLUMNS_FOR_ADDING,
  USER_EMAIL_COLUMN,
  USER_ID_COLUMN,
  USER_ROLE,
  USER_ROLE_COLUMN,
  USER_TABLE_NAME
} from "../constants/usersConstants";
import { GetAllFromDB } from "../types/getAll.types";
import { handleError } from "../utils/handleError";
import { isErrorResponse } from "../utils/util";
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

export const getAllUsersFromDB = async ({
  limit,
  offset,
  sortColumn,
  sortDirection,
  search}:GetAllFromDB
) => {
  try {
    const allUsers = await getAllCustomers(
      {limit,
      offset,
      sortColumn,
      sortDirection,
      search}
    );

    if (!allUsers) {
      return handleError({
        error: "No user found",
        errorMessage: null,
        errorCode: 404,
        errorSource: "User Model"
      }
      );
    }

    return allUsers;
  } catch (err) {
    return handleError(
      {
        error: "Server error occurred getting all users",
        errorMessage: err,
        errorCode: 500,
        errorSource: "User Model: Get All Users"
      }
      
    );
  }
};

export const getCustomerCount = async (search:string) => {
  try {
    const customerCount = await customersCount(
      search
    );

    

    return customerCount;
  } catch (err) {
    return handleError(
      {
        error: "Server error occurred getting customer count",
        errorMessage: err,
        errorCode: 500,
        errorSource: "User Model: Customer Count"
      }
      
    );
  }
};



export const getOneUserFromDB = async (userId:string) => {
  try {
    
    const user = await getOne({
      tableName: USER_TABLE_NAME,
      columnName: USER_ID_COLUMN,
      condition: userId,
    });

    if (user.error) {
      return user //returns error message and code
    }
    return user[0];
  } catch (err) {
    return handleError(
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
      return handleError(
        {
          error: "User email or number exists",
          errorMessage: null,
          errorCode: 400,
          errorSource: "User Model"
        }
        
      );
    }
  } catch (err) {
    return handleError(
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
    return handleError(
      {
        error: "Error occurred: this error",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "User Model"
      }
      
    );
  }
};

export const getSpecificUserDetailsUsingId = async ({userId, columns}: {userId:string, columns: string[] | string}) => {
  
  const specificDetails = await getSpecificDetailsUsingId({
    tableName: USER_TABLE_NAME,
    id: userId,
    idColumn: USER_ID_COLUMN,
    columns: columns,
  });
  if (specificDetails.error) {
    return handleError(
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
    
    if(isErrorResponse(userExist) ) {
      return userExist 
    }
    

    //delete if user exists
    if (userExist) {
      await deleteOne(USER_TABLE_NAME, USER_ID_COLUMN, userId);
      return { success: "user deleted" };
    } 
  } catch (err) {
    return handleError({
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
    return handleError(
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
    return handleError({
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
    return handleError({
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
      return handleError({
        error: "User does not exist",
        errorMessage: null,
        errorCode: 404,
        errorSource: "User Model: Update User"
      }
      )
    }
    
    return exists //will return error or true;
  } catch (err) {
    return handleError(
      {
        error: "Server error occurred",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "User Model: userExists"
      }
      )
  }
    }; 


    export const isUserRole = async (userId, userRole) => {
      const data = await getOneUserFromDB(userId);
    
      if (data.user_role === userRole) {
        return true;
      } else {
        return false;
      }
    };
    
    export const getUserIdUsingEmail = async (userEmail) => {
      try {
        
        const userDetails = await getOne({
          tableName: USER_TABLE_NAME,
          columnName: USER_EMAIL_COLUMN,
          condition: userEmail,
        });
    
        if (userDetails.error) {
          return userDetails; //error message included
        } else {
          const userId = { user_id: userDetails[0].user_id };
          return userId;
        }
      } catch (err) {
        return handleError(
          {
            error: "Error occurred getting user ID",
            errorMessage: `${err}`,
            errorCode: 500,
            errorSource: "User Model: User ID with User Email"
          }
          
        );
      }
    };
    