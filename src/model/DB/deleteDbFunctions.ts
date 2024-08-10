import { errorHandler } from "../../utils/errorHandler.js";
import { DB } from "./connectDb.js";

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
    return errorHandler({
      error: "Error occurred",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Database Functions"
    }
    );
  }
};
