import { userIsUserRole } from "../../utils/util.js";
import { Middleware } from "../../types/middleware.types";

export const isUserRole: Middleware = async (req, res, next) => {
  try {
    

    const { userId } = req.params;
    let userRole = req.body.user_role;

    if (req.body.onboard) {
      //new customer
      userRole = "Customer";
    }
    const jwtUserId = req.user.sub;

    const isAdmin = await userIsUserRole({userId:jwtUserId, userRole:"Admin"});
    const isRole = await userIsUserRole({userId:jwtUserId, userRole:userRole});
    if ((userId === jwtUserId && isRole) || isAdmin) {
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
