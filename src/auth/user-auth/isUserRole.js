import { userIsUserRole } from "../../utils/util.js";

export const isUserRole = async (req, res, next) => {
  try {
    

    const { userId } = req.params;
    let userRole = req.body.user_role;

    if (req.body.onboard) {
      //new customer
      userRole = "Customer";
    }
    const jwtUserId = req.user.sub;

    const isAdmin = await userIsUserRole(jwtUserId, "Admin");
    const isRole = await userIsUserRole(jwtUserId, userRole);
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

export const userIsAdmin = async (req, res) => {
  try {
    

    const { userId } = req.params;
    const jwtUserId = req.user.sub;
    const isAdmin = await userIsUserRole(jwtUserId, "Admin");

    if (userId === jwtUserId && isAdmin) {
      return res.status(200).json({ admin: true });
    } else {
      return res.status(401).json({ admin: false });
    }
  } catch (err) {
    return res.status(401).json({ error: `Unauthorized to access: ${err}` });
  }
};
