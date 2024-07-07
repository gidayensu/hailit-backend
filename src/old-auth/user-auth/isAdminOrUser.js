const {userIsUserRole} = require ('../../utils/util');

export const isAdminOrUserAuth = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const jwtUserId = req.user.user_id;
        
        const isAdmin = await userIsUserRole(jwtUserId, 'Admin');
        const isDriver = await userIsUserRole(jwtUserId, 'Driver');
        const isRider =  await userIsUserRole(jwtUserId, 'Rider');
        const isClient  =  await userIsUserRole(jwtUserId, 'Customer');
      
        
            const userDetails = req.body;
            if (!userDetails) {
                return res.status(401).json({ error: "Invalid request body" });
            }
                
            if (userId === jwtUserId || isAdmin) {
              if (
                (userDetails.user_role === "Admin" && isAdmin) ||
                (userDetails.user_role === "Driver" && isDriver) ||
                isAdmin ||
                (userDetails.user_role === "Rider" && isRider) ||
                isAdmin ||
                (userDetails.user_role === "Customer" && isClient) ||
                isAdmin ||
                !userDetails.user_role
              ) {
                next();
              } else {
                return res
                  .status(401)
                  .json({ error: "Unauthorized to get/add/update" });
              }
            } else {
                return res.status(401).json({ error: "Unauthorized to get/add/update" });
            }          
    } catch (err) {
        return {error:"Authorization Error"}
    }
}




