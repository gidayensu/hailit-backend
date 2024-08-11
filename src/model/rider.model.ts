import { v4 as uuid } from "uuid";
import {
  DEFAULT_VEHICLE_ID,
  RIDER_COLUMNS_FOR_ADDING,
  RIDER_ID_COLUMN,
  RIDER_TABLE_NAME
} from "../constants/riderConstants";
import { USER_ID_COLUMN } from "../constants/usersConstants";
import { GetAllFromDB } from "../types/getAll.types";
import { errorHandler } from "../utils/errorHandler";
import { addOne } from "./DB/addDbFunctions";
import { deleteOne } from "./DB/deleteDbFunctions";
import {
  getOne,
  getSpecificDetails,
  getSpecificDetailsUsingId,
} from "./DB/getDbFunctions";
import { updateOne } from "./DB/updateDbFunctions";
import { getDispatcherCount, getDispatchersVehicleJoin } from "./DB/usersDbFunctions";

export const getAllRiders = async ({
  limit,
  offset,
  sortColumn,
  sortDirection,
  search,
}:GetAllFromDB) => {
  try {
    const allRiders = await getDispatchersVehicleJoin({
      limit,
      offset,
      sortColumn,
      sortDirection,
      search,
      dispatcherRole: "Rider"
    });
    if (allRiders.error) {
      return errorHandler({
        error: allRiders.error,
        errorMessage: null,
        errorCode: 500,
        errorSource: "All Riders Model",
      });
    }
    return allRiders;
  } catch (err) {
    return errorHandler({
      error: "Server error occurred getting all riders",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "All Riders Model",
    });
  }
};

export const getRidersCount = async(search:string)=> {
  try {
    const ridersCount = await getDispatcherCount({
      search,
      dispatcherRole: "Rider",
    });
    
    return ridersCount;
    
  } catch(err) {
    return errorHandler({
      error: "Error occurred getting Riders Count",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Rider Model: Riders Count"
    }
    )
  }
}

export const getOneRiderFromDB = async (rider_id:string) => {
  try {
    
    const rider = await getOne({
      tableName: RIDER_TABLE_NAME,
      columnName: RIDER_ID_COLUMN,
      condition: rider_id,
    });
    if (rider.error) {
      return rider;
    }
    return rider[0];
  } catch (err) {
    return errorHandler({
      error: "Error occurred. Rider not fetched",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Rider Model"
    }
    ); 
  }
};

export const getRiderOnConditionFromDB = async (columnName, condition) => {
  try {
    const riderDetails = await getOne(
      {tableName: RIDER_TABLE_NAME,
      columnName,
      condition}
    );
    return riderDetails;
  } catch (err) {
    return errorHandler({
      error: "Error occurred getting rider",
      errorMessage: null,
      errorCode: 404,
      errorSource: "Rider Model: Rider on Condition"
    }
    );
  }
};

export const getSpecificRidersFromDB = async (specificColumn, condition) => {
  try {
    const specificRiders = await getSpecificDetails(
      RIDER_TABLE_NAME,
      specificColumn,
      condition
    );
    return specificRiders;
  } catch (err) {
    return errorHandler({
      error: "Error occurred in retrieving riders",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Rider Model"
    }
    );
  }
};

export const addRiderToDB = async (user_id:string) => {
  try {
    const userIsRider = await getSpecificDetailsUsingId(RIDER_TABLE_NAME, user_id, USER_ID_COLUMN, RIDER_ID_COLUMN);
    
    if (userIsRider.length >= 1) {
      return errorHandler({
        error: "User is rider",
        errorMessage: "User already exists",
        errorCode: 400,
        errorSource: "Rider Model"
      }
      );
    }
    const rider_id = uuid();
    const riderDetails = [rider_id, DEFAULT_VEHICLE_ID, user_id];
    const addingMotor = await addOne(
      RIDER_TABLE_NAME,
      RIDER_COLUMNS_FOR_ADDING,
      riderDetails
    );
    
      return addingMotor;
    
  } catch (err) {
    return errorHandler({
      error: "Error occurred adding rider",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Rider Model"
    }
    );
  }
};

export const updateRiderOnDB = async (riderDetails) => {
  const { rider_id } = riderDetails;
  
  const tableColumns = Object.keys(riderDetails);
  const riderDetailsArray = Object.values(riderDetails);

  try {
    const riderUpdate = await updateOne(
      RIDER_TABLE_NAME,
      tableColumns,
      rider_id,
      RIDER_ID_COLUMN,
      ...riderDetailsArray
    );
    if (riderUpdate.error) {
      return riderUpdate //error details returned
    }
    if (riderUpdate.rowCount === 0) {
      return errorHandler({
        error: "Rider details not updated",
        errorMessage: "Rider detail not found",
        errorCode: 400,
        errorSource: "Rider Model"
      }
      );
    }
    return riderUpdate.rows[0];
  } catch (err) {
    return errorHandler({
      error: "Error occurred in updating rider details",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Rider Model"
    }
    );
  }
};

export const deleteRiderFromDB = async (rider_id:string) => {
  try {
    const riderDelete = await deleteOne(
      RIDER_TABLE_NAME,
      RIDER_ID_COLUMN,
      rider_id
    );

    
      return riderDelete;
    
    
  } catch (err) {
    return errorHandler({
      error: "Error occurred deleting rider",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Rider Model"
    }
    );
  }
};
