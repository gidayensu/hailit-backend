import express from "express";
import { isAdmin } from "../../auth/isAdmin.js";
import { supaAuth } from "../../auth/supaAuth.js";
import { tripSupaAuth } from "../../auth/trip-auth/tripSupaAuth.js";
import {
  addTrip,
  currentWeekTripCount,
  deleteTrip,
  getAllTrips,
  getCurrentMonthTripCounts,
  getOneTrip,
  getTripMonths,
  getTripRevenueByMonth,
  getTripsCountByMonth,
  getUserTrips,
  rateTrip,
  searchTrips,
  updateTrip
} from "../../controllers/trip.controller.js";
import { getAllTripsValidation } from "../../validation/tripsValidation/getAllTripsValidation.js";
import { addTripValidation } from "../../validation/tripsValidation/addTripValidation.js";
import { rateTripValidation } from "../../validation/tripsValidation/rateTripValidation.js";
import { tripStatsColumnValidation } from "../../validation/tripsValidation/tripStatsColumnValidation.js";
import { updateTripValidation } from "../../validation/tripsValidation/updateTripValidation.js";

export const tripRouter = express.Router();

tripRouter.get("/", supaAuth, isAdmin, getAllTripsValidation, getAllTrips);

tripRouter.get("/search-trips", supaAuth, searchTrips);

tripRouter.get("/user-trip/:trip_id", tripSupaAuth, getOneTrip);

tripRouter.get("/user-trips/:user_id", supaAuth, getUserTrips);

tripRouter.post("/add-trip/", tripSupaAuth, addTripValidation, addTrip);

tripRouter.put("/user-trip/:trip_id", supaAuth, updateTripValidation, updateTrip);

tripRouter.put("/rate-trip/:trip_id", supaAuth, rateTripValidation, rateTrip);

tripRouter.delete("/user-trip/:trip_id", supaAuth, deleteTrip);

// TRIP STATS
tripRouter.get("/trip-months", supaAuth, isAdmin, getTripMonths);

tripRouter.get("/current-week-trip-count", supaAuth, isAdmin, currentWeekTripCount);

tripRouter.get("/trip-count-by-month", supaAuth, isAdmin, tripStatsColumnValidation, getTripsCountByMonth);

tripRouter.get("/current-month-trip-count", supaAuth, isAdmin, getCurrentMonthTripCounts);

tripRouter.get("/trips-revenue", supaAuth, isAdmin, getTripRevenueByMonth);
