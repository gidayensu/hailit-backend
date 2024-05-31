const allowedUserRoles = ['admin', 'driver', 'rider', 'customer', 'dispatcher'];

export const userRoleValidation = async (req, res, next)=> {
    
    if(req.body.user_role || req.body.user_role === ''){
        
        if(!allowedUserRoles.includes(req.body.user_role)) {
            
            return res.status(401).json({err: "Wrong user role"})
        } 
    }
    next();
}

