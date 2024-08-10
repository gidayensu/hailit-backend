import {
  addVehicleService,
  deleteVehicleService,
  getAllVehiclesService,
  getOneVehicleService,
  updateVehicleService,
} from "../services/vehicle.service";

export const getAllVehicles = async (req, res) => {
  try {
    const {
      page,
      itemsPerPage: limit,
      sortColumn,
      sortDirection,
      search
    } = req.query;
    const allVehicles = await getAllVehiclesService(page, limit, sortColumn,
      sortDirection, search);
      
    if (allVehicles.error) {
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

  const addedVehicle = await addVehicleService(req.body);
  if (addedVehicle.error) {
    return res.status(403).json({
      error: addedVehicle.error,
      errorMessage: addedVehicle.errorMessage,
      errorSource: "addVehicle Controller",
    });
  }
  req.io.emit('addedVehicle', addedVehicle)
  res.status(200).json({ vehicle: addedVehicle });
};

export const updateVehicle = async (req, res) => {
  try {
    const { vehicle_id } = req.params;
    const { vehicle_name, vehicle_model, plate_number, vehicle_type } =
      req.body;

    if (!vehicle_name && !vehicle_model && !plate_number && !vehicle_type) {
      return res.status(403).json({ error: "Require at least one input" });
    }

    const updatedVehicle = await updateVehicleService(vehicle_id, req.body);

    if (updatedVehicle.error) {
      return res.status(403).json({
        error: updatedVehicle.error,
        errorMessage: updatedVehicle.errorMessage,
        errorSource: "updateVehicle Controller",
      });
    }
    req.io.emit('updatedVehicle', updatedVehicle)
    res.status(200).json({ vehicle: updatedVehicle });
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

    const deletedVehicle = await deleteVehicleService(vehicle_id);

    if (deletedVehicle.error) {
      return res.status(400).json({
        
        error: "Error occurred deleting vehicle",
        errorMessage: deletedVehicle.errorMessage,
        errorSource: "deleteVehicle Controller",
      });
    }
    req.io.emit('deletedVehicle', deletedVehicle)
    res.status(200).json({ success: true, vehicle_id }); 
  } catch (err) {
    return res.status(500).json({
      error: "Server Error occurred deleting vehicle",
      errorMessage: err,
      errorSource: "deleteVehicle Controller",
    });
  }
};
