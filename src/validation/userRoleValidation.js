import { ALLOWED_USER_ROLES } from "../constants/usersConstants.js";


export const userRoleValidation = async (req, res, next)=> {
    
    if(req.body.user_role || req.body.user_role === ''){
        
        if(!ALLOWED_USER_ROLES.includes(req.body.user_role)) {
            
            return res.status(401).json({err: "Wrong user role"})
        } 
    }
    next();
}

