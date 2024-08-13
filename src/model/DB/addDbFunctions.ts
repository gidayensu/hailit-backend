import { TableNames } from "../../types/shared.types";
import { ErrorResponse, handleError } from "../../utils/handleError";
import { DB } from "./connectDb";

//...args changed to args
export const addOne = async <T>({
  tableName,
  columns,
  values,
}: {
  tableName: TableNames;
  columns: string[] | string;
  values: string[];
}): Promise<T | ErrorResponse> => {
  
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
      return handleError({
        error: "Error occurred adding detail",
        errorMessage: null,
        errorCode: 500,
        errorSource: "Database Functions: Add One",
      });
    }
    return result.rows;
  } catch (err) {
    await DB.query("ROLLBACK");
    return handleError({
      error: "Server Error occurred",
      errorMessage: `${err}`,
      errorCode: 500,
      errorSource: "Database Functions: Add One",
    });
  }
};
