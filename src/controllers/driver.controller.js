import {
  deleteDriverService,
  getAllDriversService,
  getOneDriverService,
  updateDriverService,
} from "../services/driver.service.js";

export const getAllDrivers = async (req, res) => {
  const {
    page,
    itemsPerPage: limit,
    sortColumn,
    sortDirection,
    search
  } = req?.query;

  try {
    const allDrivers = await getAllDriversService(
      page,
      limit,
      sortColumn,
      sortDirection,
      search
    );
    if (res && res.status) {
      if (allDrivers.error) {
        
        return res
          .status(allDrivers.errorCode)
          .json({
            error: allDrivers.error,
            errorMessage: allDrivers.errorMessage,
            errorSource: allDrivers.errorSource,
          });
      }

      res.status(200).json({ ...allDrivers });
    }
  } catch (err) {
    
    if (res && res.status) {
      return res
        .status(500)
        .json({
          error: "Server Error occurred getting all drivers",
          errorMessage: err,
          errorSource: "Driver Controller",
        });
    }
  }
};

export const getOneDriver = async (req, res) => {
  const { driver_id } = req.params;
  const requester_user_id = req.user.sub;
  try {
    const driver = await getOneDriverService(driver_id, requester_user_id);
    if (driver.error) {
      return res
        .status(driver.errorCode)
        .json({
          error: driver.error,
          errorMessage: driver.errorMessage,
          errorSource: driver.errorSource,
        });
    }
    res.status(200).json({ driver });
  } catch (err) {
    return res
      .status(500)
      .json({
        error: "Error occurred getting driver",
        errorMessage: err,
        errorSource: "Driver Controller",
      });
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
    const updatedDriver = await updateDriverService(driverDetails);
    if (updatedDriver.error) {
      return res.status(updatedDriver.errorCode).json({ error: updatedDriver.error, errorMessage: updatedDriver.errorMessage, errorSource: updatedDriver.errorSource });
    }
    req.io.emit('updatedDriver', updatedDriver)
    res.status(200).json({ driver: updatedDriver });
  } catch (err) {
    return res
      .status(500)
      .json({ error: `Error occurred in updating driver: ${err}` });
  }
};

export const deleteDriver = async (req, res) => {
  const { driver_id } = req.params;
  try {
    const deletedDriver = await deleteDriverService(driver_id);
    if (deletedDriver.error) {
      return res
        .status(deletedDriver.errorCode)
        .json({
          error: deletedDriver.error,
          errorMessage: deletedDriver.errorMessage,
          errorSource: deletedDriver.errorSource,
        });
    }

    if (!deletedDriver) {
      return res
        .status(404)
        .json({ error: "driver not delete. Driver details was not found" });
    }
    req.io.emit('deletedDriver', deletedDriver)
    res.status(200).json({ success: "driver deleted", driver_id });
  } catch (err) {
    res
      .status(500)
      .json({
        error: "Error Occurred",
        errorMessage: err,
        errorSource: "Driver Controller: Delete Driver",
      });
  }
};
