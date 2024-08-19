import { Dispatcher } from "./dispatcher.types";
import { Trip } from "./trips.types";
import { User } from "./user.types";
import { Vehicle } from "./vehicle.types";

export type TableNames = "trips" | "vehicle" | "users" | "driver" | "rider" | "trip_locations"
export type EntitySourceName = "trips" | "riders" | "drivers" | "users" | "vehicles"

export enum EntityName {
  Trips = "trips",
  Vehicles = "vehicles",
  Riders = "riders",
  Drivers = "drivers",
  Users = "users"
}


  export interface TotalCount {
    total_count: number
  }

  export interface PaginatedRequest {
    [EntityName.Drivers]?: Dispatcher[];
    [EntityName.Riders]?: Dispatcher[];
    [EntityName.Trips]?: Trip[];
    [EntityName.Users]?: User[];
    [EntityName.Vehicles]?: Vehicle[];
    total_number_of_pages: number;
    current_page: number;
    total_items: number;
}

export interface ErrorMessage {
  error: string
}

export type DataString = string | undefined;