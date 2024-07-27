import { errorHandler } from "../../utils/errorHandler.js";
import { DB } from "./connectDb.js";

// export const getAllCustomers = async (tableName) => {
//   try {
//     const allItems = await DB.query(`SELECT * FROM ${tableName} WHERE `);
//     const data = allItems.rows;
//     return data;
//   } catch (err) {
//     return errorHandler(
//       "Error occurred getting all customers",
//       `${err}`,
//       500,
//       "Database Functions: Get All Customers"
//     );
//   }
// };


export const customersCount = async (
  tableName,
  search
) => {
  
  try {
    let queryText = `SELECT COUNT(*) AS total_count FROM ${tableName} WHERE user_role = 'Customer'`;
    const values = [];

    if(search) {
      values.push(`%${search}%`)
      queryText = `
    SELECT COUNT(*) AS total_count FROM ${tableName}
    WHERE user_role = 'Customer' AND (first_name ILIKE $1
      OR last_name ILIKE $1
      OR email ILIKE $1
      OR phone_number ILIKE $1
      OR user_role ILIKE $1)
      
  `;
    }
    
    const customerCount = await DB.query(queryText, values);
    const data = customerCount.rows;

    return data[0];
  } catch (err) {
    return errorHandler(
      "Error occurred getting customer count",
      `${err}`,
      500,
      "Database Functions: Get Customer Count"
    );
  }
};
export const getAllCustomers = async (
  tableName,
  limit,
  offset,
  sortColumn,
  sortDirection = "ASC",
  search
) => {
  
  try {
    let queryText = `SELECT * FROM ${tableName}`;
    const values = [];
    if (limit) {
      queryText = `SELECT * FROM ${tableName} LIMIT ${limit} OFFSET ${offset}`;
    } 

    if(sortColumn && sortDirection) {
      queryText = `SELECT * FROM ${tableName} WHERE user_role = 'Customer' ORDER BY ${sortColumn} ${sortDirection.toUpperCase()} LIMIT ${limit} OFFSET ${offset} `;
    }

    if(search) {
      values.push(`%${search}%`)
      queryText = `
    SELECT * FROM ${tableName}
    WHERE user_role = 'Customer' AND (first_name ILIKE $1
      OR last_name ILIKE $1
      OR email ILIKE $1
      OR phone_number ILIKE $1
      OR user_role ILIKE $1)
      
    ORDER BY ${sortColumn} ${sortDirection.toUpperCase()}
    LIMIT ${limit} OFFSET ${offset}
  `;
    }
    
    const allItems = await DB.query(queryText, values);
    const data = allItems.rows;

    return data;
  } catch (err) {
    return errorHandler(
      "Error occurred getting all details",
      `${err}`,
      500,
      "Database Functions: Get All Users"
    );
  }
};



export const getDispatchersVehicleJoin = async (
  dispatcherTable,
  usersTable,
  vehicleTable,
  firstName,
  lastName,
  phoneNumber,
  email,
  vehicleName,
  vehiclePlate,
  userIdDispatcher,
  userIdUsers,
  dispatcherVehicleId,
  vehicleId,
  dispatcherId,
  limit,
  offset = 0
) => {
  try {
    let allDispatchers = await DB.query(
      `select ${dispatcherTable}.*, ${firstName}, ${lastName}, ${phoneNumber}, ${email}, ${vehicleName}, ${vehiclePlate} from ${dispatcherTable} full outer join ${usersTable} on ${userIdDispatcher} = ${userIdUsers} full outer join ${vehicleTable} on ${dispatcherVehicleId} = ${vehicleId} where ${dispatcherId} is not null`
    );
    if (limit) {
      allDispatchers = await DB.query(
        `select ${dispatcherTable}.*, ${firstName}, ${lastName}, ${phoneNumber}, ${email}, ${vehicleName}, ${vehiclePlate} from ${dispatcherTable} full outer join ${usersTable} on ${userIdDispatcher} = ${userIdUsers} full outer join ${vehicleTable} on ${dispatcherVehicleId} = ${vehicleId} where ${dispatcherId} is not null limit ${limit} offset ${offset};`
      );
    }

    const dispatchers = allDispatchers.rows;
    return dispatchers;
  } catch (err) {
    return errorHandler(
      "Error occurred getting dispatcher vehicle data",
      `${err}`,
      500,
      "Database Functions"
    );
  }
};
