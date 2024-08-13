import { TableNames } from "../../types/shared.types";
import { handleError } from "../../utils/handleError";
import { DB } from "./connectDb";

export const detailExists = async ({
  tableName,
  columnName,
  detail,
}: {
  tableName: TableNames;
  columnName: string;
  detail: string;
}) => {
  try {
    const queryText = `SELECT * FROM ${tableName} WHERE ${columnName} = $1`;

    const value = [detail];
    const results = await DB.query(queryText, value);

    return results.rowCount > 0 ? true : false;
  } catch (err) {
    return handleError({
      error: "Error occurred checking if detail exists",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Database Functions: Detail Exists",
    });
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
    return handleError({
      error: "Error occurred increasing by Value",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Database Functions: Increase by value"
    }
    );
  }
};
