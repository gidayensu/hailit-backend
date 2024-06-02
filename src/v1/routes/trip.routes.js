import express from 'express';
import {addTrip, deleteTrip, getAllTrips, getOneTrip, getUserTrips, rateTrip, updateTrip} from '../../controllers/trip.controller.js';
import {isAdminOrUserAuth} from '../../auth/user-auth/isAdminOrUser.js';
import { isUserRole } from '../../auth/user-auth/isUserRole.js';
import { tripAuth } from '../../auth/trip-auth/tripAuth.js';
import { supaAuth } from '../../auth/supaAuth.js'
import { tripSupaAuth } from '../../auth/trip-auth/tripSupaAuth.js';


export const tripRouter = express.Router();


tripRouter.get('/', getAllTrips);

tripRouter.get('/user-trip/:trip_id',  getOneTrip);

tripRouter.get('/user-trips/:user_id', getUserTrips)

tripRouter.post('/add-trip/', tripSupaAuth, addTrip)

tripRouter.put('/user-trip/:trip_id', updateTrip)

tripRouter.put('/rate-trip/:trip_id', rateTrip)

tripRouter.delete('/user-trip/:trip_id',  deleteTrip)

