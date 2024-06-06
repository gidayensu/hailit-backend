import express from 'express';
import { deleteRider, getAllRiders, getOneRider, updateRider } from '../../controllers/rider.controller.js';
import { isUserRole } from '../../auth/user-auth/isUserRole.js';
import { supaAuth } from '../../auth/supaAuth.js'
import {isAdminOrRider} from '../../auth/rider-auth/isAdminOrRider.js';
import { isAdmin } from '../../auth/isAdmin.js';

export const riderRouter = express.Router();





riderRouter.get('/', supaAuth, isAdmin, getAllRiders)

riderRouter.get('/:rider_id', supaAuth, isUserRole, getOneRider)

// riderRouter.post('/', addRider)

riderRouter.put('/:rider_id', supaAuth, isUserRole, updateRider)

riderRouter.delete('/:rider_id', supaAuth, isUserRole, deleteRider);

