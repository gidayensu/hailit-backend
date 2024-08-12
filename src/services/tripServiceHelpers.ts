//constants
import {
  DRIVER_ID_COLUMN,
  DRIVER_TABLE_NAME,
} from "../constants/driverConstants";
import {
  RATING_COUNT_COLUMN,
  RIDER_ID_COLUMN,
  RIDER_TABLE_NAME
} from "../constants/riderConstants";

import {
  CUSTOMER_ID_COLUMN,
  CUSTOMER_TRIP_FIELDS,
  DEFAULT_DISPATCHER_ID,
  DISPATCHER_AVAILABLE_COLUMN,
  DISPATCHER_ID_COLUMN,
  DISPATCHER_TRIP_FIELDS,
  TRIP_REQUEST_DATE_COLUMN,
} from "../constants/tripConstants";
import { USER_ID_COLUMN } from "../constants/usersConstants";


//DB functions
import {
  getDriverDetailOnCondition,
  getSpecificDriversFromDB,
  updateDriverOnDB,
} from "../model/driver.model";
import {
  getRiderOnConditionFromDB,
  getSpecificRidersFromDB,
  updateRiderOnDB,
} from "../model/rider.model";
import {
  getUserTripsFromDB,
  ratingCountIncrease,
} from "../model/trip.model";

//service functions
import {
  currentMonthTripsCountService,
  currentWeekTrip,
  getRevenueByMonth,
  getTripMonthsService,
  getUserTripsService
} from "./trip.service";

import { getOneDriverService } from "./driver.service";
import { getOneRiderService } from "./rider.service";

//helpers
import { ErrorResponse, handleError } from "../utils/handleError";
import { currencyFormatter, isErrorResponse } from "../utils/util";

//types
import { Server } from "socket.io";
import { CustomerTrips, MonthsData, Trip, TripMedium, TripsCount, TripsRealTimeUpdate } from "../types/trips.types";
import { UserRole } from "../types/user.types";
;


export const tripsRealTimeUpdate = async ({io,  trip, dispatcherUserId, customerUserId, tripType, tripId} : TripsRealTimeUpdate )=> {
  
    
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
        IDs.forEach(id=>io.to(id).emit("tripDeleted", tripId))
        io.of('/admins').emit("tripDeleted", tripId)
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

export const getDispatcherDetails = async ({tripMedium, dispatcherId}: {tripMedium: TripMedium, dispatcherId: string})=> {
  try {

  
  
      let dispatcherDetails = tripMedium === "Motor" ? await getOneRiderService({riderId: dispatcherId}) : await getOneDriverService({driverId: dispatcherId})
  
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
      return handleError({        
        error: "Error occurred getting Dispatcher details",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Trip Service Helper: Dispatcher Details"})
    }
}

//FETCH DISPATCHER DETAILS FOR UPDATED TRIP;

//CALCULATE TRIPS == breaks away from camel case to match the database case

export const increaseRatingCount = async ({tripMedium, dispatcherId}: {tripMedium: TripMedium, dispatcherId: string}) => {
  let tableName:string, idColumn:string;
  if (tripMedium === "Motor") {
    tableName = RIDER_TABLE_NAME;
    idColumn = RIDER_ID_COLUMN;
  } else if (tripMedium === "Car" || tripMedium === "Truck") {
    tableName = DRIVER_TABLE_NAME;
    idColumn = DRIVER_ID_COLUMN;
  } else {
    return handleError(
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
    dispatcherId,
    idColumn,
    RATING_COUNT_COLUMN
  );
  if (isErrorResponse( countIncrease)) {
    return countIncrease; //error details returned
  }
  return true;
};

export const tripsCount = (trips:Trip[]): TripsCount => {
  let total_earnings:number = 0;
  let total_payment: number = 0;
  let delivered_trips:number = 0;
  let current_trips:number = 0;
  let cancelled_trips:number = 0;

  trips.forEach((trip:Trip) => {
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
  total_earnings = +currencyFormatter.format(total_earnings);
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

export const percentageDifference = ({currentMonth, previousMonth}:{currentMonth:number, previousMonth:number}): number => {
  return +(((+currentMonth - +previousMonth) / +previousMonth) * 100).toFixed(
    2
  );
};

export const calculatePending = ({
  total,
  delivered,
  cancelled,
}: {
  total: number;
  delivered: number;
  cancelled: number;
}): number => +total - (+delivered + +cancelled);

export const updateDispatcherRating = async (
  {tripMedium,
  dispatcherId,
  averageDispatcherRating} : {
    tripMedium: TripMedium;
    dispatcherId: string,
    averageDispatcherRating: number
  }
): Promise<boolean | ErrorResponse> => {
  try {

    if (tripMedium === "Motor") {
      const riderUpdate = await updateRiderOnDB({
        cumulative_rating: averageDispatcherRating,
        rider_id: dispatcherId,
      });
      if (riderUpdate.error) {
        return riderUpdate; //Error details returned
      }
    } else if (tripMedium === "Car" || tripMedium === "Truck") {
      const driverUpdate = await updateDriverOnDB({
        cumulative_rating: averageDispatcherRating,
        driver_id: dispatcherId,
      });
      if (driverUpdate.error) {
        return driverUpdate; //Error details returned
      }
    }
    return true;
  } catch(err) {
    return handleError({error: "Error updating dispatcher rating", errorCode: 500, errorMessage: `${err}`, errorSource: 'Trip Servicer Helper: Update Disptcher Rating'})
  }
};

//CUSTOMER TRIPS (HELPER FUNCTION)
export const getCustomerTrips = async (userId:string): Promise<Trip[] | ErrorResponse | CustomerTrips> => {
  try {
    const trips:Trip[] = await getUserTripsFromDB({
      id: userId,
      idColumn: CUSTOMER_ID_COLUMN,
      tripFieldsToSelect: CUSTOMER_TRIP_FIELDS,
      sortingColumn: TRIP_REQUEST_DATE_COLUMN,
    });

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
    return handleError(
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
export const dispatcherTrips = async ({userRole, userId}: {userRole: UserRole, userId:string}) => {
  try {
    //dispatcher is used to represent drivers and riders except user role

    const dispatcherData =
      userRole === "Rider"
        ? await getRiderOnConditionFromDB(USER_ID_COLUMN, userId)
        : await getDriverDetailOnCondition(USER_ID_COLUMN, userId); ;
        
        if (dispatcherData.error) {
          return { error: dispatcherData.error };
        }

    const dispatcherId = userRole === "Rider"
      ? dispatcherData[0].rider_id
      : dispatcherData[0].driver_id
    
    
      const dispatcherTrips = await getUserTripsFromDB(
        {id:dispatcherId,
        idColumn: DISPATCHER_ID_COLUMN,
        tripFieldsToSelect: DISPATCHER_TRIP_FIELDS}
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
      //DISPATCHER_ID_COLUMN: this is because dispatcher is used to represent rider and driver in the trips table
      return dispatcherTrips;
    }

 catch (err) {
    return handleError(
      {
        error: "Error occurred getting dispatcher trips",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Trip Service: dispatcherTrips"
      }
      
    );
  }
};

export const getDispatcherId = async (tripMedium: TripMedium) => {
  let dispatcherId = DEFAULT_DISPATCHER_ID;

  if (tripMedium === "Car" || tripMedium === "Truck") {
    const availableDrivers = await getSpecificDriversFromDB(
      DISPATCHER_AVAILABLE_COLUMN,
      true
    );
    if (availableDrivers && availableDrivers.length > 0) {
      dispatcherId = availableDrivers[0].driver_id;
    }
  }

  if (tripMedium === "Motor") {
    const availableRiders = await getSpecificRidersFromDB(
      DISPATCHER_AVAILABLE_COLUMN,
      true
    );
    if (availableRiders && availableRiders.length > 0) {
      dispatcherId = availableRiders[0].rider_id;
    }
  }

  return dispatcherId;
};



export const sortByCalendarMonths= (monthCountData: MonthsData[]) => {
  
  monthCountData.sort((a:MonthsData, b:MonthsData) => {
    return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
  });

  return monthCountData;
}
 

export const isTrip = (trip: Trip | ErrorResponse): trip is Trip=> {
  return 'trip_id' in trip;
}
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
] 