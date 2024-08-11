
import { errorHandler } from '../../utils/errorHandler.js';
import { userIsUserRole, userAssociatedWithTrip } from '../../utils/util.js';
import { Middleware } from '../../types/middleware.types';

export const tripAuth: Middleware = async (req, res, next)=> {
    
    try {
      const path = req.path;
      const {
        dispatcher_id = "",
        user_id = "",
        user_role = "Customer",
      } = req.user;

      const { trip_id } = req.params;
      const isAdmin = await userIsUserRole({userId:user_id, userRole:"Admin"});

      //in trips 'dispatcher' represents both rider and driver

      if (
        path.includes("/rate-trip/") &&
        (user_role === "Driver" || user_role === "Rider")
      ) {
        return res.status(401).json({ error: "You cannot access trip" });
      }

      let tripAssociation = false;

      user_role === "Rider" || user_role === "Driver"
        ? (tripAssociation = await userAssociatedWithTrip(
            {requesterId:dispatcher_id,
            tripId:trip_id,}
            
          ))
        : (tripAssociation = await userAssociatedWithTrip(
            {requesterId:user_id,
            tripId:trip_id,
            requesterRole:user_role}
          ));

      if (tripAssociation === true || isAdmin) {
        next();
      } else {
        return res.status(401).json({ error: "You cannot access trip" });
      }
    } catch (err) {
      return errorHandler({ error: 'Trip Access Authorization error ', errorMessage:`${err}`, errorCode:403, errorSource: "Trip Auth" })
    
}

}



