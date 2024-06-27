import { DB } from "./connectDb.js";
import { errorHandler } from "../utils/errorHandler.js";




export const getCountOnOneCondition = async (tableName, condition, conditiFlumn)=> {
  try {
    let queryText = `SELECT COUNT(*) AS total_count FROM ${tableName}`;
    const values = [];

    if (condition) {
      queryText += ` WHERE ${conditionColumn} = $1`;
      values.push(condition);
    }

    const data = await DB.query(queryText, values);
    
    return data.rows[0];

  } catch (err) {
    return errorHandler("Error occurred", `${err}`, 500, "Database Functions: One Condition Count");    
  }
}
// export const getCountByMonth = async () => {
//   const months = ['April','May','June', 'July']
//   const values = months.map(month => month.trim());
//   const queryText = `SELECT
//   TRIM(TO_CHAR(trip_request_date, 'Month')) AS month,
//   COUNT(*) AS trip_count
// FROM trips
// WHERE trip_medium = 'Motor' AND TRIM(TO_CHAR(trip_request_date, 'Month')) = ANY($1::text[])
// GROUP BY TRIM(TO_CHAR(trip_request_date, 'Month'))

// `
//   const data = await DB.query(queryText, [values])
//   console.log(data.rows)
//   return data.rows;
// }
export const getTripsMonths = async () => {
  try {
    const queryText = "SELECT DISTINCT TRIM(TO_CHAR(trip_request_date, 'Month')) AS month FROM trips";
    const months = await DB.query(queryText);
    return months.rows;
  }catch (err) {
    return errorHandler("Error occurred getting months", `${err}`, 500, "Trips Months DB Functions")
  }
}
export const getCountByMonth = async (dataColumn, condition, month) => {
  let values = [condition ];
  let queryText = `SELECT
  TRIM(TO_CHAR(trip_request_date, 'Month')) AS month,
  COUNT(*) AS trip_count
FROM trips
WHERE ${dataColumn} = $1
GROUP BY TRIM(TO_CHAR(trip_request_date, 'Month'))`;
  if (month) {
    values = [condition, month ];
    queryText = `SELECT
  TRIM(TO_CHAR(trip_request_date, 'Month')) AS month,
  COUNT(*) AS trip_count
FROM trips
WHERE ${dataColumn} = $1 AND TRIM(TO_CHAR(trip_request_date, 'Month')) = $2
GROUP BY TRIM(TO_CHAR(trip_request_date, 'Month'))

`;
  }

  const data = await DB.query(queryText, values);
  console.log(data.rows);
  return data.rows;
};

export const getPreviousTwoMonthsCounts = async (tripTable, requestDateColumn, tripStatusColumn, tripCostColumn, paymentStatusColumn) => {
  try {
    //by month name
    // const currentMonthNameQuery = `
    //   SELECT TO_CHAR(CURRENT_DATE, 'Month') AS current_month,
    //          TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'Month') AS previous_month;
    // `;
    // const monthNamesResult = await DB.query(currentMonthNameQuery);
    // const { current_month, previous_month } = monthNamesResult.rows[0];
    const values = ["Delivered", "Cancelled", true]
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
    return errorHandler("Error occurred", `${err}`, 500, "Database Functions (Two Months Trips)");
  }
}

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
`
    const selectedTrips = await DB.query(queryText)
    return selectedTrips.rows;
  } catch (err) {
    return errorHandler("Error occurred", `${err}`, 500, "Database Functions (Two Months Trips)")
  }
}


export const getAllCustomers = async (tableName) => {
  try {
    const allItems = await DB.query(`SELECT * FROM ${tableName} WHERE `);
    const data = allItems.rows;
    return data;
  } catch (err) {
    return errorHandler("Error occurred", `${err}`, 500, "Database Functions");
  }
};

export const getAll = async (tableName, limit, offset) => {
  try {
    let queryText = `SELECT * FROM ${tableName}`;
    if (limit) {
      queryText = `SELECT * FROM ${tableName} LIMIT ${limit} OFFSET ${offset}`;
    }
    const allItems = await DB.query(queryText);
    const data = allItems.rows;

    return data;
  } catch (err) {
    return errorHandler("Error occurred", `${err}`, 500, "Database Functions");
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
  dateColumn
) => {
  try {
    let allTrips = await DB.query(
      `select ${tripTable}.*, ${firstName}, ${lastName} from ${tripTable} full outer join ${usersTable} on ${userIdTrip} = ${userIdUser} WHERE ${tripId} IS NOT NULL ORDER BY ${dateColumn} DESC `
    );
    if (limit) {
      allTrips = await DB.query(
        `select ${tripTable}.*, ${firstName}, ${lastName} from ${tripTable} full outer join ${usersTable} on ${userIdTrip} = ${userIdUser} WHERE ${tripId} IS NOT NULL ORDER BY ${dateColumn} DESC limit ${limit} offset ${offset};`
      );
    }

    const trips = allTrips.rows;
    return trips;
  } catch (err) {
    return errorHandler("Error occurred", `${err}`, 500, "Database Functions");
  }
};

export const getDispatchersVehicleJoin = async (
  dispatcherTable,
  usersTable,
  vehicleTable,
  firstName,
  lastName,
  phoneNumber,
  email,
  vehicleName,
  vehiclePlate,
  userIdDispatcher,
  userIdUsers,
  dispatcherVehicleId,
  vehicleId,
  dispatcherId,
  limit,
  offset = 0
) => {
  try {
    let allDispatchers = await DB.query(
      `select ${dispatcherTable}.*, ${firstName}, ${lastName}, ${phoneNumber}, ${email}, ${vehicleName}, ${vehiclePlate} from ${dispatcherTable} full outer join ${usersTable} on ${userIdDispatcher} = ${userIdUsers} full outer join ${vehicleTable} on ${dispatcherVehicleId} = ${vehicleId} where ${dispatcherId} is not null`
    );
    if (limit) {
      allDispatchers = await DB.query(
        `select ${dispatcherTable}.*, ${firstName}, ${lastName}, ${phoneNumber}, ${email}, ${vehicleName}, ${vehiclePlate} from ${dispatcherTable} full outer join ${usersTable} on ${userIdDispatcher} = ${userIdUsers} full outer join ${vehicleTable} on ${dispatcherVehicleId} = ${vehicleId} where ${dispatcherId} is not null limit ${limit} offset ${offset};`
      );
    }

    const dispatchers = allDispatchers.rows;
    return dispatchers;
  } catch (err) {
    return errorHandler("Error occurred", `${err}`, 500, "Database Functions");
  }
};

export const getAllDateSort = async (tableName, dateColumn, limit) => {
  try {
    let allItems = await DB.query(
      `SELECT * FROM ${tableName} ORDER BY ${dateColumn} DESC`
    );
    if (limit) {
      allItems = await DB.query(
        `SELECT * FROM ${tableName} ORDER BY ${dateColumn} DESC LIMIT ${limit}`
      );
    }
    const data = allItems.rows;
    return data;
  } catch (err) {
    return errorHandler("Error occurred", `${err}`, 500, "Database Functions");
  }
};

export const selectOnCondition = async (
  tableName,
  columnName,
  condition,
  limit,
  offset,
  search
) => {
  try {
    let queryText = `SELECT * FROM ${tableName}`;
    const value = [];

    if ((limit || offset)&&!search) {
      queryText += ` WHERE ${columnName} =$1 LIMIT ${limit} OFFSET ${offset}`;
      value.push(condition)
    }

    if(search) {
      queryText += ` WHERE ${columnName} LIKE '%${condition}%' LIMIT ${limit} OFFSET ${offset}`;
    }

    
    
    const result = await DB.query(queryText, value);
    

    return result.rows;
  } catch (err) {
    return errorHandler("Error occurred", `${err}`, 500, "Database Functions: Select On Condition");
  }
};

export const detailExists = async (tableName, columnName, detail) => {
  try {
    const result = await selectOnCondition(tableName, columnName, detail);
    return result.rowCount > 0;
  } catch (err) {
    return false;
  }
};

export const getOne = async (tableName, columnName, entry) => {
  try {
    const value = [entry]
    const  queryText = `SELECT * FROM ${tableName} WHERE ${columnName} =$1`

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
    return errorHandler("Error occurred", `${err}`, 500, "getOne Database Functions");
  }
};

//...args changed to args
export const addOne = async (tableName, columns, values) => {
  console.log({ columns, values });
  let valuesArray = values;
  if (typeof values === "string") {
    valuesArray = [values];
  }

  const placeholders = valuesArray
    .map((_, index) => "$" + (index + 1))
    .join(", ");
  const queryText = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) RETURNING *`;
  try {
    await DB.query("BEGIN");
    const result = await DB.query(queryText, valuesArray);
    await DB.query("COMMIT");
    if (!result.rows) {
      await DB.query("ROLLBACK");
      return errorHandler(
        "Error occurred adding detail",
        null,
        500,
        "Database Functions"
      );
    }
    return result.rows;
  } catch (err) {
    await DB.query("ROLLBACK");
    return errorHandler(
      `Server Error occurred`,
      `${err}`,
      500,
      "Database Functions"
    );
  }
};

export const updateOne = async (
  tableName,
  columns,
  id,
  idColumn,
  ...details
) => {
  try {
    await DB.query("BEGIN");
    for (let i = 0; i < details.length; i++) {
      const queryText = `UPDATE ${tableName} SET ${columns[i]} = $1 WHERE ${idColumn} = $2`;
      const values = [details[i], id];

      await DB.query(queryText, values);
    }
    const updatedDataQuery = `SELECT * FROM ${tableName} WHERE ${idColumn} =$1`;
    const updatedValue = [id];
    const updatedData = await DB.query(updatedDataQuery, updatedValue);

    await DB.query("COMMIT");
    return updatedData;
  } catch (err) {
    await DB.query("ROLLBACK");
    return errorHandler(`Error occurred`, `${err}`, 500, "Database Functions");
  }
};

export const getSpecificDetails = async (
  tableName,
  specificColumn,
  condition
) => {
  try {
    await DB.query("BEGIN");
    const queryText = `SELECT * FROM ${tableName} WHERE ${specificColumn} = $1`;
    const value = [condition];
    const { rows } = await DB.query(queryText, value);
    await DB.query("COMMIT");
    return rows;
  } catch (err) {
    await DB.query("ROLLBACK");
    return errorHandler(
      "Server Error occurred, data not retrieved",
      `${err}`,
      500,
      "Database Functions"
    );
  }
};

export const getSpecificDetailsUsingId = async (
  tableName,
  id,
  idColumn,
  columns,
  sortingColumn
) => {
  try {
    await DB.query("BEGIN");
    let queryText = `SELECT ${columns} FROM ${tableName} WHERE ${idColumn} = $1`;

    if (sortingColumn) {
      queryText = `SELECT ${columns} FROM ${tableName} WHERE ${idColumn} = $1 ORDER BY ${sortingColumn} DESC`;
    }

    const value = [id];
    const { rows } = await DB.query(queryText, value);
    if (!rows) {
      return errorHandler("Detail not found", null, 404, "Database Functions");
    }
    await DB.query("COMMIT");

    return rows;
  } catch (err) {
    await DB.query("ROLLBACK");
    return errorHandler(
      "Server Error occurred, data not retrieved",
      `${err}`,
      500,
      "Database Functions"
    );
  }
};

export const deleteOne = async (tableName, columnName, id) => {
  try {
    await DB.query("BEGIN");
    const queryText = `delete from ${tableName} where ${columnName} = $1`;
    const values = [id];
    const deletion = await DB.query(queryText, values);
    await DB.query("COMMIT");
    return deletion.rowCount ? true : false;
  } catch (err) {
    await DB.query("ROLLBACK");
    return errorHandler(`Error occurred`, `${err}`, 500, "Database Functions");
  }
};

export const increaseByValue = async (
  tableName,
  id,
  idColumn,
  columnToBeIncreased
) => {
  try {
    DB.query("BEGIN");
    const queryText = `UPDATE ${tableName} SET ${columnToBeIncreased} = ${columnToBeIncreased} + 1 WHERE ${idColumn} =$1`;
    const value = [id];
    const increaseValue = await DB.query(queryText, value);
    DB.query("COMMIT");
    return increaseValue.rowCount ? true : false;
  } catch (err) {
    DB.query("ROLLBACK");
    return errorHandler(`Error occurred`, `${err}`, 500, "Database Functions");
  }
};
