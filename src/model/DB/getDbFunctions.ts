import { VEHICLE_TABLE_NAME } from "../../constants/vehicleConstants";
import { GetAllFromDB } from "../../types/getAll.types";
import { ErrorResponse, handleError } from "../../utils/handleError";
import { DB } from "./connectDb";
import { TableNames, TotalCount } from "../../types/shared.types";
import { Vehicle } from "../../types/vehicle.types";
import { QueryResult } from "pg";


export const getAll = async (
  tableName,
  columns,
  limit,
  offset,
  sortColumn,
  sortDirection = "ASC",
  search
) => {
  
  try {
    let queryText = `SELECT * FROM ${tableName}`;
    const values = [];

    if (limit) {
        queryText += ` LIMIT ${limit} OFFSET ${offset}`;
    }

    if (sortColumn && sortDirection) {
        queryText += ` ORDER BY ${sortColumn} ${sortDirection.toUpperCase()} LIMIT ${limit} OFFSET ${offset}`;
    }

    if (search) {
        values.push(`%${search}%`);
        const searchConditions = columns.map(field => `${field} ILIKE $1`).join(' OR ');
        queryText = `
            SELECT * FROM ${tableName}
            WHERE ${searchConditions}
            ORDER BY ${sortColumn} ${sortDirection.toUpperCase()}
            LIMIT ${limit} OFFSET ${offset}
        `;
    }

    const allItems = await DB.query(queryText, values);
    return allItems.rows; 
  
  } catch (err) {
    return handleError(
      {
        error: "Error occurred getting all details",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Database Functions: Get All"
      }
      
    );
  }
};
export const getAllVehicles = async (
  {limit,
  offset,
  sortColumn,
  sortDirection = "ASC",
  search}: GetAllFromDB
) => {
  
  try {
    let queryText = `SELECT * FROM ${VEHICLE_TABLE_NAME}`;
    const values = [];
    if (limit) {
      queryText = `SELECT * FROM ${VEHICLE_TABLE_NAME} LIMIT ${limit} OFFSET ${offset}`;
      
    } 

    if(sortColumn && sortDirection) {
      queryText = `SELECT * FROM ${VEHICLE_TABLE_NAME} ORDER BY ${sortColumn} ${sortDirection.toUpperCase()} LIMIT ${limit} OFFSET ${offset} `;
    }

    if(search) {
      values.push(`%${search}%`)
      queryText = `
    SELECT * FROM ${VEHICLE_TABLE_NAME}
    WHERE vehicle_name ILIKE $1
      OR plate_number ILIKE $1
      OR vehicle_type ILIKE $1
      OR vehicle_model ILIKE $1
      OR insurance_details ILIKE $1
      OR road_worthy ILIKE $1
    ORDER BY ${sortColumn} ${sortDirection.toUpperCase()}
    LIMIT ${limit} OFFSET ${offset}
  `;
    }
    
    const allItems = await DB.query(queryText, values);
    const data: Vehicle[] = allItems.rows;

    return data;
  } catch (err) {
    return handleError(
      {
        error: "Error occurred getting all details",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Database Functions: Get All Vehicles"
      }
      
    );
  }
};
export const vehiclesCount = async (search: string) => {
  try {
    let queryText = `SELECT COUNT(*) AS total_count FROM ${VEHICLE_TABLE_NAME}`;
    const values = [];

    if (search) {
      values.push(`%${search}%`);
      queryText = `
    SELECT COUNT(*) AS total_count FROM ${VEHICLE_TABLE_NAME}
    WHERE vehicle_name ILIKE $1
      OR plate_number ILIKE $1
      OR vehicle_type ILIKE $1
      OR vehicle_model ILIKE $1
      OR insurance_details ILIKE $1
      OR road_worthy ILIKE $1
  `;
    }

    const vehiclesCount = await DB.query(queryText, values);
    const count: TotalCount = vehiclesCount.rows[0];

    return count;
  } catch (err) {
    return handleError({
      error: "Error occurred getting vehicle count",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Database Functions: Getting vehicle count",
    });
  }
};


export const getCountOnOneCondition = async ({
  tableName,
  condition,
  conditionColumn,
}: {
  tableName:TableNames,
  condition: string,
  conditionColumn: string
}): Promise<number | ErrorResponse> => {
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
    return handleError({
      error: "Error occurred getting count on one condition",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Database Functions: One Condition Count",
    });
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
    return handleError(
      {
        error: "Error occurred getting all date sort",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Database Functions: Get All Date Sort"
      }
      
    );
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

    if ((limit || offset) && !search) {
      queryText += ` WHERE ${columnName} =$1 LIMIT ${limit} OFFSET ${offset}`;
      value.push(condition);
    }

    if (search) {
      queryText += ` WHERE ${columnName} LIKE '%${condition}%' LIMIT ${limit} OFFSET ${offset}`;
    }

    const result = await DB.query(queryText, value);

    return result.rows;
  } catch (err) {
    return handleError(
      {
        error: "Error occurred selecting on condition",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Database Functions: Select On Condition"
      }
      
    );
  }
};

export const getOne = async <T>({
  tableName,
  columnName,
  condition,
  secondConditionColumn,
  secondCondition,
}: {
  tableName: TableNames;
  columnName: string;
  condition: string;
  secondConditionColumn?:string,
  secondCondition?: string
}):Promise<T[] | ErrorResponse> => {
  try {
    const values = [condition];
    let queryText = `SELECT * FROM ${tableName} WHERE ${columnName} =$1`;
    if (secondCondition) {
      values.push(secondCondition);
      queryText = `SELECT * FROM ${tableName} WHERE ${columnName} =$1 AND ${secondConditionColumn} = $2`;
    }
    const result: QueryResult<T> = await DB.query(queryText, values);

    if (result.rowCount > 0) {
      const oneDetail = result.rows;
      return oneDetail
    } else {
      return handleError({
        error: "Detail does not exist",
        errorMessage: null,
        errorCode: 404,
        errorSource: "Database Functions",
      });
    }
  } catch (err) {
    return handleError({
      error: "Error occurred getting one detail",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "getOne Database Functions",
    });
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
    return handleError(
      {
        error: "Server Error occurred, data not retrieved",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Database Functions: Get Specific Details"
      }
      
    );
  }
};

export const getSpecificDetailsUsingId = async (
  {tableName,
  id,
  idColumn,
  columns,
  sortingColumn} : {
    tableName: TableNames,
    id:string,
    idColumn: string,
    columns: string[] | string,
    sortingColumn?: string
  }
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
      return handleError({
        error: "Detail not found",
        errorMessage: null,
        errorCode: 404,
        errorSource: "Database Functions"
      }
      );
    }
    await DB.query("COMMIT");

    return rows;
  } catch (err) {
    await DB.query("ROLLBACK");
    return handleError(
      {
        error: "Server Error occurred, data not retrieved",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Database Functions: Specific Details Using Id"
      }
      
    );
  }
};
