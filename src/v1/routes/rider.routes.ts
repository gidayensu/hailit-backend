import express from "express";
import { isAdmin } from "../../auth/isAdmin";
import { supaAuth } from "../../auth/supaAuth";
import { isUserRole } from "../../auth/user-auth/isUserRole";
import {
  deleteRider,
  getAllRiders,
  getOneRider,
  updateRider,
} from "../../controllers/rider.controller";

import { getAllRidersValidation } from "../../validation/getAllRidersValidation";
export const riderRouter = express.Router();

riderRouter.get("/", supaAuth, isAdmin, getAllRidersValidation, getAllRiders);

riderRouter.get("/:rider_id", supaAuth, isUserRole, getOneRider);

// riderRouter.post('/', addRider)

riderRouter.put("/:rider_id", supaAuth, isUserRole, updateRider);

riderRouter.delete("/:rider_id", supaAuth, isUserRole, deleteRider);
