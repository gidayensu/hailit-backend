
import { deleteDriverService, getAllDriversService, getOneDriverService, updateDriverService} from "../services/driver.service.js";

export const getAllDrivers = async (req, res) => {
  try {
    const allDrivers = await getAllDriversService();
    if (res && res.status) {
      if(allDrivers.error) {
        
        return res.status(200).json({error: allDrivers.error})
      }
      res.status(200).json({ drivers: allDrivers });
    }
  } catch (error) {
    if (res && res.status) {
      res.status(500).json({ error: "server error in getting drivers" });
    }
  }
};

export const getOneDriver = async (req, res) => {
  const { driver_id } = req.params;
  try {
    const driver = await getOneDriverService(driver_id);
    if (driver.error) {
      res.status(200).json({ error: driver.error });
    } 
      res.status(400).json({ driver });
    
  } catch (err) {
    return { error: `Error occurred getting driver: ${err}` };
  }
};
//DRIVER NOT ADDED BECAUSE RIDERS WILL BE ADDED THROUGH THE USER ROUTE
// const addDriver = async (req, res) => {
//   const { user_id, vehicle_id } = req.body;
//   const driverAdd = await addDriverService(user_id, vehicle_id);
//   if (driverAdd) {
//     res.status(200).json({ success: "driver added" });
//   } else {
//     res.status(400).json({ error: "driver not added" });
//   }
// };

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
  const driverDelete = await deleteDriverService(driver_id);
  if (driverDelete) {
    res.status(200).json({ success: "driver deleted" });
  } else {
    res.status(400).json({ error: "driver not deleted" });
  }
};
