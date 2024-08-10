import { errorHandler } from '../../utils/errorHandler.js';
import { userIsUserRole, riderUserId } from '../../utils/util.js';


export const isAdminOrRider = async (req, res, next) => {
    
    try {
        const path = req.path;
        const { rider_id } = req.params;
        const jwtUserId = req.user.user_id;
        const isAdmin = await userIsUserRole(jwtUserId, 'Admin');
        const rider_user_id = await riderUserId(rider_id);
        
        
        
        if (rider_user_id === jwtUserId || isAdmin) {
             next ();
        } else {
         return  res.status(401).json({error:`Unauthorized to access ${path}`})
        }
    } catch (err) {
        return errorHandler({ error: 'Authorization error', errorMessage:`${err}`, errorCode:403, errorSource: "Admin/Rider Auth" })
    }
}


