import { userIsUserRole } from "../../utils/util.js";
import { Middleware } from "../../types/middleware.types";

export const isUser: Middleware = async (req, res, next) => {
  try {
    

    const { userId } = req.params;
    
    const jwtUserId = req.user.sub;

    const isAdmin = await userIsUserRole({userId:jwtUserId, userRole:"Admin"});
    
    if ((userId === jwtUserId ) || isAdmin) {
      next();
    } else {
      return res.status(401).json({ error: `Unauthorized to access: role based` });
    }
  } catch (err) {
    return res
      .status(401)
      .json({ error: `Unauthorized this is the source ${err}` });
  }
};

