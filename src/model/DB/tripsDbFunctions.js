import { PAYMENT_STATUS, USER_ID_TRIP, USER_ID_USER, FIRST_NAME, LAST_NAME, TRIP_ID_COLUMN } from "../../constants/tripConstants.js";
import { USERS_TABLE } from "../../constants/riderConstants.js";
import { errorHandler } from "../../utils/errorHandler.js";
import { DB } from "./connectDb.js";

export const getOneTrip = async (
  tripTableName,
  locationTableName,
  columnName,
  condition
) => {
  try {
    const value = [condition];
    const queryText = `SELECT 
    t.*, 
    tl.pick_lat, tl.pick_long, tl.drop_lat, tl.drop_long
FROM 
    ${tripTableName} t
FULL OUTER JOIN 
    ${locationTableName} tl 
ON 
    t.trip_id = tl.trip_id
WHERE 
    t.trip_id = $1;
`;

    const result = await DB.query(queryText, value);

    if (result.rowCount > 0) {
      return result.rows;
    } else {
      return errorHandler(
        "detail does not exist",
        null,
        404,
        "Database Functions"
      );
    }
  } catch (err) {
    
    return errorHandler(
      "Error occurred getting one Trip",
      `${err}`,
      500,
      " Database Trip Functions: Get One Trip"
    );
  }
};

export const tripsCount = async (tripTable, search) => {
  try {
    let queryText = `SELECT COUNT(*) AS total_count
FROM ${tripTable} 
FULL OUTER JOIN ${USERS_TABLE} 
ON ${USER_ID_TRIP} = ${USER_ID_USER} 
WHERE ${TRIP_ID_COLUMN} IS NOT NULL;
`;


    const values = [];

    if (search) {
      values.push(`%${search}%`);
      queryText = `
    SELECT COUNT(*) AS total_count
FROM ${tripTable} 
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
      "Error occurred getting trip count",
      `${err}`,
      500,
      "Trips Database Functions: Getting trips count"
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
      "Error occurred getting one week trip counts",
      `${err}`,
      500,
      "Database Functions: One Week Trip Counts"
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
      "Error occurred getting months",
      `${err}`,
      500,
      "Trips Months DB Functions"
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
      "Error occurred getting revenue",
      `${err}`,
      500,
      "DB Functions: Get Trip Revenue By Month"
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
      "Error occurred getting revenue",
      `${err}`,
      500,
      "DB Functions: Get Trip Count By Month"
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
    //by month name
    // const currentMonthNameQuery = `
    //   SELECT TO_CHAR(CURRENT_DATE, 'Month') AS current_month,
    //          TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'Month') AS previous_month;
    // `;
    // const monthNamesResult = await DB.query(currentMonthNameQuery);
    // const { current_month, previous_month } = monthNamesResult.rows[0];
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
      "Error occurred getting previous two months trip counts",
      `${err}`,
      500,
      "Database Functions (Two Months Trips)"
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
      "Error occurred getting two Months Trip",
      `${err}`,
      500,
      "Database Functions (Two Months Trips)"
    );
  }
};

export const getTripsCustomersJoin = async (
  tripTable,
  usersTable,
  firstName,
  lastName,
  userIdUser,
  userIdTrip,
  tripId,
  limit,
  offset,
  sortColumn,
  sortDirection = "ASC",
  search
) => {
  try {
    const values = [];
    let queryText = `SELECT ${tripTable}.*, ${firstName}, 
      ${lastName} FROM ${tripTable} FULL OUTER JOIN 
      ${usersTable} ON ${userIdTrip} = ${userIdUser} 
      WHERE ${tripId} IS NOT NULL ORDER BY ${sortColumn} 
      ${sortDirection} LIMIT ${limit} OFFSET ${offset};`;

    if (search) {
      values.push(`%${search}%`);
      queryText = `
    SELECT ${tripTable}.*, ${firstName}, 
      ${lastName} FROM ${tripTable} FULL OUTER JOIN 
      ${usersTable} ON ${userIdTrip} = ${userIdUser} 
      WHERE ${tripId} IS NOT NULL AND ( 
    trip_id ILIKE $1 OR
    ${firstName} ILIKE $1 OR
    ${lastName} ILIKE $1 OR
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
      "Error occurred getting customer trips",
      `${err}`,
      500,
      "Database Functions"
    );
  }
};

export const getIDsAndMedium = async (tripId)=> {
  const value = [tripId]
  try {
    const queryText = 'SELECT dispatcher_id as dispatcher_id, customer_id as customer_id, trip_medium as trip_medium FROM trips WHERE trip_id = $1';
    const IDsAndMedium = await DB.query(queryText, value);
    if(IDsAndMedium.rowCount < 1) {
      return errorHandler("dispatcherId not found", null, 404, "Trips DB Functions: Get Dispatcher Id")
    }
    if(IDsAndMedium.rowCount > 0) {
      
      return IDsAndMedium.rows[0];
    }
  } catch (err) {
    return errorHandler( 
      "Error occurred getting dispatcherId", 
      `${err}`,
      500,
      "Trips DB Functions"
    )
  }
}