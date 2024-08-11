import jwt from 'jsonwebtoken';
import { Middleware } from '../types/middleware.types';

export const supaAuth:Middleware =  (req, res, next) => {
   
       const supaSecret = process.env.SUPABASE_JWT_SECRET;
    const path = req.path;
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ error: "Unauthorized - no authHeader" });
        }

        let token = authHeader;
        
        if (authHeader.length > 1) {
            token = authHeader.split(' ')[1];
            
        }
        const user = jwt.verify(token, supaSecret);
        
        if (token === '' || !token) {
            return res.status(401).json({ error: "Unauthorized - no token" });
        }

        
        if (!user) {
            return res.status(401).json({ error: "Unauthorized - token cannot be verified" });
        }

        req.user = user;
        
        next();

    } catch (err) {
        // Handle token verification errors
        
        console.error("Token verification failed:", err);
        return res.status(401).json({ error: "Token verification failed" });
    }
}


