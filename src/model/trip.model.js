import { errorHandler } from "../utils/errorHandler.js";
import { increaseByValue } from "./DB/helperDbFunctions.js";
import { USER_TABLE_NAME } from "../constants/usersConstants.js";
import {TRIP_TABLE_NAME, TRIP_ID, TRIP_REQUEST_DATE_COLUMN, USER_ID_TRIP, FIRST_NAME, LAST_NAME, USER_ID_USER,} from '../constants/tripConstants.js'
import { addOne } from "./DB/addDbFunctions.js";
import {deleteOne} from "./DB/deleteDbFunctions.js"
import { selectOnCondition, getOne, getCountOnOneCondition, getSpecificDetailsUsingId } from "./DB/getDbFunctions.js";
import {updateOne} from "./DB/updateDbFunctions.js"
import {getPreviousTwoMonthsCounts, getTripsMonths, getTripsCustomersJoin, getCountByMonth, upToOneWeekTripCounts, getRevenueByMonth} from "./DB/tripsDbFunctions.js"


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
    const tripCounts = await getCountOnOneCondition(TRIP_TABLE_NAME);
    
    return tripCounts;
    
  } catch(err) {
    return errorHandler("Error occurred getting Trips Monts", `${err}`, 500, "Trips Months Trip Model")
  }
}
export const searchTrips = async(searchQuery, limit, offset)=> {
  try {
    
    const searchResults = await selectOnCondition(TRIP_TABLE_NAME, 'trip_id', searchQuery, limit, offset, true);

    return searchResults;
    
  } catch(err) {
    return errorHandler("Error occurred getting Trips Monts", `${err}`, 500, "Trips Months Trip Model")
  }
}


export const getAllTripsFromDB = async (limit, offset, orderBy = TRIP_REQUEST_DATE_COLUMN, orderDirection = 'DESC' ) => {
  try {
    
    const allTrips = await getTripsCustomersJoin(
      TRIP_TABLE_NAME,
      USER_TABLE_NAME,
      FIRST_NAME,
      LAST_NAME,
      USER_ID_USER,
      USER_ID_TRIP,
      TRIP_ID,
      limit,
      offset,
      orderBy,
      orderDirection
    ); 
    
    return allTrips; 
  } catch (err) {
    
    return errorHandler(
      "Server Error Occurred in getting all trips",
      `${err}`,
      500,
      "Trip Model: All Trips"
    );
  }
};



export const getOneTripFromDB = async (trip_id, tripIdColumn) => {
  try {
    const oneTrip = await getOne(TRIP_TABLE_NAME, tripIdColumn, trip_id);

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
  sortingColumn,
  
) => {
  try {
    const userTrips = await getSpecificDetailsUsingId(
      TRIP_TABLE_NAME,
      id,
      idColumn,
      tripFieldsToSelect,
      sortingColumn,
      
    );
    
    if ( userTrips.length === 0) {
      return errorHandler("No user Trip found", null, 404, "Trip Model: Get User Trips");
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
      TRIP_TABLE_NAME,
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
      TRIP_TABLE_NAME,
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
        TRIP_TABLE_NAME,
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
    const tripDelete = await deleteOne(TRIP_TABLE_NAME, "trip_id", trip_id);
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
//STATS
//one week recent trips count 
export const oneWeekTripsCount = async ()=> {
  try {

    const oneWeekTripsCount = await upToOneWeekTripCounts();
    return oneWeekTripsCount;
  } catch (err){
    return errorHandler(
      "Server Error Occurred in getting previous week trips count ",
      `${err}`,
      500,
      "Trip Model: One Week Trips"
    );
  }

}
export const getCurrentMonthTripsCount = async ()=> {
  try {
    

    const currentMonthTripsCount = await getPreviousTwoMonthsCounts(TRIP_TABLE_NAME, 'trip_request_date', 'trip_status', 'trip_cost', 'payment_status');
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
    return tripCount;
  } catch(err) {
    return errorHandler(
      `Server Error Occurred in retrieving ${dataColumn ? dataColumn: 'trips'} data`,
      `${err}`,
      500,
      "Trip Model: Get Trip Count By Month"
    );
  }
  
}
export const revenueByMonth = async ()=> {
  try {

    const revenue = await getRevenueByMonth();
    return revenue;
  } catch(err) {
    return errorHandler(
      `Server Error Occurred in retrieving trips revenue data`,
      `${err}`,
      500,
      "Trip Model: Get Trip Revenue By Month"
    );
  }
  
}
