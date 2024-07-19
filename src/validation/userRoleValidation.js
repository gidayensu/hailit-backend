import { ALLOWED_USER_ROLES } from "../constants/usersConstants.js";
export const userRoleValidation = async (req, res, next)=> {
    const userRole = req.body.user_role;
    if(!ALLOWED_USER_ROLES.includes(userRole)) {
        
        return res.status(401).json({err: "Wrong user role"})
    } 
    
    next();
}

