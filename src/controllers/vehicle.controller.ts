import {
  addVehicleService,
  deleteVehicleService,
  getAllVehiclesService,
  getOneVehicleService,
  updateVehicleService,
} from "../services/vehicle.service";
import { Middleware } from "../types/middleware.types";
import { isErrorResponse } from "../utils/util";
import { SortDirection } from "../types/shared.types";
import { DEFAULT_LIMIT } from "../constants/sharedConstants";

import { DataString } from "../types/shared.types";

export const getAllVehicles : Middleware = async (req, res) => {
  try {
    const {
      page,
      itemsPerPage,
      sortColumn,
      sortDirection,
      search
    } = req.query;
    

      const limit: number  = typeof(itemsPerPage) === 'string' ? parseFloat(itemsPerPage) : DEFAULT_LIMIT;
    
    const allVehicles = await getAllVehiclesService({
      page: parseFloat(`${page}`),
      limit: limit ,
      sortColumn: `${sortColumn}`,
      sortDirection: sortDirection as SortDirection,
      search: search as DataString,
    });
      
    if (isErrorResponse(allVehicles)) {
      return res.status(allVehicles.errorCode).json( {
        error: allVehicles.error,
        errorMessage: allVehicles.errorMessage,
        errorSource: allVehicles.errorSource,
      })
    }

    res.status(200).json({ ...allVehicles });
  } catch (err) {
    return res.status(500).json({
      error: "Server error occurred getting all vehicles",
      errorMessage: `${err}`,
      errorSource: "getAllVehicles Controller",
    });
  }
};

export const getOneVehicle : Middleware = async (req, res) => {
  const {vehicle_id} = req.params;
  

  const getVehicle = await getOneVehicleService(vehicle_id);
  if (isErrorResponse(getVehicle)) {
    return res
      .status(400)
      .json({
        error: getVehicle.error,
        errorMessage: getVehicle.errorMessage,
        errorSource: getVehicle.errorSource,
      });
  }

  res.status(200).json({ vehicle: getVehicle });
};

export const addVehicle : Middleware = async (req, res) => {
  const { vehicle_name, vehicle_model, plate_number, vehicle_type } = req.body;
  if (!vehicle_name || !vehicle_model || !plate_number || !vehicle_type) {
    return res
      .status(403)
      .json({
        error: "all fields are required",
        errorMessage:
          "Missing either vehicle_name, vehicle_mode, plate_number, or vehicle_type",
      });
  }

  const addedVehicle = await addVehicleService(req.body);
  if (isErrorResponse(addedVehicle)) {
    return res.status(403).json({
      error: addedVehicle.error,
      errorMessage: addedVehicle.errorMessage,
      errorSource: "addVehicle Controller",
    });
  }
  
  res.status(200).json({ vehicle: addedVehicle });
};

export const updateVehicle : Middleware = async (req, res) => {
  try {
    const { vehicle_id } = req.params;
    const { vehicle_name, vehicle_model, plate_number, vehicle_type } =
      req.body;

    if (!vehicle_name && !vehicle_model && !plate_number && !vehicle_type) {
      return res.status(403).json({ error: "Require at least one input" });
    } //TODO: Move to Validation

    const updatedVehicle = await updateVehicleService({vehicle_id: vehicle_id, vehicleUpdateDetails: req.body});

    if (isErrorResponse(updatedVehicle)) {
      return res.status(403).json({
        error: updatedVehicle.error,
        errorMessage: updatedVehicle.errorMessage,
        errorSource: "updateVehicle Controller",
      });
    }
    
    res.status(200).json({ vehicle: updatedVehicle });
  } catch (err) {
    return res.status(500).json({
      error: "Server Error",
      errorMessage: `${err}`,
      errorSource: "updateVehicle Controller",
    });
  }
};

export const deleteVehicle : Middleware = async (req, res) => {
  try {
    const { vehicle_id } = req.params;

    const deletedVehicle = await deleteVehicleService(vehicle_id);

    if (isErrorResponse(deletedVehicle)) {
      return res.status(400).json({
        
        error: "Error occurred deleting vehicle",
        errorMessage: deletedVehicle.errorMessage,
        errorSource: "deleteVehicle Controller",
      });
    }
   
    res.status(200).json({ success: true, vehicle_id }); 
  } catch (err) {
    return res.status(500).json({
      error: "Server Error occurred deleting vehicle",
      errorMessage: `${err}`,
      errorSource: "deleteVehicle Controller",
    });
  }
};
