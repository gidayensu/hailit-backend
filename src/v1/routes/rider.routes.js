import express from 'express';
import { deleteRider, getAllRiders, getOneRider, updateRider } from '../../controllers/rider.controller.js';
import { isUserRole } from '../../auth/user-auth/isUserRole.js';
import { supaAuth } from '../../auth/supaAuth.js'
import {isAdminOrRider} from '../../auth/rider-auth/isAdminOrRider.js';


export const riderRouter = express.Router();





riderRouter.get('/',  getAllRiders)

riderRouter.get('/:rider_id', getOneRider)

// riderRouter.post('/', addRider)

riderRouter.put('/:rider_id', isAdminOrRider, updateRider)

riderRouter.delete('/:rider_id', isUserRole, deleteRider);

