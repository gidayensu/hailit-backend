import express from 'express';
import {isAdminOrUserAuth} from '../../auth/user-auth/isAdminOrUser.js';
import { isUserRole, userIsAdmin } from '../../auth/user-auth/isUserRole.js';
import { supaAuth } from '../../auth/supaAuth.js'
import { addUser, deleteUser, getAllUsers, getOneUser, updateUser } from '../../controllers/user.controller.js';
import {userRoleValidation} from '../../validation/userRoleValidation.js';
import {addingAdminAuth} from '../../auth/user-auth/addingAdminAuth.js';
import { isAdmin } from '../../auth/isAdmin.js';


export const userRouter = express.Router();


userRouter.get('/', supaAuth, isAdmin, getAllUsers)

userRouter.get('/:userId', supaAuth, getOneUser)
userRouter.get('/admin/:userId', supaAuth, userIsAdmin)
userRouter.post('/register', addUser)

userRouter.put('/:userId', supaAuth, isUserRole, updateUser)

userRouter.delete('/:userId', supaAuth, isUserRole, deleteUser)

