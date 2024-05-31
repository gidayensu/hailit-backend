const jwt = require("jsonwebtoken");
const { userIsUserRole } = require("../../utils/util");

export const addingAdminAuth = async (req, res, next) => {
  try {
    if (req.body && req.body.user_role === "admin") {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: "unauthorized" });
      }

      const token = authHeader.split(" ")[1];
      const user = jwt.verify(token, process.env.JWT_SECRET);
      const { user_id } = user;
      const isAdmin = await userIsUserRole(user_id, "admin");

      if (!isAdmin) {
        return res.status(401).json({ error: "unauthorized" });
      }
    }

    next();
  } catch (err) {
    return res.status(403).json({ error: "Authentication Error" });
  }
};


