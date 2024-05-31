import { userIsUserRole, riderUserId } from '../../utils/util.js';


export const isAdminOrRider = async (req, res, next) => {
    
    try {
        const path = req.path;
        const { rider_id } = req.params;
        const jwtUserId = req.user.user_id;
        const isAdmin = await userIsUserRole(jwtUserId, 'admin');
        const rider_user_id = await riderUserId(rider_id);
        
        
        
        if (rider_user_id === jwtUserId || isAdmin) {
             next ();
        } else {
         return  res.status(401).json({error:`Unauthorized to access ${path}`})
        }
    } catch (err) {
        return { error: `Authorization error, ${err}` };
    }
}


