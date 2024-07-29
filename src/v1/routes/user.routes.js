import express from "express";
import { isAdmin } from "../../auth/isAdmin.js";
import { supaAuth } from "../../auth/supaAuth.js";
import { isUserRole, userIsAdmin } from "../../auth/user-auth/isUserRole.js";
import { getAllUsersValidation } from "../../validation/getAllUsersValidation.js";
import {
  addUser,
  deleteUser,
  getAllUsers,
  getOneUser,
  updateUser,
} from "../../controllers/user.controller.js";
import {isUser} from "../../auth/user-auth/isUser.js"

export const userRouter = express.Router();

userRouter.get("/", supaAuth, isAdmin,  getAllUsersValidation,  getAllUsers);

userRouter.get("/:userId",  supaAuth, isUser, getOneUser);

userRouter.get("/admin/:userId", supaAuth, userIsAdmin);

userRouter.post("/register", addUser);

userRouter.put("/:userId", supaAuth, isUserRole, updateUser);

userRouter.delete("/:userId", supaAuth, isUserRole, deleteUser);
