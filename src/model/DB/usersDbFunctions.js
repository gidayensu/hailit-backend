
import { DB } from "./connectDb.js";
import { errorHandler } from "../../utils/errorHandler.js";


export const getAllCustomers = async (tableName) => {
    try {
      const allItems = await DB.query(`SELECT * FROM ${tableName} WHERE `);
      const data = allItems.rows;
      return data;
    } catch (err) {
      return errorHandler("Error occurred getting all customers", `${err}`, 500, "Database Functions: Get All Customers");
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
      return errorHandler("Error occurred getting dispatcher vehicle data", `${err}`, 500, "Database Functions");
    }
  };
  