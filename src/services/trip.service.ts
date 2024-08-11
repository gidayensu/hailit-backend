
import crypto from "crypto";
import { config } from "dotenv";
import { DEFAULT_LIMIT } from "../constants/sharedConstants";
import {
  ALLOWED_RATE_TRIP_PROPS,
  ALLOWED_UPDATE_PROPERTIES,
  ANONYMOUS_USER_PROPS,
  MONTH_ORDER,
  NO_LOCATION_PROPS,
  TRIP_ID_COLUMN,
} from "../constants/tripConstants";
import {
  addTripToDB,
  deleteTripFromDB,
  getAllTripsFromDB,
  getCurrentMonthTripsCount,
  getIDsAndMediumFromDb,
  getOneTripFromDB,
  getSpecificTripDetailsUsingId,
  getTripCount,
  getTripCountByMonth,
  oneWeekTripsCount,
  revenueByMonth,
  searchTrips,
  tripsMonths,
  updateTripOnDB
} from "../model/trip.model";
import { getOneUserFromDB } from "../model/user.model";
import { errorHandler } from "../utils/errorHandler";
import {
  allowedPropertiesOnly,
  currencyFormatter,
  getDayFromDate,
  userIsUserRole
} from "../utils/util";
import { getAllEntitiesService } from "./helpers.service";
import {
  dispatcherTrips,
  getCustomerTrips,
  getDispatcherDetails,
  getDispatcherId,
  increaseRatingCount,
  percentageDifference,
  sortByCalendarMonths,
  tripsRealTimeUpdate,

  updateDispatcherRating
} from "./tripServiceHelpers";
import { getOneUserService } from "./user.service";
import { GetAll } from "../types/getAll.types";
config({ path: "../../../.env" });

//GET ALL TRIPS
export const getAllTripsService = async (
  {page,
  limit = DEFAULT_LIMIT,
  sortColumn,
  sortDirection,
  search}:GetAll
) => {
  try {
    const trips = await getAllEntitiesService(
      {page,
      limit,
      sortColumn,
      sortDirection,
      search,
      getAllEntitiesFromDB: getAllTripsFromDB,
      getCount: getTripCount,
      entityName: "trips"}
    );

    return trips;
    
  } catch (err) {
    return errorHandler(
      {
        error: "Error occurred in getting trips detail",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Get All Trips Service"
      }
      
    );
  }
};

//SEARCH TRIPS
export const searchTripService = async (search, page, limit = DEFAULT_LIMIT) => {
  try {
    
    let offset = 0;

    page > 1 ? (offset = limit * page - limit) : page;
    const searchLowerCase = search.toLowerCase();
    const searchResults = await searchTrips(searchLowerCase, limit, offset);

    return searchResults;
  } catch (err) {
    return errorHandler(
      "Error Occurred in getting Trips Detail",
      `${err}`,
      500,
      "Get All Trips Service"
    );
  }
};

//GET ONE TRIP

export const getOneTripService = async (trip_id, requester_user_id) => {
  try {
    //check if user is admin
    const isAdmin = await userIsUserRole({userId:requester_user_id, userRole:"Admin"});

    let oneTrip =  await getOneTripFromDB(trip_id, TRIP_ID_COLUMN);
    if (oneTrip.error) {
      return { error: oneTrip.error };
    }

    //exclude sender and recipient phone numbers from data sent
    if (!requester_user_id ||  (requester_user_id !== oneTrip.customer_id && !isAdmin) ) {
      oneTrip = allowedPropertiesOnly({data:oneTrip, allowedProperties:ANONYMOUS_USER_PROPS});
    }
    const { dispatcher_id, trip_medium } = oneTrip;
    const dispatcherDetails = await getDispatcherDetails({dispatcher_id, trip_medium})
      
    if (dispatcherDetails.error) {
      return { ...oneTrip, dispatcher: "Not assigned" };
    }

    
    return { ...oneTrip, dispatcher: dispatcherDetails };
  } catch (err) {
    return errorHandler(
      {
        error: "Error occurred in getting one trip detail",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Trip Service: One trip"
      }
      
    );
  }
};

// GET USER TRIPS

export const getUserTripsService = async (user_id) => {
  try {
    const userData = await getOneUserFromDB(user_id);

    if (userData.error) {
      return userData;
    }

    const { user_role } = userData;

    if (user_role === "Customer" || user_role === "Admin") {
      const customerTrips = await getCustomerTrips(user_id);

      return customerTrips;
    }

    if (user_role === "Driver" || user_role === "Rider") {
      const tripsOfDispatcher = await dispatcherTrips(user_role, user_id);

      return tripsOfDispatcher;
    }
  } catch (err) {
    return errorHandler(
      "Error occurred getting user trips details",
      `${err}`,
      500,
      "Trip Service: Get User Trips"
    );
  }
};

//ADD TRIP
export const addTripService = async (user_id, tripDetails, io) => {
  try {
    const { pick_lat, pick_long, drop_lat, drop_long } = tripDetails;

    const trip_id = crypto.randomBytes(4).toString("hex");
    const locationDetails = {
      trip_id,
      pick_lat,
      pick_long,
      drop_lat,
      drop_long,
    };
    const tripDetailsWithoutLocation = allowedPropertiesOnly({
      data: tripDetails,
      allowedProperties: NO_LOCATION_PROPS,
    });

    const dispatcher_id = await getDispatcherId(tripDetails.trip_medium);

    const tripStatusDetails = {
      trip_status: "Booked",
      trip_request_date: "now()",
      dispatcher_id,
      payment_status: false,
    };

    const finalTripDetails = {
      trip_id,
      customer_id: user_id,
      ...tripDetailsWithoutLocation,
      ...tripStatusDetails,
    };

    let newTrip = await addTripToDB(finalTripDetails, locationDetails);
    if(newTrip.error) {
      return newTrip; //with error details
    }
    //adds name of user to trips details for dashboard
    const {first_name, last_name} = await getOneUserService(user_id)
    newTrip.first_name = first_name;
    newTrip.last_name = last_name;

    // real time update
    
    io && await tripsRealTimeUpdate({
      io,
      reqUserId: user_id,
      trip: newTrip,
      dispatcherUserId: newTrip.dispatcher_id,
      customerUserId: user_id,
      tripType: "tripAdded",
    });

    
    //ADD ADVANCED REAL-TIME STAT UPDATE

    return newTrip;
  } catch (err) {
    return errorHandler(
      {
        error: "Server error occurred adding trip",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Trip Service"
      }
      
    );
  }
};

//UPDATE TRIP
export const updateTripService = async (
  tripDetails,
  reqUserId,
  io,
) => {
  try {
    
    const validTripDetails = allowedPropertiesOnly({
      data: tripDetails,
      allowedProperties: ALLOWED_UPDATE_PROPERTIES,
    });

    let updatedTrip = await updateTripOnDB(validTripDetails);
    if (updatedTrip.error) {
      return updatedTrip; //with error details
    }
    
    let dispatcherUserId = ''; //for fetching data for real time update
    const customerUserId = updatedTrip?.customer_id; //for fetching data for real time update
    const { dispatcher_id, trip_medium } = updatedTrip;

    if(dispatcher_id) {
      const dispatcherDetails = await getDispatcherDetails({dispatcher_id, trip_medium})
      dispatcherUserId = dispatcherDetails?.user_id
      updatedTrip = { ...updatedTrip, dispatcher: dispatcherDetails }
    }
    //emit reall time update
     io && await tripsRealTimeUpdate({io, reqUserId, trip: updatedTrip, dispatcherUserId, customerUserId, tripType: "tripUpdated"})
    
    

    return updatedTrip;

  } catch (err) {
    return errorHandler(
      {
        error: "Server error occurred updating trip",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Trip Service"
      }
      
    );
  }
};

//RATE TRIP
export const rateTripService = async (ratingDetails, io, reqUserId) => {
  try {
    const ratingDetailsWithRatingStatus = { ...ratingDetails, rated: true };

    const validTripDetails = allowedPropertiesOnly({
      data: ratingDetailsWithRatingStatus,
      allowedProperties: ALLOWED_RATE_TRIP_PROPS,
    });

    const { trip_id, dispatcher_id } = validTripDetails;
    const updateTrip = await updateTripOnDB(validTripDetails);
    if (updateTrip.error) {
      return updateTrip; //Error details returned
    }

    const tripMedium = await getSpecificTripDetailsUsingId(
      trip_id,
      "trip_id",
      "trip_medium"
    );
    const cumulativeDispatcherRating =
      await getSpecificTripDetailsUsingId(
        dispatcher_id,
        "dispatcher_id",
        "AVG(dispatcher_rating)"
      );
    const averageDispatcherRating = cumulativeDispatcherRating[0].avg;
    const { trip_medium } = tripMedium[0];

    const ratedTrip = await updateDispatcherRating(
      trip_medium,
      dispatcher_id,
      averageDispatcherRating
    );
    if (ratedTrip.error) {
      return ratedTrip; //error details returned
    }

    const ratingCountUpdate = await increaseRatingCount(
      trip_medium,
      dispatcher_id
    );
    if (ratingCountUpdate.error) {
      return ratingCountUpdate; //error details included
    }

    const { customer_id: customerUserId, } = ratedTrip;
    const dispatcherDetails = dispatcher_id && await getDispatcherDetails({dispatcher_id, trip_medium})
    const {user_id: dispatcherUserId} = dispatcherDetails;
    //check for user role and emit based on the user role
    io && await tripsRealTimeUpdate({
      io,
      reqUserId,
      dispatcherUserId,
      customerUserId,
      tripType: "tripRated",
      trip: ratedTrip
    });



    return ratedTrip;
  } catch (err) {
    return errorHandler(
      {
        error: `Server error occurred adding rating: ${err}`,
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Trip Service: Rate Trip"
      }
      
    );
  }
};

//DELETE TRIP
export const deleteTripService = async (trip_id, user_id, io) => {
  try {
    
    const IDsANdMedium = await getIDsAndMediumFromDb (trip_id);
    
    
    const {dispatcher_id, customer_id: customerUserId, trip_medium} = IDsANdMedium;
    const dispatcherDetails = dispatcher_id && await getDispatcherDetails({dispatcher_id, trip_medium})
    const {user_id: dispatcherUserId} = dispatcherDetails;
    
    
    const deletedTrip = dispatcherUserId && await deleteTripFromDB(trip_id);
    if(deletedTrip?.error) {
      return deletedTrip;
    }

    io && await tripsRealTimeUpdate({
      io,
      reqUserId: user_id,
      dispatcherUserId,
      customerUserId,
      tripType: "tripDeleted",
      trip_id
    });

    
        
    return deletedTrip;
  } catch (err) {
    return errorHandler(
      {
        error: "Error occurred deleting trip",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Trip Service: Delete Trip"
      }
      
    );
  }
};

//STATS - GET TRIPS MONTHS
export const getTripMonthsService = async () => {
  try {
    const tripMonthsData = await tripsMonths();
    if (tripMonthsData.error) {
      return tripMonthsData; //error message returned
    }
    const monthsArray = tripMonthsData.map((tripsMonth) => tripsMonth.month);
    
    monthsArray.sort((a, b) => MONTH_ORDER.indexOf(a) - MONTH_ORDER.indexOf(b));

    return monthsArray;
  } catch (err) {
    return errorHandler(
      {
        error: "Error occurred getting trips months",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Trips Months Service"
      }
      
    );
  }
};

//STATS - CURRENT MONTH TRIPS COUNTS
export const currentMonthTripsCountService = async () => {
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

    const pending_current_month =
      +total_trips_current_month -
      (+delivered_current_month + +cancelled_current_month);
    const pending_previous_month =
      +total_trips_previous_month -
      (+delivered_previous_month + +cancelled_previous_month);

    const pending_percentage_difference = percentageDifference(
      +pending_current_month,
      +pending_previous_month
    );

    const delivered_percentage_difference = percentageDifference(
      +delivered_current_month,
      +delivered_previous_month
    );

    const total_trips_percentage_difference = percentageDifference(
      total_trips_current_month,
      total_trips_previous_month
    );

    const revenue_percentage_difference = percentageDifference(
      +revenue_current_month,
      +revenue_previous_month
    );

    const cancelled_percentage_difference = percentageDifference(
      cancelled_current_month,
      cancelled_previous_month
    );

    const revenue_with_currency = currencyFormatter.format(
      revenue_current_month
    );

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
  } catch (err) {
    return errorHandler(
      {
        error: "Error occurred getting trips months",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Trips Months Service"
      }
      
    );
  }
};

//MONTH +ALLTIME TRIPS COUNT
export const tripsCountByMonth = async (tripDataColumn, condition, month) => {
  try {
    const monthTripCount = await getTripCountByMonth(
      tripDataColumn,
      condition,
      month
    );

    if (monthTripCount.error) {
      return monthTripCount; //with error details
    }

    const tripMonths = await getTripMonthsService();
    const tripCounts = [];


    const sortedMonthsData = sortByCalendarMonths(monthTripCount);

    sortedMonthsData.forEach((monthTripCount) => {
      //this is to make room for 0s
      tripCounts.push(+monthTripCount.trip_count || 0);
    });

    return { tripMonths, tripCounts };
  } catch (err) {
    return errorHandler(
      {
        error: "Error occurred getting current week trips count",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Trips Week Service"
      }
      
    );
  }
};

export const getRevenueByMonth = async () => {
  try {
    const monthsRevenue = await revenueByMonth();

    if (monthsRevenue.error) {
      return monthsRevenue; //with error details
    }

    const revenue = [];
    const sortedRevenue = sortByCalendarMonths(monthsRevenue);
    const tripMonths = [];
    sortedRevenue.forEach((monthRevenue) => {
      revenue.push(+monthRevenue.revenue || 0);
      tripMonths.push(monthRevenue.month);
    });
    
    return { tripMonths, revenue };
  } catch (err) {
    return errorHandler(
      {
        error: "Error occurred getting revenue by month",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Trips Revenue Service"
      }
      
    );
  }
};

//WEEK TRIPS
export const currentWeekTrip = async () => {
  try {
    const weekTripsCount = await oneWeekTripsCount();
    if (weekTripsCount.error) {
      return weekTripsCount; //with error details
    }

    const tripDates = [];
    const tripCounts = [];

    weekTripsCount.forEach((weekTripCount) => {
      tripDates.push(weekTripCount.trip_date);
      tripCounts.push(weekTripCount.total_count);
    });

    const tripDays = tripDates.map((date) => getDayFromDate(date));
    tripDays[tripDays.length - 1] = "Today";
    tripDays[tripDays.length - 2] = "Yesterday";
    return { tripDays, tripCounts };
  } catch (err) {
    return errorHandler(
      {
        error: "Error occurred getting current week trips count",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Trips Week Service"
      }
      
    );
  }
};
