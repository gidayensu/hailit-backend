import { errorHandler } from "../utils/errorHandler.js";
import { increaseByValue } from "./DB/helperDbFunctions.js";

import { addOne } from "./DB/addDbFunctions.js";
import {deleteOne} from "./DB/deleteDbFunctions.js"
import { selectOnCondition, getOne, getCountOnOneCondition, getSpecificDetailsUsingId } from "./DB/getDbFunctions.js";
import {updateOne} from "./DB/updateDbFunctions.js"
import {getPreviousTwoMonthsCounts, getTripsMonths, getTripsCustomersJoin, getCountByMonth} from "./DB/tripsDbFunctions.js"


const tripTableName = "trips";
const tripId = "trips.trip_id";
const tripRequestDateColumn = "trips.trip_request_date";
const usersTable = "users";
const firstName = "users.first_name";
const lastName = "users.last_name";
const userIdUser = "users.user_id";
const userIdTrip = "trips.customer_id";

export const tripsMonths = async()=> {
  try {
    const tripMonthsData = await getTripsMonths();
    
    return tripMonthsData;
    
  } catch(err) {
    return errorHandler("Error occurred getting Trips Monts", `${err}`, 500, "Trips Months Trip Model")
  }
}


export const getTripCount = async()=> {
  try {
    const tripCounts = await getCountOnOneCondition(tripTableName);
    
    return tripCounts;
    
  } catch(err) {
    return errorHandler("Error occurred getting Trips Monts", `${err}`, 500, "Trips Months Trip Model")
  }
}
export const searchTrips = async(searchQuery, limit, offset)=> {
  try {
    
    const searchResults = await selectOnCondition(tripTableName, 'trip_id', searchQuery, limit, offset, true);

    return searchResults;
    
  } catch(err) {
    return errorHandler("Error occurred getting Trips Monts", `${err}`, 500, "Trips Months Trip Model")
  }
}



export const getAllTripsFromDB = async (limit, offset) => {
  try {
    
    const allTrips = await getTripsCustomersJoin(
      tripTableName,
      usersTable,
      firstName,
      lastName,
      userIdUser,
      userIdTrip,
      tripId,
      limit,
      offset,
      tripRequestDateColumn
    );
    
    return allTrips;
  } catch (err) {
    
    return errorHandler(
      "Server Error Occurred in getting all trips from database at the model level",
      `${err}`,
      500,
      "Trip Model"
    );
  }
};

export const getCurrentMonthTripsCount = async ()=> {
  try {

    const currentMonthTripsCount = await getPreviousTwoMonthsCounts(tripTableName, 'trip_request_date', 'trip_status', 'trip_cost', 'payment_status');
    return currentMonthTripsCount;
  } catch (err) {

    return errorHandler(
      `Server Error Occurred in retrieving current month trips count`,
      `${err}`,
      500,
      "Trip Model: get current months trips count"
    );
  }
  
  
}

export const getTripCountByMonth = async (dataColumn, condition, month)=> {
  try {

    const tripCount = await getCountByMonth(dataColumn, condition, month);
    
  } catch(err) {
    return errorHandler(
      `Server Error Occurred in retrieving ${dataColumn} data`,
      `${err}`,
      500,
      "Trip Model: Get Trip Count By Month"
    );
  }
  
}

export const getOneTripFromDB = async (trip_id, tripIdColumn) => {
  try {
    const oneTrip = await getOne(tripTableName, tripIdColumn, trip_id);

    if (oneTrip.error) {
      return oneTrip //Error details returned
    }
    return oneTrip[0];
  } catch (err) {
    return errorHandler(
      "Server Error Occurred in getting data from Database",
      err,
      500,
      "Trip Model: Get One Trip"
    );
  }
};

export const getUserTripsFromDB = async (
  id,
  idColumn,
  tripFieldsToSelect,
  sortingColumn
) => {
  try {
    const userTrips = await getSpecificDetailsUsingId(
      tripTableName,
      id,
      idColumn,
      tripFieldsToSelect,
      sortingColumn
    );
    
    if ( userTrips.length === 0) {
      return errorHandler("No user Trip found", null, null, "Trip Model");
    }
    return userTrips;
  } catch (err) {
    return errorHandler(
      "Server Error Occurred in getting user Trips from DB",
      err,
      500,
      "Trip Model: Get User Trips From DB"
    );
  }
};

export const getSpecificTripDetailsUsingIdFromDB = async (
  user_id,
  idColumn,
  returningColumn
) => {
  try {
    const specificTripDetail = await getSpecificDetailsUsingId(
      tripTableName,
      user_id,
      idColumn,
      returningColumn
    );
    
    return specificTripDetail;
  } catch (err) {
    return errorHandler(
      "Server Error Occurred in getting specific trip from DB",
      err,
      500,
      "Trip Model: Get Specifc Trip Detail Using ID"
    );
  }
};

export const addTripToDB = async (tripDetails) => {
  try {    
    const tripFieldsToSelect = Object.keys(tripDetails).join(", ");
    const tripDetailsValues = Object.values(tripDetails);
    const newTrip = await addOne(
      tripTableName,
      tripFieldsToSelect,
      tripDetailsValues
    );
    if (newTrip.error) {
      return newTrip //Error details returned
    }
    return newTrip[0];
  } catch (err) {
    return errorHandler(
      "Server Error Occurred in adding trip to DB",
      err,
      500,
      "Trip Model: Add Trip"
    );
  }
};

export const updateTripOnDB = async (tripDetails) => {
  try {
    const { trip_id } = tripDetails;
    const tripIdColumn = "trip_id";
    const tableColumns = Object.keys(tripDetails);
    const tripDetailsArray = Object.values(tripDetails);

    try {
      const tripUpdate = await updateOne(
        tripTableName,
        tableColumns,
        trip_id,
        tripIdColumn,
        ...tripDetailsArray
      );
      const updatedTrip = tripUpdate.rows[0];

      return updatedTrip;
    } catch (err) {
      return errorHandler(
        "Error occurred in updating rider details",
        err,
        500,
        "Trip Model"
      );
    }
  } catch (err) {
    return errorHandler(
      "Server Error Occurred updating trip details on DB",
      err,
      500,
      "Trip Model: Update Trip"
    );
  }
};

export const deleteTripFromDB = async (trip_id) => {
  try {
    const tripDelete = await deleteOne(tripTableName, "trip_id", trip_id);
    return tripDelete;
    
  } catch (err) {
    return errorHandler(
      "Error Occurred Deleting Trip",
      err,
      500,
      "Trip Model: delete Trip"
    );
  }
};

export const ratingCountIncrease = async (
  tableName,
  dispatcher_id,
  idColumn,
  columnToBeIncreased
) => {
  const increaseDispatcherRateCount = await increaseByValue(
    tableName,
    dispatcher_id,
    idColumn,
    columnToBeIncreased
  );
  

  return increaseDispatcherRateCount;
};

export const associatedWithTrip = async (trip_id, roleIdColumn) => {
  const tripIdColumn = "trip_id";

  try {
    const tripData = await getSpecificDetailsUsingId(
      trip_id,
      tripIdColumn,
      roleIdColumn
    );

    
    return tripData;
    
  } catch (err) {
    return errorHandler(
      "Error occurred while confirming user's relation to trip",
      err,
      500,
      "Trip Model: Associated With Trip"
    );
  }
};
