
import { DB } from "./connectDb.js";
import { errorHandler } from "../../utils/errorHandler.js";



export const getAll = async (tableName, limit, offset, condition, conditionColumn) => {
  try {
    let queryText = `SELECT * FROM ${tableName}`;
    const values = [];
    if(limit && condition) {
      queryText = `SELECT * FROM ${tableName} WHERE ${conditionColumn} =$1 LIMIT ${limit} OFFSET ${offset}`;
      values.push(condition)
    }else if (limit) {
      queryText = `SELECT * FROM ${tableName} LIMIT ${limit} OFFSET ${offset}`;
    }
    const allItems = await DB.query(queryText, values);
    const data = allItems.rows;

    return data;
  } catch (err) {
    return errorHandler("Error occurred", `${err}`, 500, "Database Functions");
  }
};

export const getCountOnOneCondition = async (tableName, condition, conditionColumn)=> {
  
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
        "Database Functions: Get Specific Details"
      );
    }
  };
  
  export const getSpecificDetailsUsingId = async (
    tableName,
    id,
    idColumn,
    columns,
    sortingColumn,  
    
  ) => {
    try {
      await DB.query("BEGIN");
      let queryText = `SELECT ${columns} FROM ${tableName} WHERE ${idColumn} = $1`;

      
      if (sortingColumn) {
        queryText += ` ORDER BY ${sortingColumn} DESC`;
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
        "Database Functions: Specific Details Using Id"
      );
    }
  };
  