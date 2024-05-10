import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import sql from "../lib/db";

// Generate JWT
const generateToken = async (id: string) => {
  return await jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: "30d",
  });
};

// @desc    Authenticate a user
// @route   POST /login
// @access  Public
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!Object.keys(req.body).length) {
      return res.status(400).send("Request body is empty");
    }

    if (!email || !password) {
      return res.status(400).send("Missing 'email' or 'password' field in request body");
    }

    const user = await sql`SELECT * FROM users WHERE email = ${email}`;

    if (!user.length) {
      return res.status(400).send("Account not found");
    }

    const passwordMatch = await bcrypt.compare(password, user[0]["password"]);

    if (!passwordMatch) {
      return res.status(400).send("Password is not valid");
    }

    const token = await generateToken(user[0]["id"].toString());

    res.cookie("session", token);

    return res.status(200).json({
      id: user[0]["id"],
      email: user[0]["email"],
    });
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
};
