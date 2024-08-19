
import { NextFunction, Request, Response } from 'express';
import { SORT_DIRECTION } from "../constants/sharedConstants";

import { ErrorMessage } from '../types/shared.types';

export const getAllQueryValidation = <T extends Record<string, string>>(
  req: Request,
  res: Response,
  next: NextFunction,
  CLIENT_SORT_COLUMNS: string[],
  CLIENT_COLS_DB_COLS_MAP: T
) => {
    
    const errors: ErrorMessage[] = [];

    const errorReturner = (errorMessage: string) => {
      !errorMessage ? null : errors.push({ error: errorMessage });
    };

    const {
      page,
      itemsPerPage: limit,
      sortColumn,
      sortDirection,
    } = req.query;
    
    const validPage = !isNaN(parseFloat(`${page}`));
    const validLimit = !isNaN(parseFloat(`${limit}`));
    const validSortColumn = CLIENT_SORT_COLUMNS.includes(`${sortColumn}`);
    const validSortDirection = SORT_DIRECTION.includes(`${sortDirection}`);
    
    !validPage && errorReturner("Page must be a number");
    limit && !validLimit && errorReturner("Limit must be a number");

    sortColumn &&
    !validSortColumn &&
      errorReturner(
        `Wrong sort column. Sort column should be one of these: ${CLIENT_SORT_COLUMNS}`
      );

    sortDirection &&
      !validSortDirection &&
      errorReturner(
        "Wrong sort direction. Sort direction should be either 'ASC' or 'DESC'"
      );
      
      if (validSortColumn) {
        req.query.sortColumn = CLIENT_COLS_DB_COLS_MAP[`${sortColumn}`];
      }
      

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    next();
  };
  
