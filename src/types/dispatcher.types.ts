import { Vehicle } from "./vehicle.types";
type DispatcherRole = "Rider" | "Driver";

export interface Dispatcher {
    rating_count: number;
    cumulative_rating: number;
    user_id: string;
    user_role: DispatcherRole;
    dispatcher_id: string;
    license_number?: string;
    available?: boolean;
    vehicle_id: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone_number?: string;
    vehicle?: Vehicle
  }