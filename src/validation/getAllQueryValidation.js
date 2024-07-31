import { SORT_DIRECTION } from "../constants/sharedConstants.js";

export const getAllQueryValidation = (req, res, next, CLIENT_SORT_COLUMNS, CLIENT_COLS_DB_COLS_MAP) => {
    
    const errors = [];

    const errorReturner = (errorMessage) => {
      !errorMessage ? null : errors.push({ error: errorMessage });
    };

    const {
      page,
      itemsPerPage: limit,
      sortColumn,
      sortDirection,
    } = req.query;
    const validPage = !isNaN(parseFloat(page));
    const validLimit = !isNaN(parseFloat(limit));
    const validSortColumn = CLIENT_SORT_COLUMNS.includes(sortColumn);
    const validSortDirection = SORT_DIRECTION.includes(sortDirection);
    
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
        req.query.sortColumn = CLIENT_COLS_DB_COLS_MAP[sortColumn];
      }
      

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    next();
  };
  
