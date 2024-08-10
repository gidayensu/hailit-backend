import express from 'express';
import { getAllVehicleValidation } from '../../validation/getAllVehicleValidation';
import { addVehicle, deleteVehicle, getAllVehicles, getOneVehicle, updateVehicle } from '../../controllers/vehicle.controller';

import { isAdmin } from '../../auth/isAdmin';
import { supaAuth } from '../../auth/supaAuth';



export const vehicleRouter = express.Router()


vehicleRouter.get('/',  supaAuth, isAdmin, getAllVehicleValidation,  getAllVehicles)

vehicleRouter.get('/:vehicle_id', supaAuth, isAdmin, getOneVehicle)

vehicleRouter.post('/add', supaAuth, isAdmin, addVehicle)

vehicleRouter.put('/:vehicle_id', supaAuth, isAdmin, updateVehicle)

vehicleRouter.delete('/:vehicle_id', supaAuth, isAdmin, deleteVehicle)

