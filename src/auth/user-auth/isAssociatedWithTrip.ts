import { userIsUserRole } from "../../utils/util.js";
import { userAssociatedWithTrip } from "../../utils/util.js";
import { Middleware } from "../../types/middleware.types";

export const isAssociatedWithTrip: Middleware = async (req, res, next) => {
  try {
    const {trip_id} = req.params

    
    const dispatcherId = req.body.dispatcher_id;
    
    const jwtUserId = req.user.sub;
    const requesterId = dispatcherId ? dispatcherId : jwtUserId;
    const requesterRole = dispatcherId ? "Dispatcher" : "Customer";
    const isAdmin = await userIsUserRole({userId:jwtUserId, userRole:"Admin"});
    const isAssociated = await userAssociatedWithTrip({tripId:trip_id, requesterId, requesterRole})
    
    if (isAssociated || isAdmin) {
      next();
    } else {
      return res.status(401).json({ error: `Unauthorized to update trip: role based` });
    }
  } catch (err) {
    return res
      .status(401)
      .json({ error: `Unauthorized this is the source ${err}` });
  }
};

export const userIsAdmin: Middleware = async(req, res) => {
  try {
    

    const { userId } = req.params;
    const jwtUserId = req.user.sub;
    const isAdmin = await userIsUserRole({userId:jwtUserId, userRole:"Admin"});

    if (userId === jwtUserId && isAdmin) {
      return res.status(200).json({ admin: true });
    } else {
      return res.status(401).json({ admin: false });
    }
  } catch (err) {
    return res.status(401).json({ error: `Unauthorized to access: ${err}` });
  }
};
