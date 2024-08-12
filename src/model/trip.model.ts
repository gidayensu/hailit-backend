import { LOCATION_TABLE_NAME, TRIP_ID_COLUMN, TRIP_TABLE_NAME } from '../constants/tripConstants';
import { GetAllFromDB } from '../types/getAll.types';
import { Trip } from '../types/trips.types';
import { ErrorResponse, handleError } from "../utils/handleError";
import { isErrorResponse } from '../utils/util';
import { addOne } from "./DB/addDbFunctions";
import { deleteOne } from "./DB/deleteDbFunctions";
import { getOne, getSpecificDetailsUsingId, selectOnCondition } from "./DB/getDbFunctions";
import { increaseByValue } from "./DB/helperDbFunctions";
import {
  getCountByMonth,
  getIDsAndMedium,
  getOneTrip,
  getPreviousTwoMonthsCounts,
  getRevenueByMonth,
  getTripsCustomersJoin,
  getTripsMonths,
  tripsCount,
  upToOneWeekTripCounts
} from "./DB/tripsDbFunctions";
import { updateOne } from "./DB/updateDbFunctions";
  
  export const getAllTripsFromDB = async ({limit, offset, sortColumn,
    sortDirection, search}:GetAllFromDB ) => {
    try {
      
      const allTrips = await getTripsCustomersJoin({
        limit,
        offset,
        sortColumn,
        sortDirection,
        search,
      }); 
      
      return allTrips; 
    } catch (err) {
      
      return handleError(
        {
          error: "Server Error Occurred in getting all trips",
          errorMessage: `${err}`,
          errorCode: 500,
          errorSource: "Trip Model: All Trips"
        }
        
      );
    }
  };
  
  


export const tripsMonths = async()=> {
  try {
    const tripMonthsData = await getTripsMonths();
    
    return tripMonthsData;
    
  } catch(err) {
    return handleError({
      error: "Error occurred getting Trips Months",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Trips Months Trip Model"
    }  
    )
  }  
}  

export const getTripCount = async(search:string)=> {
  try {
    const tripCounts = await tripsCount(search);

    return tripCounts;
    
  } catch(err) {
    return handleError({
      error: "Error occurred getting Trip Count",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Trips Count Trip Model"
    }  
    )
  }  
}  
export const searchTrips = async({searchQuery, limit, offset}: {searchQuery: string, limit: number, offset: number}) : Promise<Trip[] | ErrorResponse>=> {
  try {
    
    const searchResults: Trip[] = await selectOnCondition(TRIP_TABLE_NAME, 'trip_id', searchQuery, limit, offset, true);

    return searchResults;
    
  } catch(err) {
    return handleError({
      error: "Error occurred searching Trips",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Search Trips Trip Model"
    }  
    )
  }  
}  
export const getSpecificTripDetailsUsingId = async ({
  tripId,
  columns,
  idColumn = TRIP_ID_COLUMN 
}: {
  tripId: string;
  columns: string[] | string;
  idColumn?: string
}) => {
  try {
    const specificDetails = await getSpecificDetailsUsingId({
      tableName: TRIP_TABLE_NAME,
      id: tripId,
      idColumn,
      columns: columns,
    });

    return specificDetails;
  } catch (err) {
    return handleError({
      error: "Error occurred getting specific trip details",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Trip Model: Get Specific Details",
    });
  }
};  

export const getIDsAndMediumFromDb = async (tripId:string)=> {
  const IDsAndMeidum = await getIDsAndMedium(tripId);
  
  return IDsAndMeidum;
}  


export const getOneTripFromDB = async (trip_id:string): Promise<Trip | ErrorResponse> => {
  try {
    const tripData = await getOneTrip( trip_id);

    if (isErrorResponse(tripData)) {
      return tripData;
    }
    return tripData[0];
  } catch (err) {
    return handleError(
      {
        error: "Server Error Occurred in getting data from Database",
        errorMessage: err,
        errorCode: 500,
        errorSource: "Trip Model: Get One Trip"
      }
      
    );
  }
};

export const getUserTripsFromDB = async (
  {id,
  idColumn,
  tripFieldsToSelect,
  sortingColumn,} : 
  {
    id: string,
    idColumn: string,
    tripFieldsToSelect: string[],
    sortingColumn?: string
  }
  
) => {
  try {
    const userTrips = await getSpecificDetailsUsingId({
      tableName: TRIP_TABLE_NAME,
      id: id,
      idColumn: idColumn,
      columns: tripFieldsToSelect,
      sortingColumn: sortingColumn,
    });
    
    if ( userTrips.length === 0) {
      return handleError({
        error: "No user trip found",
        errorMessage: null,
        errorCode: 404,
        errorSource: "Trip Model: Get User Trips"
      }
      );
    }
    return userTrips;
  } catch (err) {
    return handleError(
      {
        error: "Server Error Occurred in getting user trips from DB",
        errorMessage: err,
        errorCode: 500,
        errorSource: "Trip Model: Get User Trips From DB"
      }
      
    );
  }
};

export const getSpecificTripDetailsUsingIdFromDB = async (
  {userId,
  idColumn,
  returningColumn} : {
    userId: string,
    idColumn: string,
    returningColumn: string
  }
) => {
  try {
    const specificTripDetail = await getSpecificDetailsUsingId(
      {tableName: TRIP_TABLE_NAME,
      id: userId,
      idColumn,
      columns: returningColumn}
    );
    
    return specificTripDetail;
  } catch (err) {
    return handleError(
      {
        error: "Server Error Occurred in getting specific trip from DB",
        errorMessage: err,
        errorCode: 500,
        errorSource: "Trip Model: Get Specific Trip Detail Using ID"
      }
      
    );
  }
};

export const addTripToDB = async (tripDetailsWithoutLocation, locationDetails) => {
  try {
    const tripFieldsToSelect = Object.keys(tripDetailsWithoutLocation).join(", ");
    const tripDetailsValues = Object.values(tripDetailsWithoutLocation);
    const newTrip = await addOne(
      TRIP_TABLE_NAME,
      tripFieldsToSelect,
      tripDetailsValues
    );
    if (newTrip.error) {
      return newTrip //Error details returned
    }

    const trip = newTrip[0]
    
    const locationFieldsToSelect = Object.keys(locationDetails).join(", ");
    const locationValues = Object.values(locationDetails);
    const tripLocation = await addOne(
      LOCATION_TABLE_NAME,
      locationFieldsToSelect,
      locationValues
    )
    const location = tripLocation[0];

    return {...trip, location} //if there is an error adding tripLocation, it will be included

  } catch (err) {
    return handleError(
      {
        error: "Server Error Occurred in adding trip to DB",
        errorMessage: err,
        errorCode: 500,
        errorSource: "Trip Model: Add Trip"
      }
      
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
      return handleError(
        {
          error: "Error occurred in updating rider details",
          errorMessage: err,
          errorCode: 500,
          errorSource: "Trip Model"
        }
        
      );
    }
  } catch (err) {
    return handleError(
      {
        error: "Server Error Occurred updating trip details on DB",
        errorMessage: err,
        errorCode: 500,
        errorSource: "Trip Model: Update Trip"
      }
      
    );
  }
};

export const deleteTripFromDB = async (trip_id:string) => {
  try {
    const tripDelete = await deleteOne(TRIP_TABLE_NAME, "trip_id", trip_id);
    return tripDelete;
    
  } catch (err) {
    return handleError(
      {
        error: "Error occurred deleting trip",
        errorMessage: err,
        errorCode: 500,
        errorSource: "Trip Model: delete Trip"
      }
      
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

export const associatedWithTrip = async (trip_id, condition, conditionColumn) => {

  try { 
    const tripData = await getOne({
      tableName: TRIP_TABLE_NAME,
      columnName: TRIP_ID_COLUMN,
      condition: trip_id,
      secondConditionColumn: conditionColumn,
      secondCondition: condition,
    });
    if(tripData?.errorCode === 404) {
      return false;
    }
    
    return tripData;
    
  } catch (err) {
    return handleError(
      {
        error: "Error occurred while confirming user's relation to trip",
        errorMessage: err,
        errorCode: 500,
        errorSource: "Trip Model: Associated With Trip"
      }
      
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
    return handleError(
      {
        error: "Server Error Occurred in getting previous week trips count",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Trip Model: One Week Trips"
      }
      
    );
  }

}
export const getCurrentMonthTripsCount = async ()=> {
  try {
    

    const currentMonthTripsCount = await getPreviousTwoMonthsCounts(TRIP_TABLE_NAME, 'trip_request_date', 'trip_status', 'trip_cost', 'payment_status');
    return currentMonthTripsCount;
  } catch (err) {

    return handleError(
      {
        error: "Server Error Occurred in retrieving current month trips count",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Trip Model: Get Current Month's Trips Count"
      }
      
    );
  }
  
  
}
export const getTripCountByMonth = async (dataColumn, condition, month)=> {
  try {

    const tripCount = await getCountByMonth(dataColumn, condition, month);
    return tripCount;
  } catch(err) {
    return handleError(
      {
        error: `Server Error Occurred in retrieving ${dataColumn ? dataColumn : 'trips'} data`,
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Trip Model: Get Trip Count By Month"
      }
      
    );
  }
  
}
export const revenueByMonth = async ()=> {
  try {

    const revenue = await getRevenueByMonth();
    return revenue;
  } catch(err) {
    return handleError(
      {
        error: "Server Error Occurred in retrieving trips revenue data",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Trip Model: Get Trip Revenue By Month"
      }
      
    );
  }
  
}
