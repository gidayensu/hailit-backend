import crypto from 'crypto';
import { config } from 'dotenv';
import {
  addTripToDB,
  deleteTripFromDB,
  getAllTripsFromDB,
  getCurrentMonthTripsCount,
  getOneTripFromDB,
  getTripCount,
  searchTrips,
  tripsMonths,
  updateTripOnDB,
} from "../model/trip.model.js";
import { getOneUserFromDB } from "../model/user.model.js";
import { errorHandler } from '../utils/errorHandler.js';
import { paginatedRequest } from '../utils/paginatedRequest.js';
import { allowedPropertiesOnly, currencyFormatter } from '../utils/util.js';
import { getOneDriverService } from "./driver.service.js";
import { getOneRiderService } from "./rider.service.js";
import {
  allowedAddTripProperties,
  dispatcherTrips,
  getCustomerTrips,
  getDispatcherId,
  increaseRatingCount,
  percentageDifference,
  updateDispatcherRating
} from "./tripServiceHelpers.js";

config({ path: '../../../.env' });

const DEFAULT_DISPATCHER_ID = 'ff-12-53';


//GET ALL TRIPS
export const getAllTripsService = async (page) => {
  try {
    
    const limit = 7;
    let offset = 0;

    page > 1 ? offset = limit * page : page;
    
    const trips = await getAllTripsFromDB(limit,offset);
    
    if(trips.error) {
      return {error: trips.error}
    }
    const totalCount = await getTripCount();
    
    return await paginatedRequest(totalCount, trips, offset, limit, "trips")
    
  } catch (err) {
    
    return errorHandler("Error Occurred in getting Trips Detail", `${err}`, 500, "Get All Trips Service");
  }
};

//SEARCH TRIPS
export const searchTripService = async (search, page) => {
  try {
    
    const limit = 7;
    let offset = 0;

    page > 1 ? offset = limit * page : page;
    const searchLowerCase = search.toLowerCase();    
    const searchResults = await searchTrips(searchLowerCase, limit,offset);
        
    return searchResults
    
  } catch (err) {
    
    return errorHandler("Error Occurred in getting Trips Detail", `${err}`, 500, "Get All Trips Service");
  }
};

//GET ONE TRIP
export const getOneTripService = async (trip_id) => {
  
  try {
    const tripIdColumn = "trip_id";
    const oneTrip = await getOneTripFromDB(trip_id, tripIdColumn);
    
    if(oneTrip.error) {
      return {error: oneTrip.error}
    }
    const { dispatcher_id, trip_medium } = oneTrip;

const dispatcherService = trip_medium === 'Motor' ?  getOneRiderService : getOneDriverService;

let dispatcherDetails = await dispatcherService(dispatcher_id);

if (dispatcherDetails.error) {
  return { ...oneTrip, dispatcher: 'Not assigned' };
}

const {
  rider_rating_count = 0,
  cumulative_rider_rating = "0.0",
  driver_rating_count = 0,
  cumulative_driver_rating = "0.0",
  user_id = "",
  rider_id = "",
  driver_id = "",
  license_number = "",
  rider_availability = "",
  driver_availability = "",
  vehicle_id = "",
  first_name = "",
  last_name = "",
  phone_number = "",
  vehicle
} = dispatcherDetails;

dispatcherDetails = {
  rating_count: rider_rating_count || driver_rating_count,
  cumulative_rating: cumulative_rider_rating || cumulative_driver_rating,
  user_id,
  dispatcher_id: rider_id || driver_id,
  license_number,
  availability: rider_availability || driver_availability,
  vehicle_id,
  first_name,
  last_name,
  phone_number,
  vehicle
};

return { ...oneTrip, dispatcher: dispatcherDetails };

  } catch (err) {
    return errorHandler("Error Occurred in getting One Trip Detail", `${err}`, 500, "Trip Service");
  }
};


// GET USER TRIPS

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
      
      return allDispatcherTrips;
      
    }
  } catch (err) {
    
    return errorHandler("Error occurred getting user trips details", `${err}`, 500, "Trip Service");
  }
};
 
//ADD TRIP
export const addTripService = async (user_id, tripDetails) => {
  try {
    const trip_id = crypto.randomBytes(4).toString("hex");
    const validTripDetails = allowedPropertiesOnly(tripDetails, allowedAddTripProperties);
    

    const trip_cost = 85 - 45; // current destination - delivery destination [CHANGE TO LOCATION BASED CALCULATION]
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
    
    const newTrip = await addTripToDB(finalTripDetails);
    

    return newTrip;
  } catch (err) {
    return errorHandler(`Server Error  Occurred adding trip`, `${err}`, 500, "Trip Service");
  }
};



//UPDATE TRIP
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
    

    const tripUpdate = await updateTripOnDB(validTripDetails);
    
      return tripUpdate;
    
  } catch (err) {
    return errorHandler(`Server Error Occurred updating trip`, `${err}`, 500, "Trip Service");
  }
};

//RATE TRIP
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
    return errorHandler(`Server Error Occurred Adding Rating: ${err}`, `${err}`, 500, "Trip Service");
  }
};


//DELETE TRIP

export const deleteTripService = async (trip_id) => {
  try {
    const tripDelete = await deleteTripFromDB(trip_id);
    
    return tripDelete;
  } catch (err) {
    return errorHandler("Error occurred deleting trip", `${err}`, 500, "Trip Service");
  }
};



//STATS - GET TRIPS MONTHS
export const getTripMonthsService = async ()=> {
  try {
    const tripMonthsData = await tripsMonths();
    if(tripMonthsData.error) {
      return tripMonthsData; //error message returned
    }
    const monthsArray = tripMonthsData.map(tripsMonth=>tripsMonth.month)
      const monthOrder = [
        'January', 'February', 'March', 'April', 'May', 'June', 
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
  
      
      monthsArray.sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
  
      return monthsArray;
  }
  catch (err) {
    return errorHandler('Error occurred getting trips months', `${err}`, 500, 'Trips Months Service')
  }
}

//STATS - CURRENT MONTH TRIPS COUNTS
export const currentMonthTripsCountService = async ()=> {
  try {
      const currentMonthTripsCount = await getCurrentMonthTripsCount();
      console.log({currentMonthTripsCount})
    const {
      total_trips_current_month,
      delivered_current_month,
      cancelled_current_month,
      revenue_current_month,
      total_trips_previous_month,
      delivered_previous_month,
      cancelled_previous_month,
      revenue_previous_month,
    } = currentMonthTripsCount;
  
    //_percentage_difference = PercentageDifference
    
    const pending_current_month = (+total_trips_current_month) - (+delivered_current_month + (+cancelled_current_month));
    const pending_previous_month = (+total_trips_previous_month) - (+delivered_previous_month + (+cancelled_previous_month));
    const pending_percentage_difference = percentageDifference(+pending_current_month, +pending_previous_month);
    
    const delivered_percentage_difference = percentageDifference(+delivered_current_month, +delivered_previous_month);
    const total_trips_percentage_difference = percentageDifference(total_trips_current_month, total_trips_previous_month)
    const revenue_percentage_difference = percentageDifference(+revenue_current_month, +revenue_previous_month);
    const cancelled_percentage_difference = percentageDifference(cancelled_current_month, cancelled_previous_month)

    const revenue_with_currency = currencyFormatter.format(revenue_current_month)
    return {
      total_trips_current_month,
      revenue_current_month: revenue_with_currency,
      cancelled_current_month,
      delivered_current_month,
      pending_current_month,
      delivered_percentage_difference,
      revenue_percentage_difference,
      pending_percentage_difference,
      total_trips_percentage_difference,
      cancelled_percentage_difference,
    };
  
  }
  catch (err) {
    return errorHandler('Error occurred getting trips months', `${err}`, 500, 'Trips Months Service')
  }
}
