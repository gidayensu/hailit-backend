import { DB } from "./connectDb.js";
import { errorHandler } from "../../utils/errorHandler.js";
import { TRIP_STATUS, PAYMENT_STATUS } from "../../constants/tripConstants.js";



export const getOneTrip = async (tripTableName, locationTableName, columnName, condition) => {
  try {
    const value = [condition]
    const  queryText = `SELECT 
    t.*, 
    tl.*
FROM 
    trips t
FULL OUTER JOIN 
    trip_locations tl 
ON 
    t.trip_id = tl.trip_id
WHERE 
    t.trip_id = $1;
`

    const result = await DB.query(queryText, value);

    if (result.rowCount > 0) {
      console.log(result.rows)
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
    console.log({err})
    return errorHandler("Error occurred getting one Trip", `${err}`, 500, " Database Trip Functions: Get One Trip");
  }
};

export const upToOneWeekTripCounts = async () => {
  try {


    let queryText = `with
  date_series as (
    select
      current_date - interval '6 days' + i * interval '1 DAY' as trip_date
    from
      generate_series(0, 6) as s (i)
  )
select
  ds.trip_date,
  count(t.trip_request_date) as total_count
from
  date_series ds
  left join trips t on DATE (t.trip_request_date) = ds.trip_date
where
  ds.trip_date >= current_date - interval '6 days'
group by
  ds.trip_date
order by
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
    const values = [ true];
    const queryText = `SELECT
    TRIM(TO_CHAR(trip_request_date, 'Month')) AS month,
    SUM(trip_cost) AS revenue
  FROM trips WHERE
   ${PAYMENT_STATUS} = $1
  GROUP BY TRIM(TO_CHAR(trip_request_date, 'Month'))`;
        
    const data = await DB.query(queryText, values);
    return data.rows;
  }catch (err) {
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
    if(condition && dataColumn ) {
      values.push(condition)
       queryText = `SELECT
        TRIM(TO_CHAR(trip_request_date, 'Month')) AS month,
        COUNT(*) AS trip_count
      FROM trips
      WHERE ${dataColumn} = $1
      GROUP BY TRIM(TO_CHAR(trip_request_date, 'Month'))`;
    }
    if (condition  && dataColumn && month) {
      values.push(month)
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
  offset = 0,
  orderColumn,
  orderDirection, 
) => {
  try {
    const allTrips = await DB.query(
      `SELECT ${tripTable}.*, ${firstName}, 
      ${lastName} FROM ${tripTable} FULL OUTER JOIN 
      ${usersTable} ON ${userIdTrip} = ${userIdUser} 
      WHERE ${tripId} IS NOT NULL ORDER BY ${orderColumn} 
      ${orderDirection} LIMIT ${limit} OFFSET ${offset};`
    );
    
    
    

    const trips = allTrips.rows;
    return trips;
  } catch (err) {
    return errorHandler("Error occurred getting customer trips", `${err}`, 500, "Database Functions");
  }
};
