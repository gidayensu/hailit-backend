export interface Vehicle {
    vehicle_id?: string;
    vehicle_name: string;
    vehicle_model: string;
    plate_number: string;
    vehicle_type: VehicleType;
    insurance_details: string;
    road_worthy: string;
    available: boolean;
  }

  export type VehicleType = "Car" | "Truck" | "Motor"