import { errorHandler } from "../../utils/errorHandler";
import { DB } from "./connectDb";
import { USERS_TABLE } from "../../constants/riderConstants";
import { GetAllFromDB } from "../../types/getAll.types";
import {
  DEFAULT_VEHICLE_ID,
  EMAIL_COLUMN,
  PHONE_NUMBER,
  RIDER_COLUMNS_FOR_ADDING,
  RIDER_ID_COLUMN,
  RIDER_TABLE_NAME,
  RIDER_VEHICLE_ID,
  USER_FIRST_NAME,
  USER_ID_RIDER,
  USER_ID_USERS,
  USER_LAST_NAME,
  VEHICLE_ID,
  VEHICLE_NAME_COLUMN,
  VEHICLE_PLATE_COLUMN,
} from "../../constants/riderConstants";
import { DRIVER_ID_COLUMN, DRIVER_TABLE_NAME, DRIVER_VEHICLE_ID, USER_ID_DRIVER } from "../../constants/driverConstants";
import { VEHICLE_TABLE_NAME } from "../../constants/vehicleConstants";
import { FIRST_NAME, LAST_NAME } from "../../constants/tripConstants";

interface DispatcherVehicleJoin extends GetAllFromDB {
  dispatcherRole: "Rider" | "Driver"
}




export const customersCount = async (
  
  search:string
) => {
  
  try {
    let queryText = `SELECT COUNT(*) AS total_count FROM ${USERS_TABLE} WHERE user_role = 'Customer'`;
    const values = [];

    if(search) {
      values.push(`%${search}%`)
      queryText = `
    SELECT COUNT(*) AS total_count FROM ${USERS_TABLE}
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
      {
        error: "Error occurred getting customer count",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Database Functions: Get Customer Count"
      }
      
    );
  }
};
export const getAllCustomers = async (
  {limit,
  offset,
  sortColumn,
  sortDirection = "ASC",
  search}: GetAllFromDB
) => {
  
  try {
    let queryText = `SELECT * FROM ${USERS_TABLE}`;
    const values = [];
    if (limit) {
      queryText = `SELECT * FROM ${USERS_TABLE} LIMIT ${limit} OFFSET ${offset}`;
    } 

    if(sortColumn && sortDirection) {
      queryText = `SELECT * FROM ${USERS_TABLE} WHERE user_role = 'Customer' ORDER BY ${sortColumn} ${sortDirection.toUpperCase()} LIMIT ${limit} OFFSET ${offset} `;
    }

    if(search) {
      values.push(`%${search}%`)
      queryText = `
    SELECT * FROM ${USERS_TABLE}
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
      {
        error: "Error occurred getting all details",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Database Functions: Get All Users"
      }
      
    );
  }
};



export const getDispatchersVehicleJoin = async (  
  {limit,
  offset,
  sortColumn = FIRST_NAME,
  sortDirection = "ASC",
  search,
  dispatcherRole}: DispatcherVehicleJoin
) => {
  let dispatcherTable =  RIDER_TABLE_NAME;
  let userIdDispatcher = USER_ID_RIDER;
  let dispatcherVehicleId = RIDER_VEHICLE_ID;
  let dispatcherIdColumn = RIDER_ID_COLUMN;

  if(dispatcherRole === "Driver") {
    dispatcherTable = DRIVER_TABLE_NAME;
    userIdDispatcher = USER_ID_DRIVER;
    dispatcherIdColumn = DRIVER_ID_COLUMN;
    dispatcherVehicleId = DRIVER_VEHICLE_ID;
  }
  try {
    const values = [];
    let queryText = `SELECT ${dispatcherTable}.*, ${FIRST_NAME}, ${LAST_NAME}, ${PHONE_NUMBER}, ${EMAIL_COLUMN}, ${PHONE_NUMBER}, ${VEHICLE_PLATE_COLUMN} FROM ${dispatcherTable} FULL OUTER JOIN ${USERS_TABLE} on ${userIdDispatcher} = ${USER_ID_USERS} FULL OUTER JOIN ${VEHICLE_TABLE_NAME} on ${dispatcherVehicleId} = ${VEHICLE_ID} WHERE ${dispatcherIdColumn} IS NOT NULL ORDER BY ${sortColumn} ${sortDirection.toUpperCase()} LIMIT ${limit} OFFSET ${offset};`;
    
    if(search) {
      values.push(`%${search}%`)
      queryText = `SELECT ${dispatcherTable}.*, ${FIRST_NAME}, ${LAST_NAME}, ${PHONE_NUMBER}, ${EMAIL_COLUMN}, ${PHONE_NUMBER}, ${VEHICLE_PLATE_COLUMN} FROM ${dispatcherTable} FULL OUTER JOIN ${USERS_TABLE} on ${userIdDispatcher} = ${USER_ID_USERS} FULL OUTER JOIN ${VEHICLE_TABLE_NAME} on ${dispatcherVehicleId} = ${VEHICLE_ID} WHERE ${dispatcherIdColumn} IS NOT NULL AND (
        ${FIRST_NAME} ILIKE $1
        OR ${LAST_NAME} ILIKE $1
        OR ${PHONE_NUMBER} ILIKE $1
        OR ${EMAIL_COLUMN} ILIKE $1
        OR ${VEHICLE_NAME_COLUMN} ILIKE $1
        OR ${VEHICLE_PLATE_COLUMN} ILIKE $1
        OR ${dispatcherTable}.license_number ILIKE $1       
      )
      ORDER BY ${sortColumn} ${sortDirection.toUpperCase()} LIMIT ${limit} OFFSET ${offset};`;
    }

    
  const allDispatchers = await DB.query(queryText, values)
    
    const dispatchers = allDispatchers.rows;
    return dispatchers;
  } catch (err) {
    
    return errorHandler(
      {
        error: "Error occurred getting dispatcher vehicle data",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Database Functions"
      }
      
    );
  }
};

export const getDispatcherCount = async ({
  search,
  dispatcherRole,
}: {
  search: string;
  dispatcherRole: "Driver" | "Rider";
}) => {

  let dispatcherTable = RIDER_TABLE_NAME;
  let userIdDispatcher = USER_ID_RIDER;
  let dispatcherVehicleId = RIDER_VEHICLE_ID;
  let dispatcherIdColumn = RIDER_ID_COLUMN;

  if (dispatcherRole === "Driver") {
    dispatcherTable = DRIVER_TABLE_NAME;
    userIdDispatcher = USER_ID_DRIVER;
    dispatcherIdColumn = DRIVER_ID_COLUMN;
    dispatcherVehicleId = DRIVER_VEHICLE_ID;
  }
  try {
    const values = [];
    let queryText = `SELECT COUNT(*) AS total_count FROM ${dispatcherTable} FULL OUTER JOIN ${USERS_TABLE} on ${userIdDispatcher} = ${USER_ID_USERS} FULL OUTER JOIN ${VEHICLE_TABLE_NAME} on ${dispatcherVehicleId} = ${VEHICLE_ID} WHERE ${dispatcherIdColumn} IS NOT NULL;`;

    if (search) {
      values.push(`%${search}%`);
      queryText = `SELECT COUNT(*) AS total_count FROM ${dispatcherTable} FULL OUTER JOIN ${USERS_TABLE} on ${userIdDispatcher} = ${USER_ID_USERS} FULL OUTER JOIN ${VEHICLE_TABLE_NAME} on ${dispatcherVehicleId} = ${VEHICLE_ID} WHERE ${dispatcherIdColumn} IS NOT NULL AND (
        ${FIRST_NAME} ILIKE $1
        OR ${LAST_NAME} ILIKE $1
        OR ${PHONE_NUMBER} ILIKE $1
        OR ${EMAIL_COLUMN} ILIKE $1
        OR ${VEHICLE_NAME_COLUMN} ILIKE $1
        OR ${VEHICLE_PLATE_COLUMN} ILIKE $1
        OR ${dispatcherTable}.license_number ILIKE $1       
      )
      ;`;
    }

    const dispatcherCount = await DB.query(queryText, values);
    const data = dispatcherCount.rows;

    return data[0];
  } catch (err) {
    return errorHandler({
      error: "Error occurred getting dispatcher count",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "User Database Functions: dispatcher count",
    });
  }
};