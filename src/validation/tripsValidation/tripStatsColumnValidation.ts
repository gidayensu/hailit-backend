import {
  ALLOWED_PACKAGE_TYPES,
  ALLOWED_TRIP_AREAS,
  ALLOWED_TRIP_MEDIUMS,
  ALLOWED_TRIP_STATS_COLUMNS,
  ALLOWED_TRIP_STATUS,
  ALLOWED_TRIP_TYPES,
  MONTH_ORDER,
} from "../../constants/tripConstants";
import { Middleware } from "../../types/middleware.types";
import { ErrorMessage } from "../../types/shared.types";

//validated requested property

export const tripStatsColumnValidation: Middleware = async(req, res, next) => {
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
    {tripProp,
    allowedValues,
    errorMessage, 
    errors} : {
      tripProp: string,
    allowedValues: string[],
    errorMessage: string, 
    errors: ErrorMessage[]
    }
  ) => {
    
  
    if (tripProp && !allowedValues.includes(tripProp)) {
      
      errors.push({error: errorMessage})
    }
  
    if(tripProp && !req.query.hasOwnProperty(tripProp ) && ALLOWED_TRIP_STATS_COLUMNS.includes(tripProp) ) {
      errors.push({error: `${tripProp} condition not included or wrong condition provided`})
    }
  };
  
  const errors: ErrorMessage[] = [];
  //Column
  validateTripStatsRequest(
    {tripProp: `${trip_column}`,
    allowedValues: ALLOWED_TRIP_STATS_COLUMNS,
    errorMessage: `Invalid trip column: ${trip_column} requested: Trip Stats`,
    errors}
  );

  //Month
  validateTripStatsRequest({
    tripProp: `${month}`,
    allowedValues: MONTH_ORDER,
    errorMessage: `Invalid month: ${month} requested: Trip Stats`,
    errors
});


  //Package Type
  validateTripStatsRequest({
    tripProp: `${package_type}`,
    allowedValues: ALLOWED_PACKAGE_TYPES,
    errorMessage: "Invalid package type requested",
    errors
});


  //Trip Area
  validateTripStatsRequest({
    tripProp: `${trip_area}`,
    allowedValues: ALLOWED_TRIP_AREAS,
    errorMessage: "Invalid trip area requested",
    errors
});


  //Trip Medium
  validateTripStatsRequest({
    tripProp: `${trip_medium}`,
    allowedValues: ALLOWED_TRIP_MEDIUMS,
    errorMessage: "Invalid trip medium requested",
    errors
});


  //Trip Type
  validateTripStatsRequest({
    tripProp: `${trip_type}`,
    allowedValues: ALLOWED_TRIP_TYPES,
    errorMessage: "Invalid trip type requested",
    errors
});

  //Trip Status
  validateTripStatsRequest({
    tripProp: `${trip_status}`,
    allowedValues: ALLOWED_TRIP_STATUS,
    errorMessage: "Invalid trip status requested",
    errors
});



  if(errors.length >= 1) {
    return res.status(400).json(errors);
  }
  next();
};
