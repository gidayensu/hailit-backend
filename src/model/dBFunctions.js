import { DB } from './connectDb.js'


export const getAll = async (tableName) => {
  try {
    const allItems = await DB.query(`SELECT * FROM ${tableName}`);
    const data = allItems.rows;
    return data;
  } catch (err) {
    return {error: `Error occurred ${err}`}
  }
};

export const getTripsCustomersJoin = async (tripTable, usersTable, firstName, lastName, userIdUser, userIdTrip, tripId, limit, offset=0, dateColumn)=> {
 try {
  let allTrips = await DB.query (`select ${tripTable}.*, ${firstName}, ${lastName} from ${tripTable} full outer join ${usersTable} on ${userIdTrip} = ${userIdUser} WHERE ${tripId} IS NOT NULL ORDER BY ${dateColumn} DESC `)
  if (limit) {
    allTrips = await DB.query (`select ${tripTable}.*, ${firstName}, ${lastName} from ${tripTable} full outer join ${usersTable} on ${userIdTrip} = ${userIdUser} WHERE ${tripId} IS NOT NULL ORDER BY ${dateColumn} DESC limit ${limit} offset ${offset};`)
  }
  
  const trips = allTrips.rows;
  return trips;
} catch (err) {
  return {error: `Error occurred ${err}`}
}
}

export const getDispatchersVehicleJoin = async (dispatcherTable, usersTable, vehicleTable, firstName, lastName, phoneNumber, email, vehicleName, vehiclePlate, userIdDispatcher, userIdUsers, dispatcherVehicleId, vehicleId, dispatcherId, limit, offset=0)=> {
  try {
   let allDispatchers = await DB.query (`select ${dispatcherTable}.*, ${firstName}, ${lastName}, ${phoneNumber}, ${email}, ${vehicleName}, ${vehiclePlate} from ${dispatcherTable} full outer join ${usersTable} on ${userIdDispatcher} = ${userIdUsers} full outer join ${vehicleTable} on ${dispatcherVehicleId} = ${vehicleId} where ${dispatcherId} is not null`)
   if (limit) {
    allDispatchers = await DB.query (`select ${dispatcherTable}.*, ${firstName}, ${lastName}, ${phoneNumber}, ${email}, ${vehicleName}, ${vehiclePlate} from ${dispatcherTable} full outer join ${usersTable} on ${userIdDispatcher} = ${userIdUsers} full outer join ${vehicleTable} on ${dispatcherVehicleId} = ${vehicleId} where ${dispatcherId} is not null limit ${limit} offset ${offset};`)
   }
   
   const dispatchers = allDispatchers.rows;
   return dispatchers;
  } catch (err) {
   console.log(err)
   return {error: `Error occurred ${err}`}
 }
 }

export const getAllDateSort = async (tableName, dateColumn, limit) => {
  try {
    let allItems = await DB.query(`SELECT * FROM ${tableName} ORDER BY ${dateColumn} DESC`);
    if (limit) {
      allItems = await DB.query(`SELECT * FROM ${tableName} ORDER BY ${dateColumn} DESC LIMIT ${limit}`)
    }
    const data = allItems.rows;
    
    return data;
  } catch (err) {
    return {error: `Error occurred ${err}`}
  }
}
//check if a detail exists
export const checkOneDetail = async (tableName, columnName, condition) => {
  try {
    
    const queryText = `SELECT * FROM ${tableName} WHERE ${columnName} =$1`;
    const value = [condition];
    const result = await DB.query(queryText, value);
    
    
    return result;
  } catch (err) {
    
    return {error: `Error occurred ${err}`}
  }
};

//check for only one detail and return boolean

export const detailExists = async (tableName, columnName, detail) => {
  try {
    const result = await checkOneDetail(tableName, columnName, detail);
    return result.rowCount > 0;
  } catch (err) {
    return false;
  }
};

//get one item from the table. //consider using a better approach to limit repetition
export const getOne = async (tableName, columnName, entry) => {
  
  try {
    const result = await checkOneDetail(tableName, columnName, entry);

    if (result.rowCount > 0) {
      
      return result.rows;
    } else {
      
      return { error: "detail does not exist" };
    }
  } catch (err) {
    console.log('error56:', err)
    return {error: `Error occurred ${err}`}
  }
};

//...args changed to args
export const addOne = async (tableName, columns, values) => {
  let valuesArray = values;
  if(typeof values === 'string') {
    valuesArray = [values]
  }
  
  
  const placeholders = valuesArray.map((_, index) => "$" + (index + 1)).join(", ");
  const queryText = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) RETURNING *`;
  try {
    await DB.query("BEGIN");
    const result = await DB.query(queryText, valuesArray);
    await DB.query("COMMIT");
    if (!result.rows) {
      await DB.query("ROLLBACK");
      return {error: 'Error occurred adding a value'}
    }
    return result.rows;
  } catch (err) {
    await DB.query("ROLLBACK");
    return {error: `Error occurred ${err}`}
  }
};


export const updateOne = async (tableName, columns, id, idColumn, ...details) => {
  try {
    await DB.query("BEGIN");
    for (let i = 0; i < details.length; i++) {
      const queryText =
         `UPDATE ${tableName} SET ${columns[i]} = $1 WHERE ${idColumn} = $2`;
      const values = [details[i], id];

       await DB.query(queryText, values);
    }
    await DB.query("COMMIT");
    const updatedDataQuery = `SELECT * FROM ${tableName} WHERE ${idColumn} =$1`
    const updatedValue = [id];
    const updatedData = await DB.query(updatedDataQuery, updatedValue);
    return updatedData;
  } catch (err) {
    await DB.query("ROLLBACK");
    return {error: `Error occurred ${err}`}
  }
};

export const getSpecificDetails = async (tableName, specificColumn, condition) => {
  try {
    await DB.query("BEGIN");
    const queryText = `SELECT * FROM ${tableName} WHERE ${specificColumn} = $1`;
    const value = [condition];
    const { rows } = await DB.query(queryText, value);
    await DB.query("COMMIT");
    return rows;
  } catch (err) {
    await DB.query("ROLLBACK");
    return {error: "Server Error occurred, data not retrieved"};
  }
};

export const getSpecificDetailsUsingId = async (tableName, id, idColumn, columns, sortingColumn) => {
  
  try {
    await DB.query("BEGIN");  
    // const columnsString = columns.join(", ");
    
    let queryText = `SELECT ${columns} FROM ${tableName} WHERE ${idColumn} = $1`;

    if (sortingColumn) {
      queryText = `SELECT ${columns} FROM ${tableName} WHERE ${idColumn} = $1 ORDER BY ${sortingColumn} DESC`;
    }
    
    const value = [id];
    const { rows } = await DB.query(queryText, value);
    await DB.query("COMMIT");
    
    return rows;

  } catch (err) {
    
    await DB.query("ROLLBACK");
    return {error:"Server Error occurred, data not retrieved"};
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
    return {error: `Error occurred ${err}`}
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
    const queryText = `UPDATE ${tableName} SET ${columnToBeIncreased} = ${
      columnToBeIncreased
    } + 1 WHERE ${idColumn} =$1`;
    const value = [id];
    const increaseValue = await DB.query(queryText, value);
    DB.query("COMMIT");
    return increaseValue.rowCount ? true : false;
  } catch (err) {
    DB.query("ROLLBACK");
    return {error: `Error occurred ${err}`}
  }
};



