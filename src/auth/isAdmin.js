
import { userIsUserRole } from "../utils/util.js";

export const isAdmin = async (req, res, next) => {
  const { user_id } = req.user;

  try {
    if (!user_id) {
      return res.status(400).json({ error: "User ID not provided in request" });
    }
    const adminStatus = await userIsUserRole(user_id, "admin");

    if (!adminStatus) {
      return res.status(403).json({ error: "Access denied" });
    }

    next();
  } catch (err) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


