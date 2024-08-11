export type TableNames = "trips" | "vehicle" | "users" | "driver" | "rider" 

export interface DispatcherDetails {
    user_id?:string,
    vehicle_id?: string,
    license_number?: string,
    available?: boolean,
    cumulative_rating?:number
  }