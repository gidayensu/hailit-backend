import { Middleware } from "../../types/middleware.types.js";

export const rateTripValidation: Middleware = async(req, res, next)=> {
    
    const { trip_id } = req.params;

    const { dispatcher_rating } = req.body;
    if(!trip_id) {

        return res.status(403).json({ error: "Trip id not provided" });
    }
    if(typeof dispatcher_rating !== "number") {
      return res.status(403).json({ error: "Rating must be a number" });
    }
    if (!dispatcher_rating ) {
      return res.status(403).json({ error: "Driver/rider details missing" });
    }
    
    next();
}


