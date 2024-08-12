import { CLIENT_COLS_DB_COLS_MAP, CLIENT_SORT_COLUMNS } from "../../constants/tripConstants";
import { getAllQueryValidation } from "../getAllQueryValidation";
import { Middleware } from "../../types/middleware.types";

export const getAllTripsValidation: Middleware = async(req, res, next) => {
  
  return getAllQueryValidation(req, res, next, CLIENT_SORT_COLUMNS, CLIENT_COLS_DB_COLS_MAP)
};
