import crypto from 'crypto';
import { config } from 'dotenv';
import {
  ALLOWED_ADD_TRIP_PROPERTIES,
  ALLOWED_RATE_TRIP_PROPS,
  ALLOWED_UPDATE_PROPERTIES,
  ANONYMOUS_USER_PROPS,
  MONTH_ORDER
} from "../constants/tripConstants.js";
import {
  addTripToDB,
  deleteTripFromDB,
  getAllTripsFromDB,
  getCurrentMonthTripsCount,
  getOneTripFromDB,
  getTripCount,
  getTripCountByMonth,
  oneWeekTripsCount,
  searchTrips,
  tripsMonths,
  updateTripOnDB,
  revenueByMonth
} from "../model/trip.model.js";
import { getOneUserFromDB } from "../model/user.model.js";
import { errorHandler } from '../utils/errorHandler.js';
import { paginatedRequest } from '../utils/paginatedRequest.js';
import { allowedPropertiesOnly, currencyFormatter, getDayFromDate, userIsUserRole } from '../utils/util.js';
import { getOneDriverService } from "./driver.service.js";
import { getOneRiderService } from "./rider.service.js";
import {
  getCustomerTrips,
  getDispatcherId,
  increaseRatingCount,
  percentageDifference,
  updateDispatcherRating
} from "./tripServiceHelpers.js";

config({ path: '../../../.env' });



//GET ALL TRIPS
export const getAllTripsService = async (page, orderBy, orderDirection) => {
  try {
    await currentWeekTrip();
    const limit = 7;
    let offset = 0;

    page > 1 ? offset = (limit * page) - limit : page;
    
    const trips = await getAllTripsFromDB(limit,offset);
    
    if(trips.error) {
      return trips; //return with error message
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

    page > 1 ? offset = (limit * page) - limit : page;
    const searchLowerCase = search.toLowerCase();    
    const searchResults = await searchTrips(searchLowerCase, limit,offset);
    //ONLY ALLOW USERS TO SEARCH THEIR TRIPS
    //  const validSearchResults = searchResults.map(async (result)=> {
    //   return await userAssociatedWithTrip(user_id, result.trip_id, )
    //  } )
    return searchResults
    
  } catch (err) {
    
    return errorHandler("Error Occurred in getting Trips Detail", `${err}`, 500, "Get All Trips Service");
  }
};

//GET ONE TRIP

export const getOneTripService = async (trip_id, requester_user_id) => {
  
  try {

    
    //check if user is admin
    const isAdmin = await userIsUserRole(requester_user_id, "Admin");

    const tripIdColumn = "trip_id";
    let oneTrip = await getOneTripFromDB(trip_id, tripIdColumn, );
    if(oneTrip.error) {
      return {error: oneTrip.error}
    }
    
    //exclude sender and recipient phone numbers from data sent
    if(!requester_user_id || (requester_user_id !== oneTrip.customer_id && !isAdmin)) {
      oneTrip = allowedPropertiesOnly(oneTrip, ANONYMOUS_USER_PROPS) 
    
      
    }
    const { dispatcher_id, trip_medium } = oneTrip;

const dispatcherService = trip_medium === 'Motor' ?  getOneRiderService : getOneDriverService;

let dispatcherDetails = await dispatcherService(dispatcher_id);

if (dispatcherDetails.error) {
  return { ...oneTrip, dispatcher: 'Not assigned' };
}

const {
  rating_count = 0,
  cumulative_rating = "0.0",
  user_id = "",
  rider_id = "",
  driver_id = "",
  license_number = "",
  available = "",
  vehicle_id = "",
  first_name = "",
  last_name = "",
  phone_number = "",
  vehicle
} = dispatcherDetails;

dispatcherDetails = {
  rating_count,
  cumulative_rating,
  user_id,
  dispatcher_id: rider_id || driver_id,
  license_number,
   available ,
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

export const getUserTripsService = async (user_id, page) => {
  const limit = 7;
    let offset = 0;

    page > 1 ? offset = (limit * page) - limit : page;

  try {
    const userData = await getOneUserFromDB(user_id);
    
    if (userData.error ) {
      return userData;
    }

    let userTrips = [];
    const { user_role } = userData;
    
    if (user_role === "Customer" || user_role === "Admin") {
      const customerTrips = await getCustomerTrips (user_id, limit, offset);
      userTrips = customerTrips;
      return customerTrips;
      
    }
    
    if (user_role === "Driver" || user_role === "Rider") {
      
      const dispatcherTrips = await dispatcherTrips (user_role, user_id, limit, offset);
      userTrips = dispatcherTrips
      return dispatcherTrips;
      
    }
  } catch (err) {
    
    return errorHandler("Error occurred getting user trips details", `${err}`, 500, "Trip Service");
  }
};
 
//ADD TRIP
export const addTripService = async (user_id, tripDetails) => {
  try {

    
    const trip_id = crypto.randomBytes(4).toString("hex");
    const validTripDetails = allowedPropertiesOnly(tripDetails, ALLOWED_ADD_TRIP_PROPERTIES);
    
  
    
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

  try {
    const validTripDetails = allowedPropertiesOnly(
      tripDetails,
      ALLOWED_UPDATE_PROPERTIES
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
    
    const validTripDetails = allowedPropertiesOnly(ratingDetailsWithRatingStatus, ALLOWED_RATE_TRIP_PROPS);

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
    return errorHandler("Error occurred deleting trip", `${err}`, 500, "Trip Service: Delete Trip");
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
      
  
      
      monthsArray.sort((a, b) => MONTH_ORDER.indexOf(a) - MONTH_ORDER.indexOf(b));
  
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

    const revenue_with_currency = currencyFormatter.format(revenue_current_month);

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

//MONTH +ALLTIME TRIPS COUNT
export const tripsCountByMonth = async (tripDataColumn, condition, month)=> {
  try {
    
    const monthTripCount = await getTripCountByMonth(tripDataColumn, condition, month  );
    
    if(monthTripCount.error) {
      return monthTripCount;//with error details
    }
    
    const tripMonths = await getTripMonthsService();
    const tripCounts = [];
    
    
    monthTripCount.forEach(monthTripCount => {
      
      tripCounts.push(+monthTripCount.trip_count || 0)
    });
  
    //ALL TIME - IS RETURNED BY EXCPLUDING THE CONDITIONS - tripDataColumn, condition, and month

    // const sumOfCounts = (total, count) => total + +count
    // const totalCount = tripCounts.reduce(sumOfCounts, 0);
    // tripMonths.unshift('All Time')
    // tripCounts.unshift(totalCount)
    
    return {tripMonths, tripCounts}
    
  } catch (err) {
    return errorHandler('Error occurred current week trips count', `${err}`, 500, 'Trips Week Service')
  }
  
}


export const getRevenueByMonth = async ()=> {
  try {
    
    const monthsRevenue = await revenueByMonth( );
    
    if(monthsRevenue.error) {
      return monthsRevenue;//with error details
    }
    
    
    const revenue = [];
    
    const tripMonths = []
    monthsRevenue.forEach(monthRevenue => {
      
      revenue.push(+monthRevenue.revenue || 0)
      tripMonths.push(monthRevenue.month)
    });
  
    //ALL TIME - IS RETURNED BY EXCPLUDING THE CONDITIONS - tripDataColumn, condition, and month

    // const sumOfCounts = (total, count) => total + +count
    // const totalCount = tripCounts.reduce(sumOfCounts, 0);
    // tripMonths.unshift('All Time')
    // tripCounts.unshift(totalCount)
    
    return {tripMonths, revenue}
    
  } catch (err) {
    return errorHandler('Error occurred current week trips count', `${err}`, 500, 'Trips Week Service')
  }
  
}



//WEEK TRIPS
export const currentWeekTrip = async ()=> {
  try {
    
    const weekTripsCount = await oneWeekTripsCount();
    if(weekTripsCount.error) {
      return weekTripsCount;//with error details
    }
    
    const tripDates = [];
    const tripCounts = [];
    
    weekTripsCount.forEach(weekTripCount => {
      tripDates.push(weekTripCount.trip_date);
      tripCounts.push(weekTripCount.total_count)
    });
  
    const tripDays = tripDates.map(date=>getDayFromDate(date));
     tripDays[tripDays.length-1] = "Today";
     tripDays[tripDays.length-2] = "Yesterday"; 
    return {tripDays, tripCounts}
  } catch (err) {
    return errorHandler('Error occurred current week trips count', `${err}`, 500, 'Trips Week Service')
  }
  
}

