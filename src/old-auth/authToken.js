// import jwt from 'jsonwebtoken';
// import { isAdmin} from '../model/user.model'
 

// export const authenticateToken = async (req, res, next)=> {
//     try {
//     const authHeader =  req.headers.authorization;
//     if (!authHeader) {
//         return res.status(401).json({error: "unauthorized"})
//     }

//     const token =   authHeader.split(' ')[1];
//     const user = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = user;
//     next();
//     } catch (err) {
        
//         return res.status(403).json({error: "Authentication Error"})
//     }
// }



// const generateTokens = (payload)=> {
//     const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: '15min'});
//     const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: '7d'});
//     return {accessToken, refreshToken}
// }

// //the role of the user can be passed as part of the payload that is to be decoded by the isAdmin function below.
// //however a more robust approach is used to query for admin details each time before allowing any admin role to be performed.
// //this ensures that except if the database is compromised, changing user role by having access to the secret key will still not
// //allow access as an admin;

// const isAdmin = async(req, res, next)=> {
//     const {user_id} = req.user;
//     try {const adminStatus = await isAdmin(user_id);
//     if (!adminStatus) {
//         res.status(403).json({error: "Access denied"})
//     }

//     next();
//     } catch (err) {
//         return {error: `Authorization error occurred`}
//     }
// }




