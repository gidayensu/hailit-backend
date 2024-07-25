import express from 'express';

import { addVehicle, deleteVehicle, getAllVehicles, getOneVehicle, updateVehicle } from '../../controllers/vehicle.controller.js';

import { isAdmin } from '../../auth/isAdmin.js';
import { supaAuth } from '../../auth/supaAuth.js';



export const vehicleRouter = express.Router()


vehicleRouter.get('/', supaAuth, isAdmin,  getAllVehicles)

vehicleRouter.get('/:vehicle_id', supaAuth, isAdmin, getOneVehicle)

vehicleRouter.post('/add', supaAuth, isAdmin, addVehicle)

vehicleRouter.put('/:vehicle_id', supaAuth, isAdmin, updateVehicle)

vehicleRouter.delete('/:vehicle_id', supaAuth, isAdmin, deleteVehicle)

