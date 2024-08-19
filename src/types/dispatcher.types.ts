
import { Vehicle } from "./vehicle.types";
type DispatcherRole = "Rider" | "Driver";

export interface Dispatcher {
    rating_count?: number;
    cumulative_rating?: number;
    user_id: string;
    rider_id?: string;
    driver_id?: string;
    user_role?: DispatcherRole;
    dispatcher_id?: string; 
    license_number?: string;
    available?: boolean;
    vehicle_id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
    vehicle?: Vehicle
  }

  
  export interface DispatcherDetails {
    user_id:string, //required
    vehicle_id: string,
    license_number?: string,
    available?: boolean,
    cumulative_rating?:number
    vehicle?: Vehicle,
    dispatcher_id?: string,
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
    
  }
  export interface UpdateDispatcherDetails {
    user_id?: string,
    vehicle_id?: string,
    license_number?: string,
    available?: boolean,
    cumulative_rating?:number
  }
  export interface UpdateRiderDetails extends UpdateDispatcherDetails {
    rider_id: string,
  }

  export interface UpdateDriverDetails extends UpdateDispatcherDetails {
    driver_id: string,
  }

  export interface DriverDetails extends DispatcherDetails {
    driver_id: string;
  }

  export interface RiderDetails extends DispatcherDetails {
    rider_id: string;

  }
  
  