import express from 'express';

import {getAllVehicles, getOneVehicle, addVehicle, updateVehicle, deleteVehicle}  from '../../controllers/vehicle.controller.js';

import {isAdminOrUserAuth} from '../../auth/user-auth/isAdminOrUser.js';
import { isUserRole } from '../../auth/user-auth/isUserRole.js';
import { supaAuth } from '../../auth/supaAuth.js'
import {isAdmin} from '../../auth/isAdmin.js';



export const vehicleRouter = express.Router()


vehicleRouter.get('/', supaAuth, isUserRole, getAllVehicles)

vehicleRouter.get('/:vehicle_id', supaAuth, isUserRole, getOneVehicle)

vehicleRouter.post('/add', supaAuth, isAdmin, addVehicle)

vehicleRouter.put('/:vehicle_id', supaAuth, isAdmin, updateVehicle)

vehicleRouter.delete('/:vehicle_id', supaAuth, isAdmin, deleteVehicle)

