import { getUserTripsFromDB } from "../model/trip.model.js";
import { updateDriverOnDB, getDriverDetailOnCondition } from "../model/driver.model.js";
import { updateRiderOnDB, getRiderOnConditionFromDB } from "../model/rider.model.js";
import { ratingCountIncrease } from "../model/trip.model.js";

const tripRequestDateColumn = "trip_request_date";

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
//CALCULATE TRIPS == breaks away from camel case to match the database case
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
  
    const countIncrease = await ratingCountIncrease(tableName, dispatcher_id, idColumn, ratingCountColumn);
    if (countIncrease.error) {
      return countIncrease //error details returned
    }
    return { success: true };
  };
export const tripsCount = (trips) => {
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
  
 export const percentageDifference = (currentMonth, previousMonth) => {
        
    return +((((+currentMonth)-(+previousMonth))/(+previousMonth)) * 100).toFixed(2);

}

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
    
    return errorHandler(`Error occurred getting customer trips`, `${err}`, 500, "Trip Service");
  }
 }
 //GET DISPATHCER TRIPS
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
    
    dispatcher_id = dispatcherData[0].rider_id;
    }
    
    if (user_role === "driver") {
      dispatcherData = await getDriverDetailOnCondition(
        "user_id",
        user_id
      );

      if(dispatcherData.error) {
        return {error: dispatcherData.error}
      }
      //could be  a source of bug
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
    
    return errorHandler(`Error occurred getting dispatcher trips`, `${err}`, 500, "Trip Service: dispatcherTrips");
  }
}

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
