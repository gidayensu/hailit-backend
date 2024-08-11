import {
    CLIENT_COLS_DB_COLS_MAP,
    CLIENT_SORT_COLUMNS,
  } from "../constants/riderConstants.js";
  import { getAllQueryValidation } from "./getAllQueryValidation.js";
  import { Middleware } from "../types/middleware.types.js";

  export const getAllRidersValidation:Middleware = async (req, res, next) => {
    return getAllQueryValidation(req, res, next, CLIENT_SORT_COLUMNS, CLIENT_COLS_DB_COLS_MAP)
  }