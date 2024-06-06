import { errorHandler } from "../utils/errorHandler.js";
import {
  addOne,
  deleteOne,
  getTripsCustomersJoin,
  getAllDateSort,
  getOne,
  getSpecificDetailsUsingId,
  increaseByValue,
  updateOne,
} from "./dBFunctions.js";

const tripTableName = "trips";
const tripId = "trips.trip_id";
const tripRequestDateColumn = "trips.trip_request_date";
const usersTable = "users";
const firstName = "users.first_name";
const lastName = "users.last_name";
const userIdUser = "users.user_id";
const userIdTrip = "trips.customer_id";

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
      err,
      500,
      "Trip Model"
    );
  }
};

export const getOneTripFromDB = async (trip_id, tripIdColumn) => {
  try {
    const oneTrip = await getOne(tripTableName, tripIdColumn, trip_id);

    if (oneTrip.error) {
      return oneTrip //Error message returned
    }
    return oneTrip[0];
  } catch (err) {
    return errorHandler(
      "Server Error Occurred in getting data from Database",
      err,
      500,
      "Trip Model"
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
      "Trip Model"
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
      "Trip Model"
    );
  }
};

export const addTripToDB = async (tripDetails) => {
  try {
    console.log(tripDetails)
    const tripFieldsToSelect = Object.keys(tripDetails).join(", ");
    const tripDetailsValues = Object.values(tripDetails);
    const newTrip = await addOne(
      tripTableName,
      tripFieldsToSelect,
      tripDetailsValues
    );
    if (newTrip.error) {
      return newTrip //Error message returned
    }
    return newTrip[0];
  } catch (err) {
    return errorHandler(
      "Server Error Occurred in adding trip to DB",
      err,
      500,
      "Trip Model"
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
      "Trip Model"
    );
  }
};

export const deleteTripFromDB = async (trip_id) => {
  try {
    const tripDelete = await deleteOne(
      tripTableName,
      tripFieldsToSelectForAdding[0],
      trip_id
    );
    return tripDelete;
    
  } catch (err) {
    return errorHandler(
      "Error Occurred Deleting Rider",
      err,
      500,
      "Trip Model"
    );
  }
};

export const ratingCouIntIncrease = async (
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
      "Trip Model"
    );
  }
};
