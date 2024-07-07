import { deleteRiderService, getAllRidersService, getOneRiderService, updateRiderService } from '../services/rider.service.js';

export const getAllRiders = async (req, res) => {
  try {
    const page = req.query.page;
    

    const allRiders = await getAllRidersService(page);
    if (allRiders.error) {
      return res.status(allRiders.errorCode).json({ error: allRiders.error, errorMessage: allRiders.errorMessage, errorSource: allRiders.errorSource });
    }
    
    if (res && res.status) {
      res.status(200).json(allRiders)
      
    }
  } catch (error) {
    if (res && res.status) {
      res.status(500).json({ error: "Server error occurred getting all riders", errorMessage: err, errorSource: "Rider Controller" });
    }
  }
};

export const getOneRider = async (req, res) => {
  const { rider_id } = req.params;
  const requester_user_id = req.user.sub
  

  
  try {
    const rider = await getOneRiderService(rider_id, requester_user_id);
    if (rider.error) {
      return res.status(rider.errorCode).json({ error: rider.error, errorMessage: rider.errorMessage, errorSource: rider.errorSource });
    }
    res.status(200).json({ rider });

  } catch (err) {
    return res.status(500).json({ error: "Server error occurred getting rider", errorMessage: err, errorSource: "Rider Controller" });
  }
};



export const updateRider = async (req, res) => {
  const { rider_id } = req.params;
  const { vehicle_id } = req.body;


  if (!rider_id && !vehicle_id) {
    return res.status(401).json({ error: "rider id or vehicle id missing", errorMessage: null, errorSource: "Rider Controller" });
  }
  const reqBody = req.body;
  const riderDetails = { ...reqBody, rider_id }

  try {
    const riderUpdate = await updateRiderService(riderDetails);
    if (!riderUpdate.error) {
      res.status(200).json({ rider: riderUpdate });
    } else {
      res.status(riderUpdate.errorCode).json({ error: riderUpdate.error, errorMessage: riderUpdate.errorMessage, errorSource: riderUpdate.errorSource });
    }
  } catch (err) {
    return res.status(500).json({ error: "Server error occurred updating rider", errorMessage: err, errorSource: "Rider Controller" });
  }
};

export const deleteRider = async (req, res) => {
  try {
    const { rider_id } = req.params;
    const riderDelete = await deleteRiderService(rider_id);
    if (riderDelete.error) {
      return res.status(riderDelete.errorCode).json({error: riderDelete.error, errorMessage: riderDelete.errorMessage, errorSource: riderDelete.errorSource})
    }

    if(!riderDelete) {
      res.status(404).json({ error: "rider not deleted. Rider details not found" });  
    }
    res.status(200).json({ success: "rider deleted" }); 
    
  } catch (err) {
    return res.status(500).json({ error: "Server error occurred deleting rider", errorMessage: err, errorSource: "Rider Controller" });
  }
};
