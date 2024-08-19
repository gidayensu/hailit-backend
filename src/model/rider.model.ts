import { v4 as uuid } from "uuid";

//constants
import {
  DEFAULT_VEHICLE_ID,
  RIDER_COLUMNS_FOR_ADDING,
  RIDER_ID_COLUMN,
  RIDER_TABLE_NAME
} from "../constants/riderConstants";
import { USER_ID_COLUMN } from "../constants/usersConstants";

//helpers
import { ErrorResponse, handleError } from "../utils/handleError";

//DB functions
import { addOne } from "./DB/addDbFunctions";
import { deleteOne } from "./DB/deleteDbFunctions";
import {
  getOne,
  getSpecificDetails
} from "./DB/getDbFunctions";
import { updateOne } from "./DB/updateDbFunctions";
import { getDispatcherCount, getDispatchersVehicleJoin } from "./DB/usersDbFunctions";

//types
import { RiderDetails, UpdateRiderDetails } from "../types/dispatcher.types";
import { GetAllFromDB } from "../types/getAll.types";
import { isErrorResponse } from "../utils/util";
import { detailExists } from "./DB/helperDbFunctions";

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
    if (isErrorResponse(allRiders)) {
      return handleError({
        error: allRiders.error,
        errorMessage: "",
        errorCode: 500,
        errorSource: "All Riders Model",
      });
    }
    return allRiders;
  } catch (err) {
    return handleError({
      error: "Server error occurred getting all riders",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "All Riders Model",
    });
  }
};

export const getRidersCount = async(search?:string)=> {
  try {
    const ridersCount = await getDispatcherCount({
      search,
      dispatcherRole: "Rider",
    });
    
    return ridersCount;
    
  } catch(err) {
    return handleError({
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
    
    const riderData: RiderDetails[] | ErrorResponse = await getOne({
      tableName: RIDER_TABLE_NAME,
      columnName: RIDER_ID_COLUMN,
      condition: rider_id,
    });
    if (isErrorResponse(riderData)) {
      return riderData;
    }
    const rider:RiderDetails = riderData[0]
    return rider;
  } catch (err) {
    return handleError({
      error: "Error occurred. Rider not fetched",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Rider Model"
    }
    ); 
  }
};

export const getRiderOnConditionFromDB = async ({columnName, condition}: {columnName: string; condition: string}) => {
  try {
    const riderDetails: RiderDetails[] | ErrorResponse = await getOne(
      {tableName: RIDER_TABLE_NAME,
      columnName,
      condition}
    );
    if(isErrorResponse(riderDetails)) {
      return riderDetails
    }
    return riderDetails[0];
  } catch (err) {
    return handleError({
      error: "Error occurred getting rider",
      errorMessage: "",
      errorCode: 404,
      errorSource: "Rider Model: Rider on Condition"
    }
    );
  }
};

export const getSpecificRidersFromDB = async ({specificColumn, condition}: {specificColumn:string, condition:boolean}) => {
  try {
    const specificRiders = await getSpecificDetails({
      tableName: RIDER_TABLE_NAME,
      specificColumn,
      condition,
    });
    return specificRiders;
  } catch (err) {
    return handleError({
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
    const userIsRider = await detailExists({
      tableName: RIDER_TABLE_NAME,
      detail: user_id,
      columnName: USER_ID_COLUMN,
      
    });
    if(isErrorResponse(userIsRider)) {
      return userIsRider;
    }
    if (userIsRider) {
      return handleError({
        error: "User is rider",
        errorMessage: "User already exists",
        errorCode: 400,
        errorSource: "Rider Model"
      }
      );
    }
    const rider_id = uuid();
    const riderDetails = [rider_id, DEFAULT_VEHICLE_ID, user_id];
    const addingRider = await addOne({
      tableName: RIDER_TABLE_NAME,
      columns: RIDER_COLUMNS_FOR_ADDING,
      values: riderDetails,
    });
    
      return addingRider;
    
  } catch (err) {
    return handleError({
      error: "Error occurred adding rider",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Rider Model"
    }
    );
  }
};

export const updateRiderOnDB = async (riderDetails:UpdateRiderDetails) => {
  const { rider_id } = riderDetails;
  
  const riderColumns = Object.keys(riderDetails);
  const riderDetailsArray: string[] = Object.values(riderDetails);

  try {
    const riderUpdate = await updateOne({
      tableName: RIDER_TABLE_NAME,
      columns: riderColumns,
      id: rider_id,
      idColumn: RIDER_ID_COLUMN,
      details: riderDetailsArray,
    });

    if (isErrorResponse (riderUpdate)) {
      return riderUpdate //error details returned
    }
    if (riderUpdate.rowCount === 0) {
      return handleError({
        error: "Rider details not updated",
        errorMessage: "Rider detail not found",
        errorCode: 400,
        errorSource: "Rider Model"
      }
      );
    }
    const updatedRider: RiderDetails | ErrorResponse = riderUpdate.rows[0];
    return updatedRider;
  } catch (err) {
    return handleError({
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
    const riderDelete = await deleteOne({
      tableName: RIDER_TABLE_NAME,
      columnName: RIDER_ID_COLUMN,
      id: rider_id,
    });

    
      return riderDelete;
    
    
  } catch (err) {
    return handleError({
      error: "Error occurred deleting rider",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Rider Model"
    }
    );
  }
};
