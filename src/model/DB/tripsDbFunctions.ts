import { USERS_TABLE } from "../../constants/riderConstants";
import { FIRST_NAME, LAST_NAME, LOCATION_TABLE_NAME, PAYMENT_STATUS, TRIP_ID_COLUMN, TRIP_TABLE_NAME, USER_ID_TRIP, USER_ID_USER } from "../../constants/tripConstants";
import { GetAllFromDB } from "../../types/getAll.types";
import { errorHandler } from "../../utils/errorHandler";
import { DB } from "./connectDb";

export const getOneTrip = async (condition: string) => {
  try {
    const value = [condition];
    const queryText = `SELECT 
    t.*, 
    tl.pick_lat, tl.pick_long, tl.drop_lat, tl.drop_long
FROM 
    ${TRIP_TABLE_NAME} t
FULL OUTER JOIN 
    ${LOCATION_TABLE_NAME} tl 
ON 
    t.trip_id = tl.trip_id
WHERE 
    t.trip_id = $1;
`;

    const result = await DB.query(queryText, value);

    if (result.rowCount > 0) {
      return result.rows;
    } else {
      return errorHandler({
        error: "Detail does not exist",
        errorMessage: null,
        errorCode: 404,
        errorSource: "Database Functions",
      });
    }
  } catch (err) {
    return errorHandler({
      error: "Error occurred getting one Trip",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Database Trip Functions: Get One Trip",
    });
  }
};

export const tripsCount = async (search:string) => {
  try {
    let queryText = `SELECT COUNT(*) AS total_count
FROM ${TRIP_TABLE_NAME} 
FULL OUTER JOIN ${USERS_TABLE} 
ON ${USER_ID_TRIP} = ${USER_ID_USER} 
WHERE ${TRIP_ID_COLUMN} IS NOT NULL;
`;


    const values = [];

    if (search) {
      values.push(`%${search}%`);
      queryText = `
    SELECT COUNT(*) AS total_count
FROM ${TRIP_TABLE_NAME} 
FULL OUTER JOIN ${USERS_TABLE} 
ON ${USER_ID_TRIP} = ${USER_ID_USER} 
WHERE ${TRIP_ID_COLUMN} IS NOT NULL AND ( 
    ${FIRST_NAME} ILIKE $1 OR
    ${LAST_NAME} ILIKE $1 OR
    trips.trip_id ILIKE $1 OR
    trips.trip_medium ILIKE $1 OR
    trips.trip_status ILIKE $1 OR
    trips.trip_type ILIKE $1 OR
    trips.package_type ILIKE $1 OR
    trips.pickup_location ILIKE $1 OR
    trips.drop_off_location ILIKE $1 OR
    trips.additional_information ILIKE $1 OR    
    trips.payment_method ILIKE $1 OR
    trips.dispatcher_id ILIKE $1 OR
    trips.trip_area ILIKE $1 OR
    trips.recipient_number ILIKE $1 OR
    trips.sender_number ILIKE $1)
  `;
    }

    const tripsCount = await DB.query(queryText, values);
    const data = tripsCount.rows;

    return data[0];
  } catch (err) {
    return errorHandler(
      {
        error: "Error occurred getting trip count",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Trips Database Functions: Getting trips count"
      }
      
    );
  }
};

export const upToOneWeekTripCounts = async () => {
  try {
    let queryText = `WITH
  date_series as (
    SELECT
      CURRENT_DATE - INTERVAL '6 days' + i * INTERVAL '1 DAY' AS trip_date
    FROM
      generate_series(0, 6) AS s (i)
  )
SELECT
  ds.trip_date,
  count(t.trip_request_date) AS total_count
from
  date_series ds
  left join trips t on DATE (t.trip_request_date) = ds.trip_date
WHERE
  ds.trip_date >= CURRENT_DATE - INTERVAL '6 days'
GROUP BY
  ds.trip_date
ORDER BY
  ds.trip_date;
`;

    const data = await DB.query(queryText);

    return data.rows;
  } catch (err) {
    return errorHandler(
      {
        error: "Error occurred getting one week trip counts",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Database Functions: One Week Trip Counts"
      }
      
    );
  }
};

export const getTripsMonths = async () => {
  try {
    const queryText =
      "SELECT DISTINCT TRIM(TO_CHAR(trip_request_date, 'Month')) AS month FROM trips";
    const months = await DB.query(queryText);
    return months.rows;
  } catch (err) {
    return errorHandler(
      {
        error: "Error occurred getting months",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Trips Months DB Functions"
      }
      
    );
  }
};

export const getRevenueByMonth = async () => {
  try {
    const values = [true];
    const queryText = `SELECT
    TRIM(TO_CHAR(trip_request_date, 'Month')) AS month,
    SUM(trip_cost) AS revenue
  FROM trips WHERE
   ${PAYMENT_STATUS} = $1
  GROUP BY TRIM(TO_CHAR(trip_request_date, 'Month'))`;

    const data = await DB.query(queryText, values);
    return data.rows;
  } catch (err) {
    return errorHandler(
      {
        error: "Error occurred getting revenue",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "DB Functions: Get Trip Revenue By Month"
      }
      
    );
  }
};

export const getCountByMonth = async (dataColumn, condition, month) => {
  try {
    const values = [];
    let queryText = `SELECT
        TRIM(TO_CHAR(trip_request_date, 'Month')) AS month,
        COUNT(*) AS trip_count
      FROM trips
      GROUP BY TRIM(TO_CHAR(trip_request_date, 'Month'))`;
    if (condition && dataColumn) {
      values.push(condition);
      queryText = `SELECT
        TRIM(TO_CHAR(trip_request_date, 'Month')) AS month,
        COUNT(*) AS trip_count
      FROM trips
      WHERE ${dataColumn} = $1
      GROUP BY TRIM(TO_CHAR(trip_request_date, 'Month'))`;
    }
    if (condition && dataColumn && month) {
      values.push(month);
      queryText = `SELECT TRIM(TO_CHAR(trip_request_date, 'Month')) AS month, COUNT(*) AS trip_count FROM trips WHERE ${dataColumn} = $1 AND TRIM(TO_CHAR(trip_request_date, 'Month')) = $2 GROUP BY TO_CHAR(trip_request_date, 'Month')`;
    }

    const data = await DB.query(queryText, values);

    return data.rows;
  } catch (err) {
    return errorHandler(
      {
        error: "Error occurred getting revenue",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "DB Functions: Get Trip Count By Month"
      }
      
    );
  }
};

export const getPreviousTwoMonthsCounts = async (
  tripTable,
  requestDateColumn,
  tripStatusColumn,
  tripCostColumn,
  paymentStatusColumn
) => {
  try {
    
    const values = ["Delivered", "Cancelled", true];
    const queryText = `
    SELECT
      CAST(COUNT(*) FILTER (
        WHERE TO_CHAR(${requestDateColumn}, 'Month') = TO_CHAR(CURRENT_DATE, 'Month')
      ) AS INTEGER) AS "total_trips_current_month",
      CAST(COUNT(*) FILTER (
        WHERE TO_CHAR(${requestDateColumn}, 'Month') = TO_CHAR(CURRENT_DATE, 'Month') AND ${tripStatusColumn} = $1
      ) AS INTEGER) AS "delivered_current_month",
      CAST(COUNT(*) FILTER (
        WHERE TO_CHAR(${requestDateColumn}, 'Month') = TO_CHAR(CURRENT_DATE, 'Month') AND ${tripStatusColumn} = $2
      ) AS INTEGER) AS "cancelled_current_month",
      CAST(SUM(${tripCostColumn}) FILTER (
        WHERE TO_CHAR(${requestDateColumn}, 'Month') = TO_CHAR(CURRENT_DATE, 'Month') AND ${paymentStatusColumn} = $3
      ) AS FLOAT) AS "revenue_current_month",
      CAST(COUNT(*) FILTER (
        WHERE TO_CHAR(${requestDateColumn}, 'Month') = TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'Month')
      ) AS INTEGER) AS "total_trips_previous_month",
      CAST(COUNT(*) FILTER (
        WHERE TO_CHAR(${requestDateColumn}, 'Month') = TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'Month') AND ${tripStatusColumn} = $1
      ) AS INTEGER) AS "delivered_previous_month",
      CAST(COUNT(*) FILTER (
        WHERE TO_CHAR(${requestDateColumn}, 'Month') = TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'Month') AND ${tripStatusColumn} = $2
      ) AS INTEGER) AS "cancelled_previous_month",
      CAST(SUM(${tripCostColumn}) FILTER (
        WHERE TO_CHAR(${requestDateColumn}, 'Month') = TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'Month') AND ${paymentStatusColumn} = $3
      ) AS FLOAT) AS "revenue_previous_month"
    FROM
      ${tripTable};
  `;
    const selectedTrips = await DB.query(queryText, values);
    return selectedTrips.rows[0];
  } catch (err) {
    return errorHandler(
      {
        error: "Error occurred getting previous two months trip counts",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Database Functions (Two Months Trips)"
      }
      
    );
  }
};

export const getTwoMonthsTrip = async (tripTable, requestDateColumn) => {
  try {
    const queryText = `SELECT
    COUNT(*) FILTER (
      WHERE
        TO_CHAR(${requestDateColumn}, 'Month') = TO_CHAR(CURRENT_DATE, 'Month')
    ) AS TO_CHAR(CURRENT_DATE, 'Month'),
    COUNT(*) FILTER (
      WHERE
        TO_CHAR(${requestDateColumn}, 'Month') = TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'Month')
    ) AS previous_month_count
  FROM
    ${tripTable};
  `;
    const selectedTrips = await DB.query(queryText);
    return selectedTrips.rows;
  } catch (err) {
    return errorHandler(
      {
        error: "Error occurred getting two months trip",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Database Functions (Two Months Trips)"
      }
      
    );
  }
};

export const getTripsCustomersJoin = async (  
  {limit,
  offset,
  sortColumn,
  sortDirection = "ASC",
  search}: GetAllFromDB
) => {
  try {
    const values = [];
    let queryText = `SELECT ${TRIP_TABLE_NAME}.*, ${FIRST_NAME}, 
      ${LAST_NAME} FROM ${TRIP_TABLE_NAME} FULL OUTER JOIN 
      ${USERS_TABLE} ON ${USER_ID_TRIP} = ${USER_ID_USER} 
      WHERE ${TRIP_ID_COLUMN} IS NOT NULL ORDER BY ${sortColumn} 
      ${sortDirection} LIMIT ${limit} OFFSET ${offset};`;

    if (search) {
      values.push(`%${search}%`);
      queryText = `
    SELECT ${TRIP_TABLE_NAME}.*, ${FIRST_NAME}, 
      ${LAST_NAME} FROM ${TRIP_TABLE_NAME} FULL OUTER JOIN 
      ${USERS_TABLE} ON ${USER_ID_TRIP} = ${USER_ID_USER} 
      WHERE ${TRIP_ID_COLUMN} IS NOT NULL AND ( 
    trip_id ILIKE $1 OR
    ${FIRST_NAME} ILIKE $1 OR
    ${LAST_NAME} ILIKE $1 OR
    trips.trip_medium ILIKE $1 OR
    trips.trip_status ILIKE $1 OR
    trips.trip_type ILIKE $1 OR
    trips.package_type ILIKE $1 OR
    trips.pickup_location ILIKE $1 OR
    trips.drop_off_location ILIKE $1 OR
    trips.additional_information ILIKE $1 OR
    trips.payment_method ILIKE $1 OR
    trips.dispatcher_id ILIKE $1 OR
    trips.trip_area ILIKE $1 OR
    trips.recipient_number ILIKE $1 OR
    trips.sender_number ILIKE $1)
ORDER BY ${sortColumn} ${sortDirection.toUpperCase()}
LIMIT ${limit} OFFSET ${offset};`;
    }

    const allTrips = await DB.query(queryText, values);
    const trips = allTrips.rows;
    return trips;
  } catch (err) {
    return errorHandler(
      {
        error: "Error occurred getting customer trips",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Database Functions"
      }
      
    );
  }
};

export const getIDsAndMedium = async (tripId:string)=> {
  const value = [tripId]
  try {
    const queryText = 'SELECT dispatcher_id as dispatcher_id, customer_id as customer_id, trip_medium as trip_medium FROM trips WHERE trip_id = $1';
    const IDsAndMedium = await DB.query(queryText, value);
    if(IDsAndMedium.rowCount < 1) {
      return errorHandler({
        error: "dispatcherId not found",
        errorMessage: null,
        errorCode: 404,
        errorSource: "Trips DB Functions: Get Dispatcher Id"
      }
      )
    }
    if(IDsAndMedium.rowCount > 0) {
      
      return IDsAndMedium.rows[0];
    }
  } catch (err) {
    return errorHandler( 
      {
        error: "Error occurred getting dispatcherId",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Trips DB Functions"
      }
      
    )
  }
}