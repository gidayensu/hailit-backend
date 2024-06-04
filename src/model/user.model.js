import { errorHandler } from "../utils/errorHandler.js";
import {
  addOne,
  deleteOne,
  detailExists,
  getAll,
  getOne,
  getSpecificDetailsUsingId,
  selectOnCondition,
  updateOne,
} from "./dBFunctions.js";

const userTableName = "users";

const userColumnsForAdding = [
  "user_id",
  "first_name",
  "last_name",
  "email",
  "phone_number",
  "user_role"
];

const USER_ROLE = "customer"
const USER_ROLE_COLUMN = "user_role"
export const getAllUsersFromDB = async () => {
  try {
    const allUsers = await selectOnCondition(userTableName, USER_ROLE_COLUMN, USER_ROLE );
    if (!allUsers) {
      return errorHandler("No user found", null, 404, "User Model");
    }
    return allUsers.rows;
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
    
    const userColumnName = userColumnsForAdding[0];
    const user = await getOne(userTableName, userColumnName, userId);
    if (user.error) {
      return errorHandler(user.error, user.errorMessage, user.errorCode, user.errorLocation);
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

export const isUserRole = async (userId, user_role) => {
  const data = await getOneUserFromDB(userId);

  if (data.user_role === user_role) {
    return true;
  } else {
    return false;
  }
};

export const getUserIdUsingEmail = async (userEmail) => {
  const emailColumnName = userColumnsForAdding[3];
  const userDetails = await getOne(userTableName, emailColumnName, userEmail);

  if (userDetails.error) {
    return errorHandler("User does not exist", null, 404, "User Model");
  } else {
    const userId = { user_id: userDetails[0].user_id };
    return userId;
  }
};

//check if email exists
const emailExists = async (email) => {
  const columnName = userColumnsForAdding[3];
  return await detailExists(userTableName, columnName, email);
};

//check if phone number exists
const numberExists = async (phoneNumber) => {
  const phoneNumberColumn = userColumnsForAdding[4];
  return await detailExists(userTableName, phoneNumberColumn, phoneNumber);
};

export const addUserToDB = async (userDetails) => {
  const { email } = userDetails;
  const columnsForAdding = Object.keys(userDetails);
  const userDetailsArray = Object.values(userDetails);

  try {
    const emailExist = await emailExists(email);

    if (!emailExist) {
      const insertUserDetails = await addOne(
        userTableName,
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
    return errorHandler(`Error occurred adding user`, err, 500, "User Model");
  }
};

export const updateUserOnDB = async (userId, userDetails) => {
  
  try {
    const { email = "", phone_number = "" } = userDetails;
    const validColumnsForUpdate = Object.keys(userDetails);
    const userDetailsArray = Object.values(userDetails);
    const idColumn = userColumnsForAdding[0];

    const idValidation = await detailExists(userTableName, idColumn, userId);
    
    if (idValidation) {
      const userData = await getOne(userTableName, idColumn, userId);

      if (email !== "") {
        const resultEmail = userData[0].email;

        const emailExist = await emailExists(email);
        if (emailExist && email !== resultEmail) {
          return errorHandler(
            "User not updated, use a different email",
            null,
            400,
            "User Model"
          );
        }
      }

      if (phone_number !== "") {
        const resultPhoneNumber = userData[0].phone_number;

        const numberExist = await numberExists(phone_number);
        if (numberExist && phone_number !== resultPhoneNumber) {
          return errorHandler(
            "phone number is taken user not updated",
            null,
            400,
            "User Model"
          );
        }
      }

      const updateDate = "now()";
      userDetailsArray.splice(userDetailsArray.length - 1, 0, updateDate);

      validColumnsForUpdate.splice(
        validColumnsForUpdate.length - 1,
        0,
        "date_updated"
      );

      const update = await updateOne(
        userTableName,
        validColumnsForUpdate,
        userId,
        idColumn,
        ...userDetailsArray
      );
      const updatedDetails = update.rows[0];
      
      return updatedDetails;
    } else {
      return errorHandler("User Does Not Exist", null, 404, "User Model");
    }
  } catch (err) {
    return errorHandler(`Error occurred this error`, err, 500, "User Model");
  }
};

export const getSpecificUserDetailsUsingId = async (userId, columns) => {
  const userIdColumn = "user_id";
  const specificDetails = await getSpecificDetailsUsingId(
    userTableName,
    userId,
    userIdColumn,
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
  const columnName = userColumnsForAdding[0];
  const userExists = await detailExists(userTableName, columnName, userId);
  if (userExists) {
    await deleteOne(userTableName, columnName, userId);
    return { success: "user deleted" };
  } else {
    return errorHandler("user does not exist", null, 404, "User Model");
  }
};
