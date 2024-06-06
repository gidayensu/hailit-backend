import { deleteDriverService, getAllDriversService, getOneDriverService, updateDriverService} from "../services/driver.service.js";

export const getAllDrivers = async (req, res) => {
  const limit = req.query.limit;
  const offset = req.query.offset;
  try {
    const allDrivers = await getAllDriversService(limit, offset);
    if (res && res.status) {
      if(allDrivers.error) {
        
        return res.status(allDrivers.errorCode).json({error: allDrivers.error, errorMessage: allDrivers.errorMessage, errorLocation: allDrivers.errorLocation})
      }
      if(limit && offset) {
        return res.status(200).json(allDrivers);
      }
      res.status(200).json({ drivers: allDrivers });
    }
  } catch (err) {
    if (res && res.status) {
      return res.status(500).json({ error: "Server Error occurred getting all drivers", errorMessage: err, errorLocation: "Driver Controller" });
    }
  }
};

export const getOneDriver = async (req, res) => {
  const { driver_id } = req.params;
  try {
    const driver = await getOneDriverService(driver_id);
    if (driver.error) {
      return res.status(driver.errorCode).json({error: driver.error, errorMessage: driver.errorMessage, errorLocation: driver.errorLocation});
    } 
      res.status(400).json({ driver });
    
  } catch (err) {
    return res.status(500).json({ error: "Error occurred getting driver", errorMessage: err, errorLocation: "Driver Controller" });
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

  return  res.status(driverDelete.errorCode).json({ error: driverDelete.error, errorMessage: driverDelete.errorMessage, errorLocation: driverDelete.errorLocation });
  }
  
    res.status(200).json({ success: "driver deleted" });
  } catch (err) {
    res.status(500).json({error: "Error Occurred", errorMessage: err, errorLocation: "Driver Controller"})
  }
  
};
