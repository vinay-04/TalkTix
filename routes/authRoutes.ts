import { Router } from "express";
import { createUser, getUserById } from "../services/userService";
import type { UserCreationAttributes } from "../types/UserTypes";
import { User } from "../schema/User";

const router = Router();

router.post("/signup", async (req, res) => {
  try {
    const userAttributes: UserCreationAttributes = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      userType: req.body.userType,
    };
    const newUser = await createUser(userAttributes);
    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    res
      .status(500)
      .json({ error: error instanceof Error ? error.message : error });
  }
});

router.get("/user/:id", async (req, res) => {
  try {
    const user = await getUserById(Number(req.params.id));
    res.status(200).json(user);
  } catch (error) {
    res
      .status(404)
      .json({ error: error instanceof Error ? error.message : error });
  }
});

export default router;
