import {
  deleteRiderService,
  getAllRidersService,
  getOneRiderService,
  updateRiderService,
} from "../services/rider.service";

//types
import { Middleware } from "../types/middleware.types";
import { isErrorResponse } from "../utils/util";


export const getAllRiders: Middleware = async (req, res) => {
  try {
    const {
      page,
      itemsPerPage: limit,
      sortColumn,
      sortDirection,
      search
    } = req.query;

    const allRiders = await getAllRidersService({
      page,
      limit,
      sortColumn,
      sortDirection,
      search,
    });
    if (isErrorResponse(allRiders)) {
      return res && res
        .status(allRiders.errorCode)
        .json({
          error: allRiders.error,
          errorMessage: allRiders.errorMessage,
          errorSource: allRiders.errorSource,
        });
    }

    
    res && res.status(200).json(allRiders);
    
  } catch (err) {
    if (res && res.status) {
      res
        .status(500)
        .json({
          error: "Server error occurred getting all riders",
          errorMessage: `${err}`,
          errorSource: "Rider Controller",
        });
    }
  }
};

export const getOneRider: Middleware = async (req, res) => {
  const { rider_id } = req.params;
  const requesterUserId = req.user.sub;

  try {
    const rider = await getOneRiderService({id:rider_id, requesterUserId});
    if (isErrorResponse(rider)) {
      return res
        .status(rider.errorCode)
        .json({
          error: rider.error,
          errorMessage: rider.errorMessage,
          errorSource: rider.errorSource,
        });
    }
    res.status(200).json({ rider });
  } catch (err) {
    return res
      .status(500)
      .json({
        error: "Server error occurred getting rider",
        errorMessage: err,
        errorSource: "Rider Controller",
      });
  }
};

export const updateRider: Middleware = async (req, res) => {
  const { rider_id } = req.params;
  const { vehicle_id } = req.body;

  if (!rider_id && !vehicle_id) {
    return res
      .status(401)
      .json({
        error: "rider id or vehicle id missing",
        errorMessage: "",
        errorSource: "Rider Controller",
      });
  }
  const reqBody = req.body;
  const riderDetails = { ...reqBody, rider_id };

  try {
    const updatedRider = await updateRiderService(riderDetails);
    if (isErrorResponse(updatedRider)) {
      return res
      .status(updatedRider.errorCode)
      .json({
        error: updatedRider.error,
        errorMessage: updatedRider.errorMessage,
        errorSource: updatedRider.errorSource,
      });
    } 
    
    res.status(200).json({ rider: updatedRider });
  } catch (err) {
    return res
      .status(500)
      .json({
        error: "Server error occurred updating rider",
        errorMessage: err,
        errorSource: "Rider Controller",
      });
  }
};

export const deleteRider: Middleware = async (req, res) => {
  try {
    const { rider_id } = req.params;
    const deletedRider = await deleteRiderService(rider_id);
    if (isErrorResponse(deletedRider)) {
      
      return res
        .status(deletedRider.errorCode)
        .json({
          error: deletedRider.error,
          errorMessage: deletedRider.errorMessage,
          errorSource: deletedRider.errorSource,
        });
    }

    if (!deletedRider) {
      res
        .status(404)
        .json({ success: false, error: "rider not deleted." });
    }
    
    res.status(200).json({ success: true, rider_id  });
  } catch (err) {
    return res
      .status(500)
      .json({
        error: "Server error occurred deleting rider",
        errorMessage: err,
        errorSource: "Rider Controller",
      });
  }
};
