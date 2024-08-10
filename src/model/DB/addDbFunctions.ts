import { errorHandler } from "../../utils/errorHandler.js";
import { DB } from "./connectDb.js";

//...args changed to args
export const addOne = async (tableName, columns, values) => {
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
        {
          error: "Error occurred adding detail",
          errorMessage: null,
          errorCode: 500,
          errorSource: "Database Functions: Add One"
        }
        
      );
    }
    return result.rows;
  } catch (err) {
    await DB.query("ROLLBACK");
    return errorHandler(
      {
        error: "Server Error occurred",
        errorMessage: `${err}`,
        errorCode: 500,
        errorSource: "Database Functions: Add One"
      }
      
    );
  }
};
