import { userIsUserRole, driverUserId } from '../../utils/util.js';


export const isAdminOrRider = async (req, res, next) => {
    
    try {
        const path = req.path;
        const { driver_id } = req.params;
        const jwtUserId = req.user.user_id;
        const isAdmin = await userIsUserRole(jwtUserId, 'admin');
        const driver_user_id = await driverUserId(driver_id);
        // for (let i = 0; i<role.length; i++) {
        //      isRole = await userIsUserRole(jwtUserId, role[i]);
        
        //     if(isRole === true) {
        //         break;
        //     }
        // }
        
        
        if (driver_user_id === jwtUserId || isAdmin) {
             next ();
        } else {
         return  res.status(401).json({error:`Unauthorized to access ${path}`})
        }
    } catch (err) {
        return { error: `Authorization error, ${err}` };
    }
}


