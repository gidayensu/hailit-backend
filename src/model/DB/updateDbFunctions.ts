import { errorHandler } from "../../utils/errorHandler.js";
import { DB } from "./connectDb.js";

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
