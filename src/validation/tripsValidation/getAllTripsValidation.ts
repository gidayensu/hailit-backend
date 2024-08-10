

import { CLIENT_COLS_DB_COLS_MAP, CLIENT_SORT_COLUMNS } from "../../constants/tripConstants.js";
import { getAllQueryValidation } from "../getAllQueryValidation.js";

export const getAllTripsValidation = async (req, res, next) => {
  
  return getAllQueryValidation(req, res, next, CLIENT_SORT_COLUMNS, CLIENT_COLS_DB_COLS_MAP)
};
