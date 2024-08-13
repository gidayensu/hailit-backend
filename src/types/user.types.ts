import { ErrorResponse } from "../utils/handleError";

export type UserRole = "Rider" | "Driver" | "Admin" | "Customer" | "Dispatcher"
export interface User {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    user_role: UserRole; 
    onboard: boolean;
    date_updated: string;
    date_created: string;
  }

  export type UsersPromise = Promise<User[] | ErrorResponse>
  export type UserPromise = Promise<User | ErrorResponse>
  