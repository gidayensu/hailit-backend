import { handleError } from '../../utils/handleError.js';
import { userIsUserRole, riderUserId } from '../../utils/util.js';
import { CustomRequest, Middleware } from '../../types/middleware.types';

export const isAdminOrRider: Middleware = async (req, res, next) => {
    
    try {
        const path = req.path;
        const { rider_id } = req.params;
        const jwtUserId = (req as CustomRequest).user.user_id;
        const isAdmin = await userIsUserRole({userId:jwtUserId, userRole:'Admin'});
        const rider_user_id = await riderUserId(rider_id);
        
        
        
        if (rider_user_id === jwtUserId || isAdmin) {
             next ();
        } else {
         return  res.status(401).json({error:`Unauthorized to access ${path}`})
        }
    } catch (err) {
        return handleError({ error: 'Authorization error', errorMessage:`${err}`, errorCode:403, errorSource: "Admin/Rider Auth" })
    }
}


