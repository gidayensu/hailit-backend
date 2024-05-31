const getSpecificDetailsUsingId =  (
  tableName,
  id,
  idColumn,
  columns,
  conditions,
  values
) => {
  try {
    // await DB.query("BEGIN");

    // Building the WHERE clause dynamically
    let whereClause = `${idColumn} = $1`;
    const queryParams = [id];

    if (conditions && conditions.length > 0) {
      let conditionString = "";
      let parameterPlaceHolder = 1;
      conditions.forEach((condition, index) => {
        parameterPlaceHolder += 1;
        conditionString += (index > 0 ? " AND " : "") + condition+ ' = $'+ parameterPlaceHolder;
      });
      whereClause += ` AND (${conditionString})`;
      queryParams.push(...values);
    }

    const queryText = `SELECT ${columns} FROM ${tableName} WHERE ${whereClause}`;
    return {queryText, queryParams}

    // const { rows } = await DB.query(queryText, queryParams);
    // await DB.query("COMMIT");

    // return rows;
  } catch (err) {
    // await DB.query("ROLLBACK");
    return "Server Error occurred, data not retrieved";
  }
};

