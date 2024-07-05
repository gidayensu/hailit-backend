import { deleteDriverService, getAllDriversService, getOneDriverService, updateDriverService} from "../services/driver.service.js";

export const getAllDrivers = async (req, res) => {
  const page = req.query.page;
  
  try {
    const allDrivers = await getAllDriversService(page);
    if (res && res.status) {
      if(allDrivers.error) {
        
        return res.status(allDrivers.errorCode).json({error: allDrivers.error, errorMessage: allDrivers.errorMessage, errorSource: allDrivers.errorSource})
      }
      
      res.status(200).json({...allDrivers });
    }
  } catch (err) {
    if (res && res.status) {
      return res.status(500).json({ error: "Server Error occurred getting all drivers", errorMessage: err, errorSource: "Driver Controller" });
    }
  }
};

export const getOneDriver = async (req, res) => {
  const { driver_id } = req.params;
  try {
    const driver = await getOneDriverService(driver_id);
    if (driver.error) {
      return res.status(driver.errorCode).json({error: driver.error, errorMessage: driver.errorMessage, errorSource: driver.errorSource});
    } 
      res.status(200).json({ driver });
    
  } catch (err) {
    return res.status(500).json({ error: "Error occurred getting driver", errorMessage: err, errorSource: "Driver Controller" });
  }
};

export const updateDriver = async (req, res) => {
  const { driver_id } = req.params;
  const { vehicle_id } = req.body;

  const driverDetails = { driver_id, ...req.body };

  if (!driver_id && !vehicle_id) {
    return res.status(401).json({ error: "driver id or vehicle id missing" });
  }

  try {
    const driverUpdate = await updateDriverService(driverDetails);
    if (!driverUpdate.error) {
      res.status(200).json({ driver: driverUpdate });
    } else {
      res.status(400).json({ error: "driver details not updated" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ error: `Error occurred in updating driver: ${err}` });
  }
};

export const deleteDriver = async (req, res) => {
  const { driver_id } = req.params;
  try {
  const driverDelete = await deleteDriverService(driver_id);
  if (driverDelete.error) {

  return  res.status(driverDelete.errorCode).json({ error: driverDelete.error, errorMessage: driverDelete.errorMessage, errorSource: driverDelete.errorSource });
  }
  
    res.status(200).json({ success: "driver deleted" });
  } catch (err) {
    res.status(500).json({error: "Error Occurred", errorMessage: err, errorSource: "Driver Controller"})
  }
  
};
