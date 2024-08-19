import jwt from "jsonwebtoken";
import { Middleware } from "../../types/middleware.types";

export const tripSupaAuth: Middleware = (req, res, next) => {
  const supaSecret = process.env.SUPABASE_JWT_SECRET;
  
  try {
    const authHeader = req.headers.authorization;
    let token = authHeader;

    if (authHeader.length > 1) {
      token = authHeader.split(" ")[1];
    }
    const user = jwt.verify(token, supaSecret);
    if (user) {
      (req as CustomRequest).user = user;
    }
  } catch (err) {
    console.error("Token verification failed:", err);
  }
  next();
};
