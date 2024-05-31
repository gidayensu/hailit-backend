import express from 'express';
import { deleteDriver, getAllDrivers, getOneDriver, updateDriver } from '../../controllers/driver.controller.js';
import { isUserRole } from '../../auth/user-auth/isUserRole.js';
import { supaAuth } from '../../auth/supaAuth.js'


export const driverRouter = express.Router();

driverRouter.get('/',  getAllDrivers);

driverRouter.get('/:driver_id', getOneDriver);

// driverRouter.post('/register', addDriver);

driverRouter.put('/:driver_id', updateDriver);


driverRouter.delete('/:driver_id', isUserRole, deleteDriver);

