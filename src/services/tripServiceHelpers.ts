import {
  DRIVER_ID_COLUMN,
  DRIVER_TABLE_NAME,
} from "../constants/driverConstants.js";
import {
  RATING_COUNT_COLUMN,
  RIDER_ID_COLUMN,
  RIDER_TABLE_NAME
} from "../constants/riderConstants.js";

import {
  CUSTOMER_ID_COLUMN,
  CUSTOMER_TRIP_FIELDS,
  DEFAULT_DISPATCHER_ID,
  DISPATCHER_AVAILABLE_COLUMN,
  DISPATCHER_ID_COLUMN,
  DISPATCHER_TRIP_FIELDS,
  TRIP_REQUEST_DATE_COLUMN,
} from "../constants/tripConstants.js";
import { USER_ID_COLUMN } from "../constants/usersConstants.js";
import {
  getDriverDetailOnCondition,
  getSpecificDriversFromDB,
  updateDriverOnDB,
} from "../model/driver.model.js";
import {
  getRiderOnConditionFromDB,
  getSpecificRidersFromDB,
  updateRiderOnDB,
} from "../model/rider.model.js";
import {
  getUserTripsFromDB,
  ratingCountIncrease,
} from "../model/trip.model.js";
import { errorHandler } from "../utils/errorHandler.js";
import { currencyFormatter } from "../utils/util.js";
import {
  currentMonthTripsCountService,
  currentWeekTrip,
  getRevenueByMonth,
  getTripMonthsService,
  getUserTripsService
} from "./trip.service.js";

import { getOneDriverService } from "./driver.service.js";
import { getOneRiderService } from "./rider.service.js";

export const tripsRealTimeUpdate = async ({io,  trip, dispatcherUserId, customerUserId, tripType, trip_id} )=> {
  
    
    const IDs = [customerUserId, dispatcherUserId];
    
    

    try {
      //emit to customers/dispatchers
      if(tripType === "tripAdded" ){
        io.to(customerUserId).emit("tripAdded")
        io.of('/admins').emit("tripAdded", trip)
      }

      if(tripType === "tripUpdated" ) {
        IDs.forEach(id=>io.to(id).emit("tripUpdated", trip))
        io.of('/admins').emit("tripUpdated", trip)
      }

      if(tripType === "tripDeleted") {
        IDs.forEach(id=>io.to(id).emit("tripDeleted", trip_id))
        io.of('/admins').emit("tripDeleted", trip_id)
      }
      
      const customerTrips = await getUserTripsService(customerUserId);
      const dispatherTrips = await getUserTripsService(dispatcherUserId);
      io.to(customerUserId).emit("customerTrips", customerTrips);
      io.to(dispatcherUserId).emit("dispatcherTrips", dispatherTrips);

      //emit to admins
      const [
        currentMonthTripsCount,
        tripMonths,
        monthRevenue,
        currentWeekCount,
      ] = await Promise.all([
        currentMonthTripsCountService(),
        getTripMonthsService(),
        getRevenueByMonth(),
        currentWeekTrip(),
      ]);
      
      
      
      io.of('/admins').emit("currentMonthTripsCount", currentMonthTripsCount);
      io.of('/admins').emit("tripMonths", tripMonths);
      io.of('/admins').emit("monthRevenue", monthRevenue);
      io.of('/admins').emit("currentWeekCount", currentWeekCount);
      
    } catch (error) {
      console.error("Error fetching data for admin namespace:", error);
    }
  }

export const getDispatcherDetails = async ({trip_medium, dispatcher_id})=> {
  try {

  
  const dispatcherService =
        trip_medium === "Motor" ? getOneRiderService : getOneDriverService;
      let dispatcherDetails = await dispatcherService(dispatcher_id);
  
      if (dispatcherDetails.error) {
        dispatcherDetails = "Not assigned";
      }
      const {
        rider_id = "",
        driver_id = "",
        
      } = dispatcherDetails;
  
      dispatcherDetails = {
        ...dispatcherDetails,
        dispatcher_id: rider_id || driver_id,
        
      };
      return dispatcherDetails;
    } catch (err) {
      return errorHandler({        
        error: "Error occurred getting Dispatcher details",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Trip Service Helper: Dispatcher Details"})
    }
}

//FETCH DISPATCHER DETAILS FOR UPDATED TRIP;

//CALCULATE TRIPS == breaks away from camel case to match the database case

export const increaseRatingCount = async (trip_medium, dispatcher_id) => {
  let tableName, idColumn;
  if (trip_medium === "motor") {
    tableName = RIDER_TABLE_NAME;
    idColumn = RIDER_ID_COLUMN;
  } else if (trip_medium === "car" || trip_medium === "truck") {
    tableName = DRIVER_TABLE_NAME;
    idColumn = DRIVER_ID_COLUMN;
  } else {
    return errorHandler(
      {
        error: "Error occurred increasing rating count",
        errorMessage: "Invalid trip medium",
        errorCode: 400,
        errorSource: "Trip Service Helper: Increase Rating Count"
      }
      
    );
  }

  const countIncrease = await ratingCountIncrease(
    tableName,
    dispatcher_id,
    idColumn,
    RATING_COUNT_COLUMN
  );
  if (countIncrease.error) {
    return countIncrease; //error details returned
  }
  return { success: true };
};
export const tripsCount = (trips) => {
  let total_earnings = 0;
  let total_payment = 0;
  let delivered_trips = 0;
  let current_trips = 0;
  let cancelled_trips = 0;

  trips.forEach((trip) => {
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
  total_earnings = currencyFormatter.format(total_earnings);
  const total_trip_count = trips.length;

  return {
    total_trip_count,
    delivered_trips,
    cancelled_trips,
    current_trips,
    total_earnings,
    total_payment,
  };
};

export const percentageDifference = (currentMonth, previousMonth) => {
  return +(((+currentMonth - +previousMonth) / +previousMonth) * 100).toFixed(
    2
  );
};

export const updateDispatcherRating = async (
  trip_medium,
  dispatcher_id,
  averageDispatcherRating
) => {
  if (trip_medium === "motor") {
    const riderUpdate = await updateRiderOnDB({
      cumulative_rating: averageDispatcherRating,
      rider_id: dispatcher_id,
    });
    if (riderUpdate.error) {
      return riderUpdate; //Error details returned
    }
  } else if (trip_medium === "car" || trip_medium === "truck") {
    const driverUpdate = await updateDriverOnDB({
      cumulative_rating: averageDispatcherRating,
      driver_id: dispatcher_id,
    });
    if (driverUpdate.error) {
      return driverUpdate; //Error details returned
    }
  }
  return { success: true };
};

//CUSTOMER TRIPS (HELPER FUNCTION)
export const getCustomerTrips = async (user_id) => {
  try {
    const trips = await getUserTripsFromDB(
      user_id,
      CUSTOMER_ID_COLUMN,
      CUSTOMER_TRIP_FIELDS,
      TRIP_REQUEST_DATE_COLUMN
    );

    if (trips.length > 0) {
      const {
        total_trip_count,
        delivered_trips,
        cancelled_trips,
        current_trips,
        total_payment,
      } = tripsCount(trips);
      return {
        customer_trips: trips,
        total_trip_count,
        delivered_trips,
        cancelled_trips,
        current_trips,
        total_payment,
      };
    }

    return trips;
  } catch (err) {
    return errorHandler(
      {
        error: "Error occurred getting customer trips",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Trip Service"
      }
      
    );
  }
};
//GET DISPATHCER TRIPS
export const dispatcherTrips = async (user_role, user_id) => {
  try {
    //dispatcher is used to represent drivers and riders except user role

    let dispatcherData = {};
    let dispatcher_id = "";
    if (user_role === "Rider") {
      dispatcherData = await getRiderOnConditionFromDB(USER_ID_COLUMN, user_id);

      if (dispatcherData.error) {
        return { error: dispatcherData.error };
      }

      dispatcher_id = dispatcherData[0].rider_id;
    }

    if (user_role === "Driver") {
      dispatcherData = await getDriverDetailOnCondition(
        USER_ID_COLUMN,
        user_id
      );

      if (dispatcherData.error) {
        return { error: dispatcherData.error };
      }
      //could be  a source of bug
      dispatcher_id = dispatcherData[0].driver_id;
    }

    //DISPATCHER_ID_COLUMN: this is because dispatcher is used to represent rider and driver in the trips table
    const dispatcherTrips = await getUserTripsFromDB(
      dispatcher_id,
      DISPATCHER_ID_COLUMN,
      DISPATCHER_TRIP_FIELDS
    );

    if (dispatcherTrips.length > 0) {
      const {
        total_trip_count,
        delivered_trips,
        cancelled_trips,
        current_trips,
        total_earnings,
      } = tripsCount(dispatcherTrips);
      return {
        dispatcher_trips: dispatcherTrips,
        total_trip_count,
        delivered_trips,
        cancelled_trips,
        current_trips,
        total_earnings,
      };
    }
    return dispatcherTrips;
  } catch (err) {
    return errorHandler(
      {
        error: "Error occurred getting dispatcher trips",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Trip Service: dispatcherTrips"
      }
      
    );
  }
};

export const getDispatcherId = async (trip_medium) => {
  let dispatcher_id = DEFAULT_DISPATCHER_ID;

  if (trip_medium === "car" || trip_medium === "truck") {
    const availableDrivers = await getSpecificDriversFromDB(
      DISPATCHER_AVAILABLE_COLUMN,
      true
    );
    if (availableDrivers && availableDrivers.length > 0) {
      dispatcher_id = availableDrivers[0].driver_id;
    }
  }

  if (trip_medium === "motor") {
    const availableRiders = await getSpecificRidersFromDB(
      DISPATCHER_AVAILABLE_COLUMN,
      true
    );
    if (availableRiders && availableRiders.length > 0) {
      dispatcher_id = availableRiders[0].rider_id;
    }
  }

  return dispatcher_id;
};



export const sortByCalendarMonths= (monthCountData) => {
  
  const monthOrder = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  
  
  monthCountData.sort((a, b) => {
    return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
  });

  return monthCountData;
}
 
