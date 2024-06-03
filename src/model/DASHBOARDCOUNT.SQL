SELECT
  count(*) FILTER (
    WHERE
      trip_request_date >= CURRENT_DATE - INTERVAL '4 week'
      AND trip_request_date <= CURRENT_DATE
  ) AS one_week_sum,
  SUM(trip_cost) FILTER (
    WHERE
      trip_request_date >= CURRENT_DATE - INTERVAL '8 week'
      AND trip_request_date <= CURRENT_DATE
  ) AS two_week_sum
FROM
  trips;


  SELECT
  COUNT(*) FILTER (
    WHERE
      trip_request_date >= CURRENT_DATE - INTERVAL '4 week'
      AND trip_request_date <= CURRENT_DATE
  ) AS one_week_count,
  COUNT(*) FILTER (
    WHERE
      trip_request_date >= CURRENT_DATE - INTERVAL '8 week'
      AND trip_request_date <= CURRENT_DATE
  ) AS one_month_count
FROM
  trips;