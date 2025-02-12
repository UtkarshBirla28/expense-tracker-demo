import { Request, Response } from "express";
import prisma from "../config/db";
import { generateToken } from "../utils/jwtUtils";
import { comparePassword, hashPassword } from "../utils/passwordUtils";

interface SignupRequest {
  email: string;
  password: string;
}

interface SigninRequest {
  email: string;
  password: string;
}

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as SignupRequest;

  try {
    const emailExists = await prisma.user.findUnique({ where: { email } });
    if (emailExists) {
      res.status(409).json({ message: "Email already exists" });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    res.status(201).json({ message: "User created successfully", user: user.email });
  } catch (error) {
    res.status(500).json({ 
      message: "Something went wrong", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
};

export const signin = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as SigninRequest;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = generateToken(user.id);
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ 
      message: "Something went wrong", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
};
