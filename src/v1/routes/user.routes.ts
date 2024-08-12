import express from "express";
import { isAdmin } from "../../auth/isAdmin";
import { supaAuth } from "../../auth/supaAuth";
import { isUserRole, userIsAdmin } from "../../auth/user-auth/isUserRole";
import { getAllUsersValidation } from "../../validation/getAllUsersValidation";
import {
  addUser,
  deleteUser,
  getAllUsers,
  getOneUser,
  updateUser,
  healthCheck
} from "../../controllers/user.controller";
import {isUser} from "../../auth/user-auth/isUser"

export const userRouter = express.Router();

userRouter.get("/", supaAuth, isAdmin,  getAllUsersValidation,  getAllUsers);

userRouter.get("/:userId",  supaAuth, isUser, getOneUser);

userRouter.get("/admin/:userId", supaAuth, userIsAdmin);

userRouter.post("/register", addUser);
userRouter.post("/health-check", healthCheck);

userRouter.put("/:userId", supaAuth, isUserRole, updateUser);

userRouter.delete("/:userId", supaAuth, isUserRole, deleteUser);
