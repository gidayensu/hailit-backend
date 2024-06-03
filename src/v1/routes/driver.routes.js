import express from 'express';
import { deleteDriver, getAllDrivers, getOneDriver, updateDriver } from '../../controllers/driver.controller.js';
import { isUserRole } from '../../auth/user-auth/isUserRole.js';
import { supaAuth } from '../../auth/supaAuth.js'
import { userIsUserRole } from '../../utils/util.js';


export const driverRouter = express.Router();

driverRouter.get('/', supaAuth, isUserRole,  getAllDrivers);

driverRouter.get('/:driver_id', supaAuth, isUserRole, getOneDriver);

// driverRouter.post('/register', addDriver);

driverRouter.put('/:driver_id', supaAuth, isUserRole, updateDriver);


driverRouter.delete('/:driver_id', supaAuth,  isUserRole, deleteDriver);

