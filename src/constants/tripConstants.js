export const DEFAULT_DISPATCHER_ID = 'ff-12-53';

export const DEFAULT_USER_ID = '92e6ff67-a1d0-4f56-830c-60d23a63913d';

export const ANONYMOUS_USER_PROPS = [
    "trip_id",
    "trip_medium",
    "trip_status",
    "trip_type",
    "package_type",
    "package_value",
    "pickup_location",
    "drop_off_location",
    "additional_information",
    "trip_request_date",
    "trip_commencement_date",
    "trip_completion_date",
    "payment_status",
    "payment_method",
    "dispatcher_id",
    "trip_stage",
    "trip_area",
    "trip_cost"
  ];

  export const ALLOWED_ADD_TRIP_PROPERTIES = [
    "trip_medium",
    "package_type",
    "pickup_location",
    "drop_off_location",
    "additional_information",
    "package_value", 
    "recipient_number", 
    "sender_number",
    "trip_area"
  ];

  export const ALLOWED_UPDATE_PROPERTIES = [
    "trip_id",
    "trip_medium",
    "trip_status",
    "trip_type",
    "package_type",
    "package_value",
    "pickup_location",
    "drop_off_location",
    "additional_information",
    "trip_commencement_date",
    "trip_completion_date",
    "payment_status",
    "payment_method",
    "dispatcher_id",
    "recipient_number",
    "sender_number",
    "trip_stage",
    "trip_area"
  ];

  export const ALLOWED_RATE_TRIP_PROPS = ["dispatcher_rating", "trip_id", "dispatcher_id", "rated"];

  export const MONTH_ORDER = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];


  export const CUSTOMER_TRIP_FIELDS = [
    "trip_id, dispatcher_id, trip_medium, trip_status, package_value, trip_area, recipient_number, sender_number, package_type, pickup_location, drop_off_location, additional_information, trip_request_date, trip_completion_date, trip_cost, payment_status, payment_method "
  ];

  export const DISPATCHER_TRIP_FIELDS = [
    "trip_id, trip_medium, trip_status, trip_stage, recipient_number, sender_number,payment_status, trip_type, pickup_location, drop_off_location, package_type, trip_commencement_date, trip_completion_date, trip_cost, trip_request_date, payment_method",
  ];

  export const ALLOWED_TRIP_STATS_COLUMNS = ['trip_status', 'trip_area', 'trip_type', 'package_type', 'trip_medium'];

//DATABASE TABLE AND COLUMNS
  export const TRIP_TABLE_NAME = "trips";
  export const TRIP_ID = "trips.trip_id";
  export const TRIP_REQUEST_DATE_COLUMN = "trips.trip_request_date";
  export const FIRST_NAME = "users.first_name";
  export const LAST_NAME = "users.last_name";
  export const USER_ID_USER = "users.user_id";
  export const USER_ID_TRIP = "trips.customer_id";
  export const TRIP_AREA = "trip_area";
  export const TRIP_STATUS = "trip_status";
  export const CUSTOMER_ID_COLUMN = 'customer_id'
  export const DISPATCHER_ID_COLUMN = 'dispatcher_id';
  export const PACKAGE_TYPE = "package_type"
  export const DISPATCHER_AVAILABLE_COLUMN = 'available';

  export const ALLOWED_PACKAGE_TYPES = [
    "Electronics",
    "Documents",
    "Clothes",
    "Bulky Items",
    "Fragile",
    "Others",
  ];
  
export const ALLOWED_TRIP_TYPES = [
  "Same Day",
  "Next Day", 
  "Scheduled"
]
export const ALLOWED_TRIP_AREAS = [
  "Kumasi",
  "Accra", 
  "Inter City"
]
export const ALLOWED_TRIP_MEDIUMS = [
  "Motor",
  "Car", 
  "Truck"
]

export const ALLOWED_TRIP_STATUS = [
  "Booked",
  "Picked Up",
  "In Transit",
  "Delivered",
  "Cancelled",
];
