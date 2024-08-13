import { QueryResult } from 'pg'
import { TableNames } from "../../types/shared.types";
import { ErrorResponse, handleError } from "../../utils/handleError";
import { DB } from "./connectDb";

export const updateOne = async <T>(
  {tableName,
  columns,
  id,
  idColumn,
  details} : {
    tableName: TableNames;
    columns: string[];
    id: string;
    idColumn: string;
    details: string[] | number []
  }
): Promise<QueryResult | ErrorResponse> => {
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
    return handleError({
      error: "Error occurred",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Database Update Functions"
    }
    );
  }
};
