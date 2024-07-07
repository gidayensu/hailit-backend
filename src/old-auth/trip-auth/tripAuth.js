const {userAssociatedWithTrip, userIsUserRole} = require ('../../utils/util')


export const tripAuth = async (req, res, next)=> {
    
    try {
    const path = req.path;
    const {driver_id, user_id, user_role} = req.user;
    
    const {trip_id} = req.params;
    const isAdmin = await userIsUserRole(user_id, 'Admin');
        
    //in trips 'Driver' represents both rider and driver
    let role = 'Customer';
    user_role === 'Driver' || user_role === 'Rider' ? role = 'Driver' : role;
    

    if (path.includes('/rate-trip/') && role === 'Driver') {
        return res.status(401).json({error: 'You cannot access trip'});
    }
     
    let tripAssociation= false;
    
    user_role === 'Driver' ? tripAssociation = await userAssociatedWithTrip(driver_id, trip_id, role) : tripAssociation = await userAssociatedWithTrip(user_id, trip_id, role)
    
    
    
    if(tripAssociation ===true || isAdmin) {
        
        next();
        
    } else {
        return res.status(401).json({error: 'You cannot access trip'});
    }
    
} catch (err) {
    return {error:"Trip Access Authorization Error"}
}

}



