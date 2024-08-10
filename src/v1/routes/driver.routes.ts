import express from "express";
import { supaAuth } from "../../auth/supaAuth.js";
import {
  deleteDriver,
  getAllDrivers,
  getOneDriver,
  updateDriver,
} from "../../controllers/driver.controller.js";

import { getAllDriversValidation } from "../../validation/getAllDriversValidation.js";
import { isAdmin } from "../../auth/isAdmin.js";

export const driverRouter = express.Router();

driverRouter.get("/", supaAuth, isAdmin, getAllDriversValidation, getAllDrivers);
 
driverRouter.get("/:driver_id", supaAuth, isAdmin, getOneDriver);

// driverRouter.post('/register', addDriver);

driverRouter.put("/:driver_id", supaAuth, isAdmin, updateDriver);

driverRouter.delete("/:driver_id", supaAuth, isAdmin, deleteDriver);
 