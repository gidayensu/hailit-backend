import express from "express";
import { isAdmin } from "../../auth/isAdmin";
import { supaAuth } from "../../auth/supaAuth";
import { tripSupaAuth } from "../../auth/trip-auth/tripSupaAuth";
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
} from "../../controllers/trip.controller";
import { getAllTripsValidation } from "../../validation/tripsValidation/getAllTripsValidation";
import { addTripValidation } from "../../validation/tripsValidation/addTripValidation";
import { rateTripValidation } from "../../validation/tripsValidation/rateTripValidation";
import { tripStatsColumnValidation } from "../../validation/tripsValidation/tripStatsColumnValidation";
import { updateTripValidation } from "../../validation/tripsValidation/updateTripValidation";
import { isAssociatedWithTrip } from "../../auth/user-auth/isAssociatedWithTrip";

export const tripRouter = express.Router();

tripRouter.get("/", supaAuth, isAdmin, getAllTripsValidation, getAllTrips);

tripRouter.get("/search-trips", supaAuth, searchTrips);

tripRouter.get("/user-trip/:trip_id", tripSupaAuth, getOneTrip);

tripRouter.get("/user-trips/:user_id", supaAuth, getUserTrips);

tripRouter.post("/add-trip/", tripSupaAuth, addTripValidation, addTrip);

tripRouter.put("/user-trip/:trip_id", supaAuth, isAssociatedWithTrip, updateTripValidation, updateTrip);

tripRouter.put("/rate-trip/:trip_id", supaAuth, rateTripValidation, rateTrip);

tripRouter.delete("/user-trip/:trip_id", supaAuth, deleteTrip);

// TRIP STATS
tripRouter.get("/trip-months", supaAuth, isAdmin, getTripMonths);

tripRouter.get("/current-week-trip-count", supaAuth, isAdmin, currentWeekTripCount);

tripRouter.get("/trip-count-by-month", supaAuth, isAdmin, tripStatsColumnValidation, getTripsCountByMonth);

tripRouter.get("/current-month-trip-count", supaAuth, isAdmin, getCurrentMonthTripCounts);

tripRouter.get("/trips-revenue", supaAuth, isAdmin, getTripRevenueByMonth);
