//constants
import {
  USER_EMAIL_COLUMN,
  USER_ID_COLUMN,
  USER_PHONE_NUMBER_COLUMN,
  USER_ROLE,
  USER_ROLE_COLUMN,
  USER_TABLE_NAME
} from "../constants/usersConstants";

//types
import { GetAllFromDB } from "../types/getAll.types";
import { TotalCount } from "../types/shared.types";
import { User, UserRole } from "../types/user.types";
import { ErrorResponse, handleError } from "../utils/handleError";

//helpers
import { isErrorResponse } from "../utils/util";

//DB functions
import { addOne } from "./DB/addDbFunctions";
import { deleteOne } from "./DB/deleteDbFunctions";
import {
  getCountOnOneCondition,
  getOne,
  getSpecificDetailsUsingId
} from "./DB/getDbFunctions";
import { detailExists } from "./DB/helperDbFunctions";
import { updateOne } from "./DB/updateDbFunctions";
import { customersCount, getAllCustomers } from "./DB/usersDbFunctions";

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

    return allUsers;
  } catch (err) {
    return handleError(
      {
        error: "Server error occurred getting all users",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "User Model: Get All Users"
      }
      
    );
  }
};

export const getCustomerCount = async (search:string): Promise<ErrorResponse | TotalCount> => {
  try {
    const customerCount = await customersCount(
      search
    );

    

    return customerCount;
  } catch (err) {
    return handleError(
      {
        error: "Server error occurred getting customer count",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "User Model: Customer Count"
      }
      
    );
  }
};



export const getOneUserFromDB = async (userId:string) => {
  try {
    
    const userData: User[] | ErrorResponse = await getOne({
      tableName: USER_TABLE_NAME,
      columnName: USER_ID_COLUMN,
      condition: userId,
    });

    if (isErrorResponse(userData)) {
      return userData //returns error message and code
    }
    
    const user =  userData[0];
    return user;
  } catch (err) {
    return handleError(
      {
        error: "Error occurred getting user details",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "User Model"
      }
      
    );
  }
};



export const addUserToDB = async (userDetails: User) => {
  const { email } = userDetails;
  const columnsForAdding = Object.keys(userDetails);
  const userDetailsArray: string[] = Object.values(userDetails);

  try {
    const emailExist = await emailExists(email);

    if (!emailExist) {
      return await insertUserDetails({columns: columnsForAdding, userDetails: userDetailsArray})
    } else {
      return handleError(
        {
          error: "User email or number exists",
          errorMessage: "",
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


export const insertUserDetails = async ({userDetails, columns}: {userDetails: string[], columns: string[]})=> {
  try {
    const insertUserDetails: User[] | ErrorResponse = await addOne(
      { tableName: USER_TABLE_NAME,
      columns: columns,
      values: userDetails}
    );
    
    if (isErrorResponse(insertUserDetails)) {
      
      return insertUserDetails;
    }
    const newUser: User = insertUserDetails[0];
  } catch (err) {
    return handleError(
      {
        error: "Error occurred: inserting user details",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "User Model: Add User"
      }
      
    );
  
  }
}
export const updateUserOnDB = async ({userId, userDetails}: {userId:string, userDetails: User}) => {
  try {
    const validColumnsForUpdate = Object.keys(userDetails);
    const userDetailsArray = Object.values(userDetails);

    const update = await updateOne({
      tableName: USER_TABLE_NAME,
      columns: validColumnsForUpdate,
      id: userId,
      idColumn: USER_ID_COLUMN,
      details: userDetailsArray,
    });
    const updatedDetails: User = !isErrorResponse(update) && update.rows[0];

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


export const getSpecificUserDetailsUsingId = async ({userId, columns}: {userId:string, columns: string[] | string}): Promise<User[] | ErrorResponse> => {
  
  const specificDetails = await getSpecificDetailsUsingId({
    tableName: USER_TABLE_NAME,
    id: userId,
    idColumn: USER_ID_COLUMN,
    columns: columns,
  });
  if (isErrorResponse(specificDetails)) {
    return handleError(
      {
        error: `Error occurred: ${specificDetails.error}`,
        errorMessage: "",
        errorCode: 500,
        errorSource: "User Model"
      }
      
    );
  }

  return specificDetails;
};

export const deleteUserFromDB = async (userId:string) => {
  try {
  
    //check if user exists
    const userExist = await userExists(userId); //returns true/false or error
    
    if(isErrorResponse(userExist) ) {
      return userExist 
    }
    

    //delete if user exists
    if (userExist) {
      const deleteUser = await deleteOne({tableName: USER_TABLE_NAME, columnName: USER_ID_COLUMN, id: userId});
      return deleteUser;
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
    const customersCount = await getCountOnOneCondition({
      tableName: USER_TABLE_NAME,
      condition: USER_ROLE,
      conditionColumn: USER_ROLE_COLUMN,
    });

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
export const emailExists = async (email:string) => {
  try {
    
    return await detailExists({
      tableName: USER_TABLE_NAME,
      columnName: USER_EMAIL_COLUMN,
      detail: email,
    });
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
export const phoneNumberExists = async (phoneNumber:string) => {
  try {
    
    return await detailExists({tableName: USER_TABLE_NAME, columnName: USER_PHONE_NUMBER_COLUMN, detail: phoneNumber});
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


export const userExists = async (userId: string)=> {
  try {
    const exists = await detailExists({
      tableName: USER_TABLE_NAME,
      columnName: USER_ID_COLUMN,
      detail: userId,
    }); //returns true/false or error

    if (!exists) {
      return handleError({
        error: "User does not exist",
        errorMessage: "",
        errorCode: 404,
        errorSource: "User Model: Update User",
      });
    }

    return exists; //will return error or true;
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


    export const isUserRole = async ({userId, userRole}: {userId:string, userRole: UserRole}) => {
      const data  = await getOneUserFromDB(userId);
      if(isErrorResponse(data)) {
        return data;
      }
      if (data.user_role === userRole) {
        return true;
      } else {
        return false;
      }
    };
    
    export const getUserIdUsingEmail = async (userEmail:string) => {
      try {
        
        const userDetails: User[] | ErrorResponse = await getOne({
          tableName: USER_TABLE_NAME,
          columnName: USER_EMAIL_COLUMN,
          condition: userEmail,
        });
    
        if (isErrorResponse(userDetails)) {
          return userDetails; //error message included
        } else {
          const userId: {user_id: string} = { user_id: userDetails[0].user_id };
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
    