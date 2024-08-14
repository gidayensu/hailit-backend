import {
  deleteDriverService,
  
  getAllDriversService,
  getOneDriverService,
  updateDriverService,
} from "../services/driver.service";
import { DispatcherDetails } from "../types/dispatcher.types";
import { Middleware } from "../types/middleware.types";
import { isErrorResponse } from "../utils/util";


export const getAllDrivers:Middleware = async (req, res) => {
  const {
    page,
    itemsPerPage: limit,
    sortColumn,
    sortDirection,
    search
  } = req.query;

  try {
    const allDrivers = await getAllDriversService({
      page,
      limit,
      sortColumn,
      sortDirection,
      search,
    });
    if (res && res.status) {
      if (isErrorResponse(allDrivers)) {
        
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

export const getOneDriver: Middleware  = async (req, res) => {
  const { driver_id } = req.params;
  const requesterUserId = req.user.sub;
  try {
    const driver = await getOneDriverService({driverId:driver_id, requesterUserId});
    if (isErrorResponse(driver)) {
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

export const updateDriver : Middleware = async (req, res) => {
  const { driver_id } = req.params;
  const { vehicle_id } = req.body;

  const driverDetails: DispatcherDetails = { driver_id, ...req.body };

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

export const deleteDriver : Middleware = async (req, res) => {
  const { driver_id } = req.params;
  try {
    const driverDeleted = await deleteDriverService(driver_id);
    if (isErrorResponse(driverDeleted)) {
      return res
        .status(driverDeleted.errorCode)
        .json({
          error: driverDeleted.error,
          errorMessage: driverDeleted.errorMessage,
          errorSource: driverDeleted.errorSource,
        });
    }

    if (!driverDeleted) {
      return res
        .status(404)
        .json({ error: "driver not delete. Driver details was not found" });
    }
    
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
