import { deleteRiderService, getAllRidersService, getOneRiderService, updateRiderService } from '../services/rider.service.js';

export const getAllRiders = async (req, res) => {
  try {
    const limit = req.query.limit;
    const offset = req.query.offset;

    const allRiders = await getAllRidersService(limit, offset);
    if(limit && offset) {
      return res.status(200).json(allRiders)
    }
    if (allRiders.error) {
      return res.status(allRiders.errorCode).json({ error: allRiders.error, errorMessage: allRiders.errorMessage, errorLocation: allRiders.errorLocation });
    }
    if (res && res.status) {
      res.status(200).json({ riders: allRiders });
    }
  } catch (error) {
    if (res && res.status) {
      res.status(500).json({ error: "Server error occurred getting all riders", errorMessage: err, errorLocation: "Rider Controller" });
    }
  }
};

export const getOneRider = async (req, res) => {
  const { rider_id } = req.params;
  try {
    const rider = await getOneRiderService(rider_id);

    if (rider.error) {
      return res.status(rider.errorCode).json({ error: rider.error, errorMessage: rider.errorMessage, errorLocation: rider.errorLocation });
    }
    res.status(400).json({ rider });

  } catch (err) {
    return res.status(500).json({ error: "Server error occurred getting rider", errorMessage: err, errorLocation: "Rider Controller" });
  }
};



export const updateRider = async (req, res) => {
  const { rider_id } = req.params;
  const { vehicle_id } = req.body;


  if (!rider_id && !vehicle_id) {
    return res.status(401).json({ error: "rider id or vehicle id missing", errorMessage: null, errorLocation: "Rider Controller" });
  }
  const reqBody = req.body;
  const riderDetails = { ...reqBody, rider_id }

  try {
    const riderUpdate = await updateRiderService(riderDetails);
    if (!riderUpdate.error) {
      res.status(200).json({ rider: riderUpdate });
    } else {
      res.status(riderUpdate.errorCode).json({ error: riderUpdate.error, errorMessage: riderUpdate.errorMessage, errorLocation: riderUpdate.errorLocation });
    }
  } catch (err) {
    return res.status(500).json({ error: "Server error occurred updating rider", errorMessage: err, errorLocation: "Rider Controller" });
  }
};

export const deleteRider = async (req, res) => {
  try {
    const { rider_id } = req.params;
    const riderDelete = await deleteRiderService(rider_id);
    if (riderDelete) {
      res.status(200).json({ success: "rider deleted" });
    } else {
      res.status(400).json({ error: "rider not deleted" });
    }
  } catch (err) {
    return res.status(500).json({ error: "Server error occurred deleting rider", errorMessage: err, errorLocation: "Rider Controller" });
  }
};
