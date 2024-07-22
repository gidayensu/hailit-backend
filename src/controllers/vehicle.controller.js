import {
  addVehicleService,
  deleteVehicleService,
  getAllVehiclesService,
  getOneVehicleService,
  updateVehicleService,
} from "../services/vehicle.service.js";

export const getAllVehicles = async (req, res) => {
  try {
    const vehicleType = req.query?.vehicle_type;
    const page = req.query?.page;

    const allVehicles = await getAllVehiclesService(page, vehicleType);
    if (allVehicles.error) {
      return {
        error: allVehicles.error,
        errorMessage: allVehicles.errorMessage,
        errorSource: allVehicles.errorSource,
      };
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

export const getOneVehicle = async (req, res) => {
  const {vehicle_id} = req.params;
  const getVehicle = await getOneVehicleService(vehicle_id);
  if (getVehicle.error) {
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

export const addVehicle = async (req, res) => {
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

  const addingVehicleResult = await addVehicleService(req.body);
  if (addingVehicleResult.error) {
    return res.status(403).json({
      error: addingVehicleResult.error,
      errorMessage: addingVehicleResult.errorMessage,
      errorSource: "addVehicle Controller",
    });
  }

  res.status(200).json({ vehicle: addingVehicleResult });
};

export const updateVehicle = async (req, res) => {
  try {
    const { vehicle_id } = req.params;
    const { vehicle_name, vehicle_model, plate_number, vehicle_type } =
      req.body;

    if (!vehicle_name && !vehicle_model && !plate_number && !vehicle_type) {
      return res.status(403).json({ error: "Require at least one input" });
    }

    const updatingVehicle = await updateVehicleService(vehicle_id, req.body);

    if (updatingVehicle.error) {
      return res.status(403).json({
        error: updatingVehicle.error,
        errorMessage: updatingVehicle.errorMessage,
        errorSource: "updateVehicle Controller",
      });
    }

    res.status(200).json({ vehicle: updatingVehicle });
  } catch (err) {
    return res.status(500).json({
      error: "Server Error",
      errorMessage: err,
      errorSource: "updateVehicle Controller",
    });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const { vehicle_id } = req.params;

    const deleteVehicle = await deleteVehicleService(vehicle_id);

    if (deleteVehicle.error) {
      return res.status(400).json({
        // Assuming 400 for delete error
        error: "Error occurred deleting vehicle",
        errorMessage: deleteVehicle.errorMessage,
        errorSource: "deleteVehicle Controller",
      });
    }

    res.status(200).json({ message: "Vehicle deleted successfully" }); // Updated success message
  } catch (err) {
    return res.status(500).json({
      error: "Server Error occurred deleting vehicle",
      errorMessage: err,
      errorSource: "deleteVehicle Controller",
    });
  }
};
