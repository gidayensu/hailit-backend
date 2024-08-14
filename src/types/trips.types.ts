import { Server } from "socket.io";
export type MonthName = typeof monthOrder[number];
import { Dispatcher } from "./dispatcher.types";
export interface TripMonth {
  month: MonthName
}

export interface MonthsData {
  [key: string]: any,
  month: MonthName
}
export interface Trip {
    trip_stage: TripStage;
    trip_commencement_date: null | Date | string;   
    dispatcher_rating: null | number;
    rated: boolean;
    rating_comment: string;
    trip_type: TripType;
    trip_id: string;
    promo_code: string;
    dispatcher_id: string;
    customer_id: string;
    dispatcher: Dispatcher;
    pick_lat: string,
    pick_long: string,
    drop_lat: string, 
    drop_long: string,
    trip_medium: TripMedium;
    trip_status: TripStatus
    package_value: string;
    trip_area: TripArea;
    recipient_number: string;
    sender_number: string;
    package_type: PackageType;
    pickup_location: string;
    drop_off_location: string;
    additional_information: string;
    trip_request_date: null | Date | string;
    trip_completion_date: null | Date | string;
    trip_cost: number;
    payment_status: boolean;
    payment_method: PaymentMethod | '';
    first_name?: string
    last_name?: string
}


export type TripStage = 1 | 2 | 3 | 4;

export type TripArea = "Accra" | "Kumasi" | "Inter City";

export type TripMedium = "Motor" | "Car" | "Truck";

export type TripType = "Next Day" | "Same Day" | "Scheduled";

export type PaymentMethod = "Cash on Delivery" | "MoMo on Delivery" | "Online"

export type PackageType =
  | "Electronics"
  | "Food"
  | "Fragile"
  | "Clothes"
  | "Documents"
  | "Bulky Items"
  | "Others";

export type TripStatus =
  | "Booked"
  | "Picked Up"
  | "In Transit"
  | "Delivered"
  | "Cancelled";


  
 
  type DispatcherRole = "Rider" | "Driver"

  export interface Vehicle {
    vehicle_id: string,
    vehicle_name: string, 
    vehicle_model: string, 
    plate_number: string,
    vehicle_type: string,
    insurance_details: string,
    road_worthy: string,
    available: boolean
}

const monthOrder = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export interface TripsRealTimeUpdate {
  io: Server,
  trip?: Trip,
  dispatcherUserId: string,
  customerUserId: string,
  tripType: "tripAdded" | "tripUpdated" | "tripDeleted" | "tripRated",
  tripId?: string
}

export interface TripsCount {
  total_trip_count: number,
    delivered_trips: number,
    cancelled_trips: number,
    current_trips: number,
    total_earnings: string,
    total_payment: number,
}

export interface CustomerTrips {
  customer_trips: Trip[],
        total_trip_count: number,
        delivered_trips: number,
        cancelled_trips: number,
        current_trips: number,
        total_payment: number,
}

export interface IDsAndMedium {customer_id: string, dispatcher_id:string, trip_medium: TripMedium}