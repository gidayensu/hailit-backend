import {addTripService, deleteTripService, getAllTripsService, getUserTripsService, rateTripService, updateTripService, getOneTripService} from "../services/trip.service.js";

export const getAllTrips = async (req, res) => {
  try {
    const limit = req.query.limit;
    const allTrips = await getAllTripsService(limit);
    
    if(allTrips.error) {
      return res.status(allTrips.errorCode).json({error: allTrips.error, errorMessage: allTrips.errorMessage, errorLocation: allTrips.errorLocation})
    }
    res.status(200).json({ trips: allTrips });
  } catch (err) {
    return res.status(500).json({ error: "Server Error occurred", errorMessage: err, errorLocation: "Trip Controller" });
  }
};

export const getOneTrip = async (req, res) => {
  
  try {
        
    const { trip_id } = req.params;
    
    
    const oneTrip = await getOneTripService(trip_id);
    
    if (oneTrip.error) {
      return res.status(400).json({error: oneTrip.error, errorMessage: oneTrip.errorMessage, errorLocation: oneTrip.errorLocation})
    }
    res.status(200).json({ trip: oneTrip });
  } catch (err) {
    
    return res
      .status(500)
      .json({ error: "Server Error occurred", errorMessage: err, errorLocation: "Trip Controller" });
  }
};

export const getUserTrips = async (req, res) => {
  try {
    const { user_id } = req.params;
    
    const userTrips = await getUserTripsService(user_id);
    if (userTrips.error) {
      return res.status(400).json({error: userTrips.error, errorMessage: userTrips.errorMessage, errorLocation: userTrips.errorLocation})
    }
    res.status(200).json({ trips: userTrips });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server Error occurred", errorMessage: err, errorLocation: "Trip Controller" });
  }
};

export const addTrip = async (req, res) => {
  ///trip amount, trip_status, driver_id, trip_date, total amount, payment_status, delivery_time, payment_method, dispatcher_rating, rating_comment will be added in the service layer based on certain conditions
  
  try {
  
    const { trip_medium, trip_type, package_type, drop_off_location, pickup_location } =
      req.body;
    if (!trip_medium || !trip_type || !package_type || !drop_off_location || !pickup_location) {
  
      return res.status(400).json({
        error:
          "Provide all details: trip type, trip medium, sender number, recipient number, and package type",
      });
    }
  
    if (trip_medium) {
      const acceptedTripMediums = ["Motor", "Car", "Truck"];
      const validTripMedium = acceptedTripMediums.includes(trip_medium);
      if (!validTripMedium) {
        return res.status(403).json({ error: "Trip Medium Invalid" });
      }
    }
    const tripDetails = req.body;
    const  user_id  = req.user?.user_id || '92e6ff67-a1d0-4f56-830c-60d23a63913d';
    
    const tripAdded = await addTripService(user_id, tripDetails);
    if (tripAdded.error) {
      return res.status(400).json({error: tripAdded.error, errorMessage: tripAdded.errorMessage, errorLocation: tripAdded.errorLocation} );
    }
    res.status(200).json({trip: tripAdded})
  } catch (err) {
    
    return res
      .status(500)
      .json({ error: "Server Error occurred", errorMessage: err, errorLocation: "Trip Controller" });
  }
};

export const updateTrip = async (req, res) => {
  try {
    const { trip_id } = req.params;
    const tripDetails = { trip_id, ...req.body };
    
    const tripUpdate = await updateTripService(tripDetails);
    if(tripUpdate.error) {
      return res.status(403).json({error: tripUpdate.error, errorMessage: tripUpdate.errorMessage, errorLocation: tripUpdate.errorLocation})
    }
    
      res.status(200).json({trip: tripUpdate} );
    
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server Error occurred", errorMessage: err, errorLocation: "Trip Controller" });
  }
};

export const rateTrip = async (req, res) => {
  try {
    
    const ratingDetails = req.body;
    const { trip_id } = req.params;
    const detailsWithId = { trip_id, ...ratingDetails };
    const { dispatcher_rating } = req.body;
    if(typeof dispatcher_rating !== "number") {
      return res.status(403).json({ error: "Rating must be a number" });
    }
    if (!dispatcher_rating ) {
      return res.status(403).json({ error: "Driver/rider details missing" });
    }

    const tripRating = await rateTripService(detailsWithId);
    if(tripRating.error) {
      return res.status(400).json({error: tripRating.error, errorMessage: tripRating.errorMessage, errorLocation: tripRating.errorLocation})
    }
    
      res.status(200).json(tripRating);
    
    
    
  } catch (err) {
    return res.status(500).json({ error: "Server Error occurred", errorMessage: err, errorLocation: "Trip Controller" });
  }
};

export const deleteTrip = async (req, res) => {
  try {
    const { trip_id } = req.params;
    const tripDelete = await deleteTripService(trip_id);
    if (tripDelete) {
      res.status(200).json({ success: "trip deleted" });
    } else {
      res.status(400).json({ error: "trip not deleted" });
    }
  } catch (err) {
    return res.status(500).json({error:"Error Occurred; Rider Not Deleted", errorMessage: err, errorLocation: "Trip Controller"});
  }
};
