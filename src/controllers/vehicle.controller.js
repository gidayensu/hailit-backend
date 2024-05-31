import {addVehicleService, deleteVehicleService, getAllVehiclesService, getOneVehicleService, updateVehicleService} from "../services/vehicle.service.js";

export const getAllVehicles = async (req, res) => {
  try {
    const allVehicles = await getAllVehiclesService();
    res.status(200).json({ vehicles: allVehicles });
  } catch (err) {
    return { error:  "Server Error" };
  }
};

export const getOneVehicle = async (req, res) => {
  const vehicle_id = req.params;
  const getVehicle = await getOneVehicleService(vehicle_id);
  if (getVehicle.error) {
    return res
      .status(400)
      .json({ error: "vehicle does not exist" });
  }
  
    res.status(200).json({vehicle: getVehicle });
  
};

export const addVehicle = async (req, res) => {
  const { vehicle_name, vehicle_model, plate_number, vehicle_type } = req.body;
  if (!vehicle_name || !vehicle_model || !plate_number || !vehicle_type) {
    return res
      .status(403)
      .json({ error: "all fields are required" });
  }

  const addingVehicleResult = await addVehicleService(req.body);
  if (addingVehicleResult.error) {
    return res.status(403).json({error: addingVehicleResult.error})
  }
  
    res.status(200).json({ vehicle: addingVehicleResult });
  
};

export const updateVehicle = async (req, res) => {
  try {
    const { vehicle_id } = req.params;
    const { vehicle_name, vehicle_model, plate_number, vehicle_type } =
      req.body;

    if (!vehicle_name && !vehicle_model && !plate_number && !vehicle_type) {
      return res
        .status(403)
        .json({ error: "Require at least one input" });
    }

    const updatingVehicle = await updateVehicleService(
      vehicle_id,
      req.body
    );

    if(updatingVehicle.error) {
      return res.status(403).json({ error: "Error occurred: vehicle not updated" });
    }
      res.status(200).json({ vehicle: updatingVehicle });
    
  } catch (err) {
    return { error: "Server Error" };
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const { vehicle_id } = req.params;
    
    const deleteVehicle = await deleteVehicleService(vehicle_id);
    
    if (deleteVehicle.error) {
      return res.status(200).json({error: "Error occurred deleting vehicle"});
    } 
      res.status(403).json(deleteVehicle);
    
  } catch (err) {
    return { error: "Server Error" };
  }
};
