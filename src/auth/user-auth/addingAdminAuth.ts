
import jwt from "jsonwebtoken";
import { userIsUserRole } from "../../utils/util";
import { Middleware } from "../../types/middleware.types";

export const addingAdminAuth: Middleware = async (req, res, next) => {
  try {
    const supaSecret = process.env.SUPABASE_JWT_SECRET;
    if (req.body && req.body.user_role === "Admin") {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: "unauthorized" });
      }

      const token = authHeader.split(" ")[1];
      const user = jwt.verify(token, supaSecret);
      const { user_id } = user;
      const isAdmin = await userIsUserRole({userId:user_id, userRole:"Admin"});

      if (!isAdmin) {
        return res.status(401).json({ error: "unauthorized" });
      }
    }

    next();
  } catch (err) {
    return res.status(403).json({ error: `Authentication Error: ${err}` });
  }
};


