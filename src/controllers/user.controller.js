
import { addUserService, deleteUserService, getAllUsersService, getOneUserService, getUserIdUsingEmailService, updateUserService} from "../services/user.service.js";
import { emailValidator, phoneValidator } from "../utils/util.js";

import {config} from 'dotenv';

config({ path: '../../../.env' });

export const getAllUsers = async (req, res) => {
  try {
    const allUsers = await getAllUsersService();
    const user = { users: allUsers };
    if (res && res.status) {
      res.status(200).json({ users: allUsers });
      return;
    }
  } catch (err) {
    if (res && res.status) {
      res.status(500).json({ error: "server error" });
    }
  }
};

export const getOneUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (res && res.status) {
      const oneUser = await getOneUserService(userId);
      if(oneUser.error) {
        return res.status(403).json({error: oneUser.error})
      }
      res.status(200).json({ user: oneUser });
    }
    

  } catch (err) {
    if (res && res.status) {
      res.status(500).json({ error: "server error" });
    }
  }
};

export const getUserIdUsingEmail = async (req, res) => {
  try {
    const { email } = req.query;

    const userDetails = await getUserIdUsingEmailService(email);
    res.status(200).json({ user: userDetails });
  } catch (err) {
    return { error: "Wrong email" };
  }
};

export const addUser = async (req, res) => {
  try {
    const { user_id, email } = req.body;

    if (!user_id || !email) {
      return res.status(200).json({ error: "all fields are required" });
    }
    if (!emailValidator(email)) {
      return res.status(200).json({ error: "enter a correct email" });
    }

    const userDetails = req.body;
    const addingUser = await addUserService(userDetails);

    if (addingUser.error) {
      return res.status(403).json({ error: addingUser.error });
    }
    const response = { user: addingUser };

    res.status(200).json({ user: addingUser });
  } catch (err) {
    res.status(400).json({ error: "Error occurred in adding user" });
  }
};
//updating user
export const updateUser = async (req, res) => {
  try {
    const {
      first_name = "" | "unknown",
      last_name = "" | "unknown",
      email = "",
      phone_number = "",
      user_role = "",
    } = req.body;

    
    if (!first_name && !last_name && !email && !phone_number && !user_role) {
      return res.status(401).json({ error: "no information provided" });
    }

    if (!phoneValidator(phone_number)) {
      return res.status(200).json({ error: "enter a correct phone number" });
    }

    const { userId } = req.params;

    const userDetails = req.body;

    const updateUser = await updateUserService(userId, userDetails);
    res.status(200).json({user: updateUser});
  } catch (err) {
    res.status(500).json({ error: "Server error: user not updated" });
  }
};
//deleting user detail
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const userDelete = await deleteUserService(userId);

    res.status(200).json(userDelete);
  } catch (err) {
    res.status(500).json({ error: "user not deleted, server error" });
  }
};
