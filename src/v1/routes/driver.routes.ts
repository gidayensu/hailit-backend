import express from "express";
import { supaAuth } from "../../auth/supaAuth";
import {
  deleteDriver,
  getAllDrivers,
  getOneDriver,
  updateDriver,
} from "../../controllers/driver.controller";

import { getAllDriversValidation } from "../../validation/getAllDriversValidation";
import { isAdmin } from "../../auth/isAdmin";

export const driverRouter = express.Router();

driverRouter.get("/", supaAuth, isAdmin, getAllDriversValidation, getAllDrivers);
 
driverRouter.get("/:driver_id", supaAuth, isAdmin, getOneDriver);

// driverRouter.post('/register', addDriver);

driverRouter.put("/:driver_id", supaAuth, isAdmin, updateDriver);

driverRouter.delete("/:driver_id", supaAuth, isAdmin, deleteDriver);
 