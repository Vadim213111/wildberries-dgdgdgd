import { Router } from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { validateRequest, generateToken, ApiError } from "../utils/index.js";
import { loginSchema, registerSchema } from "../schemas/index.js";

const router = Router();
const prisma = new PrismaClient();

// Register
router.post("/register", async (req, res) => {
  const data = validateRequest(registerSchema, req.body);

  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    throw new ApiError(409, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: hashedPassword,
    },
  });

  const token = generateToken({ userId: user.id, email: user.email });

  res.status(201).json({
    user: { id: user.id, email: user.email, name: user.name },
    token,
  });
});

// Login
router.post("/login", async (req, res) => {
  const data = validateRequest(loginSchema, req.body);

  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const passwordMatch = await bcrypt.compare(data.password, user.password);

  if (!passwordMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = generateToken({ userId: user.id, email: user.email });

  res.json({
    user: { id: user.id, email: user.email, name: user.name },
    token,
  });
});

// Get current user
router.get("/me", (req, res) => {
  if (!req.auth) {
    throw new ApiError(401, "Unauthorized");
  }

  res.json({
    userId: req.auth.userId,
    email: req.auth.email,
  });
});

export { router as authRoutes };
