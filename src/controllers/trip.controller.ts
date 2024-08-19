
//constants
import { DEFAULT_USER_ID } from "../constants/usersConstants";

//trip service functions
import {
  addTripService,
  currentMonthTripsCountService,
  currentWeekTrip,
  deleteTripService,
  getAllTripsService,
  getOneTripService,
  getRevenueByMonth,
  getTripMonthsService,
  getUserTripsService,
  rateTripService,
  searchTripService,
  tripsCountByMonth,
  updateTripService,
} from "../services/trip.service";


//helpers
import { isErrorResponse } from "../utils/util";

//types
import { CustomRequest, Middleware } from "../types/middleware.types";
import { MonthName } from "../types/trips.types";
import { DataString, SortDirection } from "../types/shared.types";
import { DEFAULT_LIMIT } from "../constants/sharedConstants";


export const getAllTrips : Middleware = async (req, res) => {
  try {
    const {
      page,
      itemsPerPage,
      sortColumn,
      sortDirection,
      search
    } = req.query;

    const limit: number  = typeof(itemsPerPage) === 'string' ? parseFloat(itemsPerPage) : DEFAULT_LIMIT;
    
    const allTrips = await getAllTripsService({
      page: parseFloat(`${page}`),
      limit,
      sortColumn: `${sortColumn}`,
      sortDirection: sortDirection as SortDirection,
      search: search as DataString,
    });

    if (isErrorResponse(allTrips)) {
      return res
        .status(allTrips.errorCode)
        .json({
          error: allTrips.error,
          errorMessage: allTrips.errorMessage,
          errorSource: allTrips.errorSource,
        });
    }

    res.status(200).json({ ...allTrips });
  } catch (err) {
    return res
      .status(500)
      .json({
        error: "Server Error occurred",
        errorMessage: `${err}`,
        errorSource: "Get All Trips Controller",
      });
  }
};

export const getOneTrip : Middleware = async (req, res) => {
  try {
    const { trip_id } = req.params;

    const userId = (req as CustomRequest).user?.sub;

    const oneTrip = await getOneTripService({tripId:trip_id, requesterUserId:userId});
    if (isErrorResponse(oneTrip)) {
      return res
      .status(400)
      .json({
        error: oneTrip.error,
        errorMessage: oneTrip.errorMessage,
        errorSource: oneTrip.errorSource,
      });
    }

    const returnedTrip = {trip:oneTrip}
    res.status(200).json(returnedTrip);
  } catch (err) {
    return res
      .status(500)
      .json({
        error: "Server Error occurred getting trip",
        errorMessage: `${err}`,
        errorSource: "Trip Controller",
      });
  }
};

export const getUserTrips : Middleware = async (req, res) => {
  try {
    const { user_id } = req.params;

    const userTrips = await getUserTripsService(user_id);

    if (isErrorResponse(userTrips)) {
      return res
        .status(userTrips.errorCode)
        .json({
          error: userTrips.error,
          errorMessage: userTrips.errorMessage,
          errorSource: userTrips.errorSource,
        });
    }
    res.status(200).json({ trips: userTrips });
  } catch (err) {
    return res
      .status(500)
      .json({
        error: "Server Error occurred getting user trips",
        errorMessage: `${err}`,
        errorSource: "User Trips Controller: Get User Trips",
      });
  }
};

export const addTrip : Middleware = async (req, res) => {
  ///trip amount, trip_status, driver_id, trip_date, total amount, payment_status, delivery_time, payment_method, dispatcher_rating, rating_comment will be added in the service layer based on certain conditions

  try {
    const tripDetails = req.body;
    const userId = (req as CustomRequest).user?.sub || DEFAULT_USER_ID;
    const io = (req as CustomRequest).io;
    
    const tripAdded = await addTripService({userId, tripDetails, io});
    if (isErrorResponse(tripAdded)) {
      return res
        .status(400)
        .json({
          error: tripAdded.error,
          errorMessage: tripAdded.errorMessage,
          errorSource: tripAdded.errorSource,
        });
    }
    res.status(200).json({ trip: tripAdded });
    
  } catch (err) {
    return res
      .status(500)
      .json({
        error: "Server Error occurred adding trip",
        errorMessage: `${err}`,
        errorSource: "Adding Trip Controller",
      });
  }
};

export const updateTrip : Middleware = async (req, res) => {
  try {
    const reqUserId = (req as CustomRequest).user.sub;
    const io = (req as CustomRequest).io;
    
    const { trip_id } = req.params;
    const tripDetails = { trip_id, ...req.body,  };

    const tripUpdate = await updateTripService({ tripDetails, io,} );
    if (isErrorResponse(tripUpdate)) {
      return res
        .status(403)
        .json({
          error: tripUpdate.error,
          errorMessage: tripUpdate.errorMessage,
          errorSource: tripUpdate.errorSource,
        });
    }
    const updatedTrip = {trip: tripUpdate}

    
    
    res.status(200).json(updatedTrip);
  } catch (err) {
    return res
      .status(500)
      .json({
        error: "Server Error occurred updating trip",
        errorMessage: `${err}`,
        errorSource: "Trip Controller",
      });
  }
};

export const rateTrip : Middleware = async (req, res) => {
  try {
    const ratingDetails = req.body;
    

    const { trip_id } = req.params;
    const detailsWithId = { trip_id, ...ratingDetails };

    const ratedTrip = await rateTripService(detailsWithId);
    if (isErrorResponse(ratedTrip)) {
      return res
        .status(400)
        .json({
          error: ratedTrip.error,
          errorMessage: ratedTrip.errorMessage,
          errorSource: ratedTrip.errorSource,
        });
    }
    
    res.status(200).json(ratedTrip);
  } catch (err) {
    return res
      .status(500)
      .json({
        error: "Server Error occurred",
        errorMessage: `${err}`,
        errorSource: "Trip Controller",
      });
  }
};

export const deleteTrip : Middleware = async (req, res) => {
  try {
    
    const { trip_id } = req.params;
    const io = (req as CustomRequest).io;
    const tripDelete = await deleteTripService({tripId: trip_id, io});

    if (isErrorResponse(tripDelete)) {
      return res
        .status(tripDelete.errorCode)
        .json({
          error: tripDelete.error,
          errorMessage: tripDelete.errorMessage,
          errorSource: tripDelete.errorSource,
        });
    }
    
    res.status(200).json({ success: true, trip_id });
  } catch (err) {
    return res
      .status(500)
      .json({
        error: "Error Occurred; Trip Not Deleted",
        errorMessage: `${err}`,
        errorSource: "Trip Controller",
      });
  }
};

export const searchTrips : Middleware = async (req, res) => {
  try {
    const search = req.query.search;

    const page = req.query.page || 1;
    const searchResults = await searchTripService({page: parseFloat(`${page}`),
      search: `${search}`,});
    if (isErrorResponse(searchResults)) {
      return res
        .status(searchResults.errorCode)
        .json({
          error: searchResults.error,
          searchResults: searchResults.errorMessage,
          errorSource: searchResults.errorSource,
        });
    }
    res.status(200).json({ trips: searchResults });
  } catch (err) {
    return res
      .status(500)
      .json({
        error: "Error Occurred; Trips not retrived",
        errorMessage: `${err}`,
        errorSource: "Trip Controller: Search Trips",
      });
  }
};

//TRIP STATS
export const getTripMonths : Middleware = async (req, res) => {
  try {
    const tripMonths = await getTripMonthsService();
    if (isErrorResponse(tripMonths)) {
      return res
        .status(tripMonths.errorCode)
        .json({
          error: tripMonths.error,
          errorMessage: tripMonths.errorMessage,
          errorSource: tripMonths.errorSource,
        });
    }
    res.status(200).json({ tripMonths });
  } catch (err) {
    return res
      .status(500)
      .json({
        error: "Error Occurred; Trip Months Not Retrieved",
        errorMessage: `${err}`,
        errorSource: "Trip Controller. Trip Months",
      });
  }
};

//GET CURRENT WEEK TRIP COUNT
export const currentWeekTripCount : Middleware = async (req, res) => {
  try {
    const currentWeekTrips = await currentWeekTrip();
    if (isErrorResponse(currentWeekTrips)) {
      return res
        .status(currentWeekTrips.errorCode)
        .json({
          error: currentWeekTrips.error,
          errorMessage: currentWeekTrips.errorMessage,
          errorSource: currentWeekTrips.errorSource,
        });
    }
    res.status(200).json({ currentWeekTrips });
  } catch (err) {
    return res
      .status(500)
      .json({
        error: "Error Occurred; Trip Months Not Retrieved",
        errorMessage: `${err}`,
        errorSource: "Trip Controller. Trip Months",
      });
  }
};

//GET CURRENT MONTH TRIP COUNT
export const getCurrentMonthTripCounts : Middleware = async (req, res) => {
  try {
    const tripCounts = await currentMonthTripsCountService();
    if (isErrorResponse(tripCounts)) {
      return res
        .status(tripCounts.errorCode)
        .json({
          error: tripCounts.error,
          errorMessage: tripCounts.errorMessage,
          errorSource: tripCounts.errorSource,
        });
    }
    res.status(200).json({ ...tripCounts });
  } catch (err) {
    return res
      .status(500)
      .json({
        error: "Error Occurred; Trip Months Not Retrieved",
        errorMessage: `${err}`,
        errorSource: "Trip Controller. Trip Months",
      });
  }
};

//GET TRIPS COUNT BY MONTHS (CURRENT + PREVIOUS MONTHS)
export const getTripsCountByMonth : Middleware = async (req, res) => {
  try {
    const {
      trip_column,
      month,
      package_type,
      trip_area,
      trip_medium,
      trip_type,
      trip_status,
    } = req.query;

    const tripProp =
      `${package_type}` || `${trip_area}` || `${trip_medium}` || `${trip_type}` || `${trip_status}`;

    const tripDataColumn = trip_column as string;
    const tripCounts = await tripsCountByMonth({tripDataColumn, condition: tripProp, month: month as MonthName});
    if (isErrorResponse(tripCounts)) {
      return res
        .status(tripCounts.errorCode)
        .json({
          error: tripCounts.error,
          errorMessage: tripCounts.errorMessage,
          errorSource: tripCounts.errorSource,
        });
    }
    res.status(200).json({ ...tripCounts });
  } catch (err) {
    return res
      .status(500)
      .json({
        error: "Error Occurred; Trip Months Not Retrieved",
        errorMessage: `${err}`,
        errorSource: "Trip Controller. Trip Months",
      });
  }
};

export const getTripRevenueByMonth : Middleware = async (req, res) => {
  try {
    const tripRevenue = await getRevenueByMonth();
    if (isErrorResponse(tripRevenue)) {
      return res
        .status(tripRevenue.errorCode)
        .json({
          error: tripRevenue.error,
          errorMessage: tripRevenue.errorMessage,
          errorSource: tripRevenue.errorSource,
        });
    }
    res.status(200).json({ ...tripRevenue });
  } catch (err) {
    return res
      .status(500)
      .json({
        error: "Error Occurred; Trip Revenue Not Retrieved",
        errorMessage: `${err}`,
        errorSource: "Trip Controller: Trip Revenue",
      });
  }
};
