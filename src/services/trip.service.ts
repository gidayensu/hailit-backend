
import crypto from "crypto";
import { config } from "dotenv";
import { Server } from "socket.io";

//constants
import { DEFAULT_LIMIT } from "../constants/sharedConstants";
import {
  ALLOWED_RATE_TRIP_PROPS,
  ALLOWED_UPDATE_PROPERTIES,
  ANONYMOUS_USER_PROPS,
  MONTH_ORDER,
  NO_LOCATION_PROPS,
  TRIP_MEDIUM_COLUMN
} from "../constants/tripConstants";

//DB functions
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

//helpers
import {
  allowedPropertiesOnly,
  currencyFormatter,
  getDayFromDate,
  isErrorResponse,
  userIsUserRole
} from "../utils/util";
import { getAllEntitiesService } from "./helpers.service";
import {
  calculatePending,
  dispatcherTrips,
  getCustomerTrips,
  getDispatcherDetails,
  getDispatcherId,
  increaseRatingCount,
  isIDsAndMedium,
  isTrip,
  percentageDifference,
  sortByCalendarMonths,
  tripsRealTimeUpdate,

  updateDispatcherRating
} from "./tripServiceHelpers";
config({ path: "../../../.env" });

//types
import { GetAll } from "../types/getAll.types";
import { MonthName, MonthsData, Trip, TripLocationDetails, TripMonth } from "../types/trips.types";
import { User, UserRole } from "../types/user.types";
import { ErrorResponse, handleError } from "../utils/handleError";
import { getOneUserService } from "./user.service";
import { EntityName } from "../types/shared.types";
import { getOneRiderService } from "./rider.service";
import { getOneDriverService } from "./driver.service";

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
      entityName: EntityName.Trips}
    );

    return trips;
    
  } catch (err) {
    return handleError(
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
export const searchTripService = async ({
  search,
  page,
  limit = DEFAULT_LIMIT,
}: {
  search: string;
  page: number;
  limit?: number;
}) => {
  try {
    let offset = 0;

    page > 1 ? (offset = limit * page - limit) : page;
    const searchLowerCase = search.toLowerCase();
    const searchResults = await searchTrips({searchQuery:searchLowerCase, limit, offset});

    return searchResults;
  } catch (err) {
    return handleError({
      error: "Error Occurred in getting Trips Detail",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Get All Trips Service",
    });
  }
};

//GET ONE TRIP

export const getOneTripService = async ({tripId, requesterUserId}: {tripId: string, requesterUserId:string}) => {
  try {
    //check if user is admin
    const isAdmin = await userIsUserRole({userId: requesterUserId, userRole:"Admin"});

    let oneTrip =  await getOneTripFromDB(tripId);
    if (isErrorResponse(oneTrip)) {
      return oneTrip;
    }

    //exclude sender and recipient phone numbers from data sent
    if (!requesterUserId ||  (requesterUserId !== oneTrip.customer_id && !isAdmin) ) {
      oneTrip = allowedPropertiesOnly({data:oneTrip, allowedProperties:ANONYMOUS_USER_PROPS});
    }
    
    if (!isTrip(oneTrip)) {
      throw new Error('Expected Trip type');
    }
    const { dispatcher_id, trip_medium } = oneTrip 
    const dispatcherDetails = await ({dispatcherId: dispatcher_id, tripMedium:trip_medium})
      
    if (isErrorResponse(dispatcherDetails)) {
      return { ...oneTrip, dispatcher: "Not assigned" };
    }

    
    return { ...oneTrip, dispatcher: dispatcherDetails };
  } catch (err) {
    return handleError(
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

export const getUserTripsService = async (userId:string) => {
  try {
    const userData = await getOneUserFromDB(userId);

    if (isErrorResponse(userData)) {
      return userData;
    }

    const { user_role:userRole }: {user_role: UserRole} = userData;

    if (userRole === "Customer" || userRole === "Admin") {
      const customerTrips = await getCustomerTrips(userId);

      return customerTrips;
    }

    if (userRole === "Driver" || userRole === "Rider") {
      const tripsOfDispatcher = await dispatcherTrips({userRole, userId});

      return tripsOfDispatcher;
    }
  } catch (err) {
    return handleError({
      error: "Error occurred getting user trips details",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Trip Service: Get User Trips"}
    );
  }
};

//ADD TRIP
export const addTripService = async ({userId, tripDetails, io}: {userId:string; tripDetails: Trip, io: Server}) => {
  try {
    const { pick_lat, pick_long, drop_lat, drop_long } = tripDetails;

    const trip_id = crypto.randomBytes(4).toString("hex");
    const locationDetails: TripLocationDetails = {
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
      customer_id: userId,
      ...tripDetailsWithoutLocation,
      ...tripStatusDetails,
    };

    let newTrip = await addTripToDB({tripDetailsWithoutLocation: finalTripDetails, locationDetails});
    if(isErrorResponse(newTrip)) {
      return newTrip; //with error details
    }
    //adds name of user to trips details for dashboard
    const userData = await getOneUserService(userId);
    
    if(isErrorResponse(userData)) {
    
      newTrip.first_name = "Error occurred";
      newTrip.last_name = "Error occurred";
    }

    const {first_name, last_name} = userData as User;
    newTrip.first_name = first_name;
      newTrip.last_name = last_name;
    // real time update
    
    io && await tripsRealTimeUpdate({
      io,
      trip: newTrip,
      dispatcherUserId: newTrip.dispatcher_id,
      customerUserId: userId,
      tripType: "tripAdded",
    });

    
    //ADD ADVANCED REAL-TIME STAT UPDATE

    return newTrip;
  } catch (err) {
    return handleError(
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
export const updateTripService = async ({ tripDetails, io }: {tripDetails: Trip; io:Server}) => {
  try {
    const validTripDetails = allowedPropertiesOnly({
      data: tripDetails,
      allowedProperties: ALLOWED_UPDATE_PROPERTIES,
    });

    const updatedTrip = await updateTripOnDB(validTripDetails);
    if (isErrorResponse(updatedTrip)) {
      return updatedTrip; //with error details
    }

    let dispatcherUserId = ""; //for fetching data for real time update
    const customerUserId = updatedTrip?.customer_id; //for fetching data for real time update
    const { dispatcher_id: dispatcherId, trip_medium } = updatedTrip;

    if (dispatcherId) {
      const dispatcherDetails = trip_medium === "Motor" ?  await getDispatcherDetails ({
        dispatcherId,
        getDispatcher: getOneRiderService
      }) : await getDispatcherDetails ({
        dispatcherId,
        getDispatcher: getOneRiderService
      }) 
      
      
      if(!isErrorResponse(dispatcherDetails)) {

        dispatcherUserId =  dispatcherDetails?.user_id;
        updatedTrip.dispatcher =  dispatcherDetails 
      }
    }
    //emit reall time update
    io &&
      (await tripsRealTimeUpdate({
        io,
        trip: updatedTrip,
        dispatcherUserId,
        customerUserId,
        tripType: "tripUpdated",
      }));

    return updatedTrip;
  } catch (err) {
    return handleError({
      error: "Server error occurred updating trip",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Trip Service",
    });
  }
};

//RATE TRIP
export const rateTripService = async ({
  ratingDetails,
  io,
}: {
  ratingDetails: Trip;
  io: Server;
}): Promise<Trip | ErrorResponse> => {
  try {
    const ratingDetailsWithRatingStatus = { ...ratingDetails, rated: true };

    const validTripDetails: Trip = allowedPropertiesOnly({
      data: ratingDetailsWithRatingStatus,
      allowedProperties: ALLOWED_RATE_TRIP_PROPS,
    });

    const { dispatcher_id } = validTripDetails; 
    const updateTrip = await updateTripOnDB(validTripDetails);
    if (isErrorResponse(updateTrip)) {
      return updateTrip; //Error details returned
    }

    
    const { trip_medium: tripMedium } = updateTrip;

    const cumulativeDispatcherRating = tripMedium === "Motor" ? await getOneRiderService(
      {
        id: dispatcher_id,
        
      } 
    ): await getOneDriverService({driverId: dispatcher_id})

    if(isErrorResponse(cumulativeDispatcherRating)) {
      return cumulativeDispatcherRating;
    }
    const averageDispatcherRating =  cumulativeDispatcherRating.cumulative_rating;

    const ratedTrip = await updateDispatcherRating({
      tripMedium: tripMedium,
      dispatcherId: dispatcher_id,
      averageDispatcherRating,
    });
    if (isErrorResponse(ratedTrip)) {
      return ratedTrip; //error details returned
    }

    const ratingCountUpdate = await increaseRatingCount({
      tripMedium: tripMedium,
      dispatcherId: dispatcher_id,
    });
    if (isErrorResponse(ratingCountUpdate)) {
      return ratingCountUpdate; //error details included
    }

    
    const { customer_id: customerUserId, dispatcher_id: dispatcherId } = updateTrip;
    
    

    if (dispatcherId) {
      const dispatcherDetails = tripMedium === "Motor" ?  await getDispatcherDetails ({
        dispatcherId,
        getDispatcher: getOneRiderService
      }) : await getDispatcherDetails ({
        dispatcherId,
        getDispatcher: getOneRiderService
      }) 
      

      let dispatcherUserId: string  = '' 
      if(!isErrorResponse(dispatcherDetails)) {
        dispatcherUserId = typeof(dispatcherDetails.dispatcher_id) === 'string' ? dispatcherDetails.dispatcher_id : ''
      } 

    
    //check for user role and emit based on the user role
    io &&
      (await tripsRealTimeUpdate({
        io,
        dispatcherUserId,
        customerUserId,
        tripType: "tripRated",
        trip: updateTrip,
      }));
    }
    return updateTrip;
    
  } catch (err) {
    return handleError({
      error: `Server error occurred adding rating: ${err}`,
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Trip Service: Rate Trip",
    });
  }
};

//DELETE TRIP
export const deleteTripService = async ({tripId, io}: {tripId: string, io: Server}) => {
  try {
    
    const IDsAndMedium = await getIDsAndMediumFromDb (tripId);
    
    //ensure that the type of IDsAndMedium is not ErrorResponse
    if(!(isIDsAndMedium(IDsAndMedium))){
      throw new Error('Expected IDsAndMediums Type')
    }
    
    const {
      dispatcher_id: dispatcherId,
      customer_id: customerUserId,
      trip_medium: tripMedium,
    } = IDsAndMedium;
  
    
    
      const dispatcherDetails = tripMedium === "Motor" ?  await getDispatcherDetails ({
        dispatcherId,
        getDispatcher: getOneRiderService
      }) : await getDispatcherDetails ({
        dispatcherId,
        getDispatcher: getOneRiderService
      }) 
      
   
    const dispatcherUserId = !isErrorResponse(dispatcherDetails) ? dispatcherDetails.user_id :  ''
    
    
    const deletedTrip = dispatcherUserId && await deleteTripFromDB(tripId);
    if(isErrorResponse(deletedTrip)) {
      return deletedTrip;
    }

    io && await tripsRealTimeUpdate({
      io,
      dispatcherUserId,
      customerUserId,
      tripType: "tripDeleted",
      tripId
    });

    
        
    return deletedTrip;
  
  } catch (err) {
    return handleError(
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
    if (isErrorResponse(tripMonthsData)) {
      return tripMonthsData; //error message returned
    }
    const monthsArray = tripMonthsData.map((tripsMonth: TripMonth) => tripsMonth.month);
    
    monthsArray.sort((a:MonthName, b:MonthName) => MONTH_ORDER.indexOf(a) - MONTH_ORDER.indexOf(b));

    return monthsArray;
  } catch (err) {
    return handleError(
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

    

     
    const pending_current_month = calculatePending({
      total: total_trips_current_month,
      delivered: delivered_current_month,
      cancelled: cancelled_current_month,
    })

    const pending_previous_month = calculatePending({
      total: total_trips_previous_month,
      delivered: delivered_previous_month,
      cancelled: cancelled_previous_month,
    })
    
    const metrics = [
      {
        name: "pending",
        current: pending_current_month,
        previous: pending_previous_month,
      },
      {
        name: "delivered",
        current: delivered_current_month,
        previous: delivered_previous_month,
      },
      {
        name: "total_trips",
        current: total_trips_current_month,
        previous: total_trips_previous_month,
      },
      {
        name: "revenue",
        current: revenue_current_month,
        previous: revenue_previous_month,
      },
      {
        name: "cancelled",
        current: cancelled_current_month,
        previous: cancelled_previous_month,
      },
    ];

    
    const percentageDifferences = metrics.reduce(<T>(acc:any, { name, current, previous }: {name: string, current: number, previous: number}):T => {
        acc[`${name}_percentage_difference`] = percentageDifference({ currentMonth: current, previousMonth: previous });
      return acc;
    }, {});

    
    const revenue_with_currency = currencyFormatter.format(revenue_current_month);

    
    return {
      total_trips_current_month,
      revenue_current_month: revenue_with_currency,
      cancelled_current_month,
      delivered_current_month,
      pending_current_month,
      ...percentageDifferences,
    };
  } catch (err) {
    return handleError(
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
export const tripsCountByMonth = async ({tripDataColumn, condition, month} : {tripDataColumn: string; condition:string; month: MonthName}) => {
  try {
    const monthTripCount = await getTripCountByMonth({
      dataColumn: tripDataColumn,
      condition,
      month,
    });

    if (isErrorResponse(monthTripCount)) {
      return monthTripCount; //with error details
    }

    const tripMonths = await getTripMonthsService();
    const tripCounts: number[] = [];


    const sortedMonthsData: MonthsData[] = sortByCalendarMonths(monthTripCount);

    sortedMonthsData.forEach((monthTripCount:MonthsData) => {
      //this is to make room for 0s
      tripCounts.push(+monthTripCount.trip_count || 0);
    });

    return { tripMonths, tripCounts };
  } catch (err) {
    return handleError(
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

    if (isErrorResponse(monthsRevenue)) {
      return monthsRevenue; //with error details
    }

    const revenue: number[] = [];
    const sortedRevenue = sortByCalendarMonths(monthsRevenue);
    const tripMonths: MonthName[] = [];
    sortedRevenue.forEach((monthRevenue) => {
      revenue.push(+monthRevenue.revenue || 0);
      tripMonths.push(monthRevenue.month);
    });
    
    return { tripMonths, revenue };
  } catch (err) {
    return handleError(
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
    if (isErrorResponse(weekTripsCount)) {
      return weekTripsCount; //with error details
    }

    const tripDates: string[] = [];
    const tripCounts: MonthName[] = [];

    weekTripsCount.forEach((weekTripCount) => {
      tripDates.push(weekTripCount.trip_date);
      tripCounts.push(weekTripCount.total_count);
    });

    const tripDays = tripDates.map((date) => getDayFromDate(date));
    tripDays[tripDays.length - 1] = "Today";
    tripDays[tripDays.length - 2] = "Yesterday";
    return { tripDays, tripCounts };
  } catch (err) {
    return handleError(
      {
        error: "Error occurred getting current week trips count",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Trips Week Service"
      }
      
    );
  }
};
