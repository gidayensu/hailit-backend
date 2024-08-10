import {
  ALLOWED_ADD_TRIP_PROPERTIES,
  ALLOWED_PACKAGE_TYPES,
  ALLOWED_TRIP_AREAS,
  ALLOWED_TRIP_MEDIUMS,
  ALLOWED_TRIP_TYPES
} from "../../constants/tripConstants.js";
import { allowedPropertiesOnly, isRightValue } from "../../utils/util.js";

export const addTripValidation = async (req, res, next) => {

  const errors = [];
  const {
    trip_medium,
    trip_type,
    package_type,
    trip_area,
    drop_off_location,
    pickup_location,
    pick_lat,
    trip_cost,
    pick_long,
    drop_lat,
    drop_long,
    payment_method,
  } = req.body;

  const errorReturner = (errorMessage) => {
    !errorMessage ? null : errors.push({ error: errorMessage });
  };

  //missing values
  !trip_medium && errorReturner(errors, "Trip medium not provided");
  !trip_type && errorReturner("Trip type not provided");
  !package_type && errorReturner("Package type not provided");
  !trip_area && errorReturner("Trip area not provided");
  
  !trip_cost && errorReturner("Trip Cost not provided");
  !payment_method && errorReturner("Payment method not provided");
  !drop_off_location && errorReturner("Drop off location not provided");
  !pickup_location && errorReturner("Pickup location not provided");
  !pick_lat && errorReturner("Pickup latitude not provided");
  !pick_long && errorReturner("Pickup longitude not provided");
  !drop_lat && errorReturner("Dropoff latitude not provided");
  !drop_long && errorReturner("Dropoff longitude not provided");

  if (
    errors.length > 0
  ) {
    return res.status(400).json({
      errors,
    });
  }

  //wrong values
  const validTripMedium = isRightValue(trip_medium, ALLOWED_TRIP_MEDIUMS);
  const validTripArea = isRightValue(trip_area, ALLOWED_TRIP_AREAS);
  const validPackageType = isRightValue(package_type, ALLOWED_PACKAGE_TYPES);
  const validTripType = isRightValue(trip_type, ALLOWED_TRIP_TYPES);
  // const validTripStatus = isRightValue(trip_status, ALLOWED_TRIP_STATUS);

  !validTripMedium && errorReturner(`Wrong trip medium provided. Trip medium should be one of these: ${[...ALLOWED_TRIP_MEDIUMS ]}`);
  !validTripArea && errorReturner(`Wrong trip area provided. Trip area should be one of these: ${[...ALLOWED_TRIP_AREAS]}`);
  !validPackageType && errorReturner(`Wrong package type provided. Package type should be one of these: ${[...ALLOWED_PACKAGE_TYPES]}`);
  !validTripType && errorReturner(`Wrong trip type provided. Trip type should be one of these: ${[...ALLOWED_TRIP_TYPES]}`);
  // !validTripStatus && errorReturner("Wrong trip status provided");

  if (
    errors.length > 0 
    
  ) {
    return res.status(400).json({
      errors,
    });
  }

  const tripDetails = req.body;

  const validTripDetails = allowedPropertiesOnly(
    tripDetails,
    ALLOWED_ADD_TRIP_PROPERTIES
  );
  req.body = validTripDetails;
  
    
  next();
};
