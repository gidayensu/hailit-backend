
import { userIsUserRole, userAssociatedWithTrip } from '../../utils/util.js';

export const tripAuth = async (req, res, next)=> {
    
    try {
    const path = req.path;
    const {dispatcher_id = '', user_id = '', user_role = 'customer'} = req.user;
    
    const {trip_id} = req.params;
    const isAdmin = await userIsUserRole(user_id, 'admin');
        
    //in trips 'dispatcher' represents both rider and driver
    

    if (path.includes('/rate-trip/') && (user_role === 'driver' || user_role === 'rider')) {
        return res.status(401).json({error: 'You cannot access trip'});
    }
     
    let tripAssociation= false;
    
    user_role === 'rider' || user_role === 'driver' ? tripAssociation = await userAssociatedWithTrip(dispatcher_id, trip_id, role) : tripAssociation = await userAssociatedWithTrip(user_id, trip_id, user_role)
    
    
    
    
    if(tripAssociation ===true || isAdmin) {
        
        next();
        
    } else {
        return res.status(401).json({error: 'You cannot access trip'});
    }
    
} catch (err) {
    console.log(err)
    return { error: `Trip Access Authorization error, ${err}` };
}

}



