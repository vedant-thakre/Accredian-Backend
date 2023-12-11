import express from 'express';
import { deleteUser, getAllUsers, getHomeRoute, getProfile, loginUser, logoutUser, registerUser } from '../Controllers/userControllers.js';
import { authToken } from '../Middleware/authToken.js';

const router = express.Router();

router
  .post("/register", registerUser)
  .post("/login", loginUser)
  .get("/allusers", authToken, getAllUsers)
  .get("/logout", logoutUser)
  .get("/profile", getProfile)
  .get("/home", getHomeRoute)
  .delete("/delete/:id", authToken, deleteUser);

export default router