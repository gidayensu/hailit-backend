
import { userIsUserRole } from "../utils/util";
import { Middleware } from "../types/middleware.types";

export const isAdmin: Middleware = async (req, res, next) => {
  
  const user_id = req.user?.sub;
  
  const adminStatus = await userIsUserRole({userId:user_id, userRole:"Admin"});
  

  try {
    if (!user_id) {
      return res.status(400).json({ error: "User ID not provided in request" });
    }

    if (!adminStatus) {
      res.status(403).json({error: "Access denied. Unauthorised", errorMessage: "User is not an Admin"})
    }

    next();
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
};


