import {
  ALLOWED_TRIP_STATS_COLUMNS,
  MONTH_ORDER,
  ALLOWED_PACKAGE_TYPES,
  ALLOWED_TRIP_AREAS,
  ALLOWED_TRIP_MEDIUMS,
  ALLOWED_TRIP_TYPES,
  ALLOWED_TRIP_STATUS,
} from "../constants/tripConstants.js";



//validated requested property


export const tripStatsColumnValidation = async (req, res, next) => {
  const {
    month,
    trip_column,
    package_type,
    trip_area,
    trip_medium,
    trip_type,
    trip_status,
  } = req.query;
  
  const validateTripStatsRequest = (
    tripProp,
    allowedValues,
    errorMessage, 
    errors
  ) => {
    
  
    if (tripProp && !allowedValues.includes(tripProp)) {
      
      errors.push({error: errorMessage})
    }
  
    if(tripProp && !req.query.hasOwnProperty(tripProp ) && ALLOWED_TRIP_STATS_COLUMNS.includes(tripProp) ) {
      errors.push({error: `${tripProp} condition not included or wrong condition provided`})
    }
  };
  
  const errors = [];
  //Column
  validateTripStatsRequest(
    trip_column,
    ALLOWED_TRIP_STATS_COLUMNS,
    `Invalid trip column: ${trip_column} requested: Trip Stats`,
    errors
  );

  //Month
  validateTripStatsRequest(
    month,
    MONTH_ORDER,
    `Invalid month: ${month} requested: Trip Stats`,
    errors
  );

  //Package Type
  validateTripStatsRequest(
    package_type,
    ALLOWED_PACKAGE_TYPES,
    "Invalid package type requested",
    errors
  );

  //Trip Area
  validateTripStatsRequest(
    trip_area,
    ALLOWED_TRIP_AREAS,
    "Invalid trip area requested",
    errors
  );

  //Trip Medium
  validateTripStatsRequest(
    trip_medium,
    ALLOWED_TRIP_MEDIUMS,
    "Invalid trip medium requested",
    errors
  );

  //Trip Type
  validateTripStatsRequest(
    trip_type,
    ALLOWED_TRIP_TYPES,
    "Invalid trip type requested",
    errors
  );

  //Trip Status
  validateTripStatsRequest(
    trip_status,
    ALLOWED_TRIP_STATUS,
    "Invalid trip status  requested",
    errors
  );



  if(errors.length >= 1) {
    return res.status(400).json(errors);
  }
  next();
};
