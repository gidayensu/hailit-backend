
import { userIsUserRole } from '../../utils/util.js';
export const isUserRole = async (req, res, next) => {
    
    try {
        const path = req.path;
        
        const { userId } = req.params;
        let userRole = req.body.user_role
        
        if(req.body.onboard) { //new customer
            userRole = 'customer'
        }

        
        
        const jwtUserId = req.user.sub;
        
        const isAdmin = await userIsUserRole(jwtUserId, 'admin');
        const isRole = await userIsUserRole(jwtUserId, userRole);

        
                
        if ((userId === jwtUserId && isRole )|| isAdmin) {
             next ();
        } else {
         return  res.status(401).json({error:`Unauthorized to access ${path}`})
        }
    } catch (err) {
        return res.status(401).json({error:`Unauthorized this is the source ${err}`})
    }
}

