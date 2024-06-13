import { errorHandler } from '../utils/errorHandler.js';
import {addTripToDB, deleteTripFromDB, getAllTripsFromDB, getOneTripFromDB, getUserTripsFromDB, ratingCouIntIncrease, updateTripOnDB } from '../model/trip.model.js';
import crypto from 'crypto'
import { getOneRiderService } from "./rider.service.js";
import { getOneUserFromDB } from "../model/user.model.js";
import {  getDriverDetailOnCondition, getSpecificDriversFromDB, updateDriverOnDB} from "../model/driver.model.js";
import { getOneDriverService } from "./driver.service.js";
import { getRiderOnConditionFromDB, getSpecificRidersFromDB, updateRiderOnDB } from "../model/rider.model.js";
import { allowedPropertiesOnly } from '../utils/util.js';
import { paginatedRequest } from '../utils/paginatedRequest.js';
import {config} from 'dotenv';

config({ path: '../../../.env' });

const DEFAULT_DISPATCHER_ID = 'ff-12-53';

export const tripFieldsToSelect = [
  "trip_id, dispatcher_id, trip_medium, trip_status, package_value, trip_area, recipient_number, sender_number, package_type, pickup_location, drop_off_location, additional_information, trip_request_date, trip_cost, payment_status, payment_method "
];
// const allowedTripStatus = ['booked', 'in progress', 'completed', 'cancelled'];
export const allowedAddTripProperties = [
  "trip_medium",
  "package_type",
  "pickup_location",
  "drop_off_location",
  "additional_information",
  "package_value", 
  "recipient_number", 
  "sender_number",
  "trip_area"
];

const tripRequestDateColumn = "trip_request_date";

export const getAllTripsService = async (limit, offset) => {
  try {
    const trips = await getAllTripsFromDB(limit,offset);
    
    if(trips.error) {
      return {error: trips.error}
    }
    if(limit && offset) {
      return await paginatedRequest(getAllTripsFromDB, trips, offset, limit, "trips")
    }
    return trips;
  } catch (err) {
    
    return errorHandler("Error Occurred in getting Trips Detail", err, 500, "Get All Trips Service");
  }
};

export const getOneTripService = async (trip_id) => {
  
  try {
    const tripIdColumn = "trip_id";
    const oneTrip = await getOneTripFromDB(trip_id, tripIdColumn);
    
    if(oneTrip.error) {
      return {error: oneTrip.error}
    }
    const {dispatcher_id, trip_medium} = oneTrip;
    let dispatcherDetails = {}
      trip_medium == 'Motor' ? dispatcherDetails = await getOneRiderService(dispatcher_id) : dispatcherDetails = await getOneDriverService(dispatcher_id);
      
      if (dispatcherDetails.error) {
        
        return {...oneTrip, dispatcher: 'Not assigned'}
      }
    
    return {...oneTrip, dispatcher: dispatcherDetails};
  } catch (err) {
    return errorHandler("Error Occurred in getting One Trip Detail", err, 500, "Trip Service");
  }
};

export const getUserTripsService = async (user_id) => {
  
  try {
    const userData = await getOneUserFromDB(user_id);
    
    if (userData.error ) {
      return {error: userData.error};
    }
    const { user_role } = userData;
    
    if (user_role === "customer" || user_role === "admin") {
      const allCustomerTrips = await getCustomerTrips (user_id);
      if(allCustomerTrips.error) {
        return {error: allCustomerTrips.error}
      }
      return allCustomerTrips;
      
    }
    
    if (user_role === "driver" || user_role === "rider") {
      
      const allDispatcherTrips = await dispatcherTrips (user_role, user_id);
      if (allDispatcherTrips.error) {
        return {error: allDispatcherTrips.error}
      }
      return allDispatcherTrips;
      
    }
  } catch (err) {
    
    return errorHandler("Error occurred getting user trips details", err, 500, "Trip Service");
  }
};
 //CUSTOMER TRIPS (HELPER FUNCTION)
 export const getCustomerTrips = async (user_id) => {
  const idColumn = "customer_id";
  try {

    const trips = await getUserTripsFromDB(
      user_id,
      idColumn,
      tripFieldsToSelect, 
      tripRequestDateColumn,
    );
    
    if(trips.error) {
      return {error: trips.error}
    }
    
    if(trips.length > 0) {
      const {total_trip_count, delivered_trips, cancelled_trips, current_trips, total_payment} =  tripsCount(trips)
      return {customer_trips: trips, total_trip_count, delivered_trips, cancelled_trips, current_trips, total_payment}
    }

    return trips;
  } catch (err) {
    console.log(err)
    return errorHandler(`Error occurred getting customer trips`, err, 500, "Trip Service");
  }
 }
 //DISPATCHER TRIPS (HELPER FUNCTION)
 export const dispatcherTrips = async (user_role, user_id)=> {
  try {
    const tripFieldsToSelect = [
      "trip_id, trip_medium, trip_status, trip_stage, recipient_number, sender_number,payment_status, trip_type, pickup_location, drop_off_location, package_type, trip_commencement_date, trip_completion_date, trip_cost, trip_request_date, payment_method",
    ];
    
    //dispatcher is used to represent drivers and riders except user role
    
    let dispatcherData = {};
    let dispatcher_id = '';
    if (user_role === 'rider'){
    dispatcherData = await getRiderOnConditionFromDB("user_id", user_id );
    if(dispatcherData.error) {
      return {error: dispatcherData.error}
    }
    const returnedDispatcherData = dispatcherData.rows[0];
    dispatcher_id = returnedDispatcherData.rider_id;
    }
    
    if (user_role === "driver") {
      dispatcherData = await getDriverDetailOnCondition(
        "user_id",
        user_id
      );

      if(dispatcherData.error) {
        return {error: dispatcherData.error}
      }
      
      dispatcher_id = dispatcherData[0].driver_id;
    }
    

    const idColumn = "dispatcher_id"; //this is because dispatcher is used to represent rider and driver in the trips table
    const dispatcherTrips = await getUserTripsFromDB(
      dispatcher_id,
      idColumn,
      tripFieldsToSelect
    );
    
    if(dispatcherTrips.length > 0) {

      const {total_trip_count, delivered_trips, cancelled_trips, current_trips, total_earnings} =  tripsCount(dispatcherTrips)
      return { dispatcher_trips: dispatcherTrips,  total_trip_count,  delivered_trips,  cancelled_trips,  current_trips, total_earnings}
    }
    return dispatcherTrips;
  } catch (err) {
    
    return errorHandler(`Error occurred getting dispatcher trips`, err, 500, "Trip Service");
  }
}
//CALCULATE TRIPS == breaks away from camel case to match the database case
const tripsCount = (trips) => {
  let total_earnings = 0;
  let total_payment = 0;
  let delivered_trips = 0;
  let current_trips = 0;
  let cancelled_trips = 0;

  trips.forEach(trip => {
    if (trip.trip_status === "Delivered") {
      total_earnings += Math.ceil(trip.trip_cost * 0.8);
      delivered_trips++;
    } else if (trip.trip_status === "Cancelled") {
      cancelled_trips++;
    } else {
      current_trips++;
    }
    if (trip.payment_status) {
      total_payment += Math.ceil(trip.trip_cost);
    }
  });

  const total_trip_count = trips.length;

  return {
    total_trip_count,
    delivered_trips,
    cancelled_trips,
    current_trips,
    total_earnings,
    total_payment
  };
}
//ADDING TRIPS
export const addTripService = async (user_id, tripDetails) => {
  try {
    const trip_id = crypto.randomBytes(4).toString("hex");
    const validTripDetails = allowedPropertiesOnly(tripDetails, allowedAddTripProperties);
    

    const trip_cost = 85 - 45; // current destination - delivery destination
    const dispatcher_id = await getDispatcherId(tripDetails.trip_medium);

    const tripStatusDetails = {
      trip_status: "Booked",
      trip_request_date: "now()",
      dispatcher_id,
      trip_cost: trip_cost,
      payment_status: false,
      payment_method: "Cash on Delivery",
    };

    const finalTripDetails = {
      trip_id,
      customer_id: user_id,
      ...validTripDetails,
      ...tripStatusDetails,
    };
    console.log({finalTripDetails})
    const newTrip = await addTripToDB(finalTripDetails);
    

    return newTrip;
  } catch (err) {
    return errorHandler(`Server Error [service] Occurred adding trip`, err, 500, "Trip Service");
  }
};

export const getDispatcherId = async (trip_medium) => {
  let dispatcher_id = DEFAULT_DISPATCHER_ID;

  if (trip_medium === "car" || trip_medium === "truck") {
    const availableDrivers = await getSpecificDriversFromDB("driver_availability", "Available");
    if (availableDrivers && availableDrivers.length > 0) {
      dispatcher_id = availableDrivers[0].driver_id;
    }
  }

  if (trip_medium === "motor") {
    const availableRiders = await getSpecificRidersFromDB("rider_availability", "Available");
    if (availableRiders && availableRiders.length > 0) {
      dispatcher_id = availableRiders[0].rider_id;
    }
  }

  return dispatcher_id;
};

export const updateTripService = async (tripDetails) => {
  const allowedProperties = [
    "trip_id",
    "trip_medium",
    "trip_status",
    "trip_type",
    "package_type",
    "package_value",
    "pickup_location",
    "drop_off_location",
    "additional_information",
    "trip_commencement_date",
    "trip_completion_date",
    "payment_status",
    "payment_method",
    "dispatcher_id",
    "recipient_number",
    "sender_number",
    "trip_stage",
    "trip_area"
  ];

  try {
    const validTripDetails = allowedPropertiesOnly(
      tripDetails,
      allowedProperties
    );
    console.log({validTripDetails})

    const tripUpdate = await updateTripOnDB(validTripDetails);
    
      return tripUpdate;
    
  } catch (err) {
    return errorHandler(`Server Error Occurred updating trip`, err, 500, "Trip Service");
  }
};

export const rateTripService = async (ratingDetails) => {
  try {
    const ratingDetailsWithRatingStatus = { ...ratingDetails, rated: true };
    const allowedProperties = ["dispatcher_rating", "trip_id", "dispatcher_id", "rated"];
    const validTripDetails = allowedPropertiesOnly(ratingDetailsWithRatingStatus, allowedProperties);

    const { trip_id, dispatcher_id } = validTripDetails;
    const updateTrip = await updateTripOnDB(validTripDetails);
    if (updateTrip.error) {
      return updateTrip //Error details returned
    }

    const tripMedium = await tripModel.getSpecificDetailsUsingId(trip_id, "trip_id", "trip_medium");
    const cumulativeDispatcherRating = await tripModel.getSpecificDetailsUsingId(dispatcher_id, "dispatcher_id", "AVG(dispatcher_rating)");
    const averageDispatcherRating = cumulativeDispatcherRating[0].avg;
    const { trip_medium } = tripMedium[0];

    const ratingUpdate = await updateDispatcherRating(trip_medium, dispatcher_id, averageDispatcherRating);
    if (ratingUpdate.error) {
      return ratingUpdate //error details returned
    }

    const ratingCountUpdate = await increaseRatingCount(trip_medium, dispatcher_id);
    if (ratingCountUpdate.error) {
      return ratingCountUpdate //error details included
    }

    return { success: "trip updated with rating" };
  } catch (err) {
    return errorHandler(`Server Error Occurred Adding Rating: ${err}`, err, 500, "Trip Service");
  }
};

//UPDATE DISPATCHER RATING (HELPER FUNCTION)
export const updateDispatcherRating = async (trip_medium, dispatcher_id, averageDispatcherRating) => {
  if (trip_medium === "motor") {
    const riderUpdate = await updateRiderOnDB({ cumulative_rider_rating: averageDispatcherRating, rider_id: dispatcher_id });
    if (riderUpdate.error) {
      return riderUpdate //Error details returned
    }
  } else if (trip_medium === "car" || trip_medium === "truck") {
    const driverUpdate = await updateDriverOnDB({ cumulative_driver_rating: averageDispatcherRating, driver_id: dispatcher_id });
    if (driverUpdate.error) {
      return driverUpdate //Error details returned
    }
  }
  return { success: true };
};

//INCREASE RATING COUNT (HELPER FUNCTION)
export const increaseRatingCount = async (trip_medium, dispatcher_id) => {
  let tableName, idColumn, ratingCountColumn;
  if (trip_medium === "motor") {
    tableName = 'rider';
    idColumn = 'rider_id';
    ratingCountColumn = 'rider_rating_count';
  } else if (trip_medium === "car" || trip_medium === "truck") {
    tableName = 'driver';
    idColumn = 'driver_id';
    ratingCountColumn = 'driver_rating_count';
  } else {
    return errorHandler("Error occurred", "Invalid trip medium", 400, "service");
  }

  const countIncrease = await ratingCouIntIncrease(tableName, dispatcher_id, idColumn, ratingCountColumn);
  if (countIncrease.error) {
    return countIncrease //error details returned
  }
  return { success: true };
};

export const deleteTripService = async (trip_id) => {
  try {
    const tripDelete = await deleteTripFromDB(trip_id);
    
    return tripDelete;
  } catch (err) {
    return errorHandler("Error occurred deleting trip", err, 500, "Trip Service");
  }
};
