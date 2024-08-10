import { userIsUserRole } from "../../utils/util.js";

export const isUser = async (req, res, next) => {
  try {
    

    const { userId } = req.params;
    
    const jwtUserId = req.user.sub;

    const isAdmin = await userIsUserRole(jwtUserId, "Admin");
    
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

