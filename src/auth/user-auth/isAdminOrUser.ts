
import { userIsUserRole } from '../../utils/util.js';
import { CustomRequest, Middleware } from '../../types/middleware.types';

export const isAdminOrUserAuth: Middleware = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const jwtUserId = (req as CustomRequest).user.user_id;
        
        const isAdmin = await userIsUserRole({userId:jwtUserId, userRole:'Admin'});
        const isDriver = await userIsUserRole({userId:jwtUserId, userRole:'Driver'});
        const isRider =  await userIsUserRole({userId:jwtUserId, userRole:'Rider'});
        const isClient  =  await userIsUserRole({userId:jwtUserId, userRole:'Customer'});
      
        
            const userDetails = req.body;
            if (!userDetails) {
                return res.status(401).json({ error: "Invalid request body" });
            }
                
            if (userId === jwtUserId || isAdmin) {
                
                
                if (
                    (userDetails.user_role === 'Admin' && isAdmin) ||
                    (userDetails.user_role === 'Driver' && isDriver || isAdmin) ||
                    (userDetails.user_role === 'Rider' && isRider || isAdmin) ||
                    (userDetails.user_role === 'Customer' && isClient || isAdmin) || !userDetails.user_role
                ) {
                    
                    next();
                }  else {
                    return res.status(401).json({ error: "Unauthorized to get/add/update" });    
                }  
            } else {
                return res.status(401).json({ error: "Unauthorized to get/add/update" });
            }          
    } catch (err) {
        return   { error: `Authorization error, ${err}` };
    }
}




