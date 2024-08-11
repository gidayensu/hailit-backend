import {
  ALLOWED_PACKAGE_TYPES,
  ALLOWED_TRIP_AREAS,
  ALLOWED_TRIP_MEDIUMS,
  ALLOWED_TRIP_STATUS,
  ALLOWED_TRIP_TYPES,
  ALLOWED_UPDATE_PROPERTIES,
} from "../../constants/tripConstants.js";
import { allowedPropertiesOnly, isRightValue } from "../../utils/util.js";
import { Middleware } from "../../types/middleware.types.js";

export const updateTripValidation: Middleware = async(req, res, next) => {

  const errors = [];
  const {
    trip_medium,
    trip_type,
    package_type,
    trip_area,
    trip_status
    
  } = req.body;

  const errorReturner = (errorMessage) => {
    !errorMessage ? null : errors.push({ error: errorMessage });
  };


  //wrong values
  const validTripMedium = isRightValue(trip_medium, ALLOWED_TRIP_MEDIUMS);
  const validTripArea = isRightValue(trip_area, ALLOWED_TRIP_AREAS);
  const validPackageType = isRightValue(package_type, ALLOWED_PACKAGE_TYPES);
  const validTripType = isRightValue(trip_type, ALLOWED_TRIP_TYPES);
  const validTripStatus = isRightValue(trip_status, ALLOWED_TRIP_STATUS);

  !validTripMedium &&  errorReturner(`Wrong trip medium provided. Trip medium should be one of these: ${[...ALLOWED_TRIP_MEDIUMS ]}`);
  !validTripArea &&  errorReturner(`Wrong trip area provided. Trip area should be one of these: ${[...ALLOWED_TRIP_AREAS]}`);
  !validPackageType && errorReturner(`Wrong package type provided. Package type should be one of these: ${[...ALLOWED_PACKAGE_TYPES]}`);
  !validTripType &&  errorReturner(`Wrong trip type provided. Trip type should be one of these: ${[...ALLOWED_TRIP_TYPES]}`);
  !validTripStatus  && errorReturner(`Wrong trip status provided. Trip status should be one of these: ${[...ALLOWED_TRIP_STATUS]}`);

  if (
    (!validTripMedium && trip_medium) ||
    (!validPackageType && package_type) ||
    (!validTripArea && trip_area) ||
    (!validTripType && trip_type) ||
    (!validTripStatus &&  trip_status)
        
  ) {
    return res.status(400).json({
      errors,
    });
  }

  const tripDetails = req.body;

  const validTripDetails = allowedPropertiesOnly(
    tripDetails,
    ALLOWED_UPDATE_PROPERTIES
  );
  req.body = validTripDetails;
  
    
  next();
};
