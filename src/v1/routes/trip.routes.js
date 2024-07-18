
import express from 'express';
import { isAdmin } from '../../auth/isAdmin.js';
import {
  addTrip,
  deleteTrip,
  getAllTrips,
  getOneTrip,
  getUserTrips,
  getTripsCountByMonth,
  rateTrip,
  updateTrip,
  getTripMonths,
  getCurrentMonthTripCounts,
  searchTrips,
  currentWeekTripCount,
  getTripRevenueByMonth,
} from "../../controllers/trip.controller.js";
import {isAdminOrUserAuth} from '../../auth/user-auth/isAdminOrUser.js';
import { isUserRole } from '../../auth/user-auth/isUserRole.js';
import { tripAuth } from '../../auth/trip-auth/tripAuth.js';
import { supaAuth } from '../../auth/supaAuth.js'
import {addTripValidation} from '../../validation/addTripValidation.js'
import { tripSupaAuth } from '../../auth/trip-auth/tripSupaAuth.js';
import { tripStatsColumnValidation } from '../../validation/tripStatsColumnValidation.js';

export const tripRouter = express.Router();


tripRouter.get('/', supaAuth, isAdmin,  getAllTrips);

tripRouter.get('/search-trips',  supaAuth,  searchTrips);

tripRouter.get('/user-trip/:trip_id', tripSupaAuth,  getOneTrip);


tripRouter.get('/user-trips/:user_id', supaAuth, getUserTrips)

tripRouter.post('/add-trip/', tripSupaAuth, addTripValidation, addTrip)

tripRouter.put('/user-trip/:trip_id', supaAuth, updateTrip)

tripRouter.put('/rate-trip/:trip_id', supaAuth, rateTrip)

tripRouter.delete('/user-trip/:trip_id', supaAuth, deleteTrip)

//TRIP STATS
tripRouter.get('/trip-months', supaAuth, isAdmin,  getTripMonths);
tripRouter.get('/current-week-trip-count', supaAuth, isAdmin, currentWeekTripCount);
tripRouter.get('/trip-count-by-month', supaAuth, isAdmin,  tripStatsColumnValidation,   getTripsCountByMonth);
tripRouter.get('/current-month-trip-count', supaAuth, isAdmin,  getCurrentMonthTripCounts);
tripRouter.get('/trips-revenue', supaAuth, isAdmin,  getTripRevenueByMonth);
