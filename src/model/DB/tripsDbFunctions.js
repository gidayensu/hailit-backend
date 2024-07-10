import { DB } from "./connectDb.js";
import { errorHandler } from "../../utils/errorHandler.js";

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
      "Error occurred",
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
export const getCountByMonth = async (dataColumn, condition, month) => {
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
      "Error occurred",
      `${err}`,
      500,
      "Database Functions (Two Months Trips)"
    );
  }
};

export const getTwoMonthsTrip = async (tripTable, requestDateColumn) => {
  try {
    const queryTexta = `SELECT
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
      "Error occurred",
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
    return errorHandler("Error occurred", `${err}`, 500, "Database Functions");
  }
};
