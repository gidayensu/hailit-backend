import express from "express";
import { isAdmin } from "../../auth/isAdmin.js";
import { supaAuth } from "../../auth/supaAuth.js";
import { isUserRole } from "../../auth/user-auth/isUserRole.js";
import {
  deleteRider,
  getAllRiders,
  getOneRider,
  updateRider,
} from "../../controllers/rider.controller.js";

import { getAllRidersValidation } from "../../validation/getAllRidersValidation.js";
export const riderRouter = express.Router();

riderRouter.get("/", supaAuth, isAdmin, getAllRidersValidation, getAllRiders);

riderRouter.get("/:rider_id", supaAuth, isUserRole, getOneRider);

// riderRouter.post('/', addRider)

riderRouter.put("/:rider_id", supaAuth, isUserRole, updateRider);

riderRouter.delete("/:rider_id", supaAuth, isUserRole, deleteRider);
