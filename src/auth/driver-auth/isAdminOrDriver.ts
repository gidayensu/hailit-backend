import { Middleware } from '../../types/middleware.types';
import { handleError } from '../../utils/handleError';
import { driverUserId, userIsUserRole } from '../../utils/util';

export const isAdminOrRider: Middleware = async (req, res, next) => {
    
    try {
        const path = req.path;
        const { driver_id } = req.params;
        const jwtUserId = req.user.user_id;
        const isAdmin = await userIsUserRole({userId:jwtUserId, userRole:'Admin'});
        const driver_user_id = await driverUserId(driver_id);
        
        if (driver_user_id === jwtUserId || isAdmin) {
             next ();
        } else {
         return  res.status(401).json({error:`Unauthorized to access ${path}`})
        }
    } catch (err) {
        return handleError({ error: 'Authorization error', errorMessage:`${err}`, errorCode:403, errorSource: "Admin/Driver Auth" })
    }
}


