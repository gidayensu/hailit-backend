import { allowedPropertiesOnly } from "../utils/util.js";
import { ALLOWED_ADD_TRIP_PROPERTIES } from "../constants/tripConstants.js";

export const addTripValidation = async (req, res, next)=> {
  const errors = [];
    const { trip_medium, trip_type, package_type, drop_off_location, pickup_location, pick_lat, trip_cost, pick_long, drop_lat, drop_long, payment_method } =
    req.body;

    !trip_medium ? errors.push({error: `Trip medium not provided`}) : ''
    !trip_type ? errors.push({error: `Trip type not provided`}): ''
    !package_type ? errors.push({error: `Package type not provided`}): ''
    !trip_cost ? errors.push({error: `Trip Cost not provided`}): ''
    !payment_method ? errors.push({error: `Payment method not provided`}): ''
    !drop_off_location ? errors.push({error: `Drop off location not provided`}): ''
    !pickup_location ? errors.push({error: `Pickup location not provided`}): ''
    !pick_lat ? errors.push({error: `Pickup latitude not provided`}): ''
    !pick_long ? errors.push({error: `Pickup longitude not provided`}): ''
    !drop_lat ? errors.push({error: `Dropoff latitude not provided`}): ''
    !drop_long ? errors.push({error: `Dropoff longitude not provided`}): ''
    
  
    if (
      !trip_medium ||
      !trip_type ||
      !package_type ||
      !drop_off_location ||
      !pickup_location ||
      !pick_lat ||
      !pick_long ||
      !drop_lat ||
      !drop_long ||
      !trip_cost ||
      !payment_method
    ) {
      return res.status(400).json({
        errors,
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

  const validTripDetails = allowedPropertiesOnly(tripDetails, ALLOWED_ADD_TRIP_PROPERTIES);
  req.body = validTripDetails
  const trip = req.body;
  console.log({trip})
  

    next();
}



