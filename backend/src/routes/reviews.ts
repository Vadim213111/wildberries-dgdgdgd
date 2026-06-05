import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { ApiError } from "../utils/index.js";

const router = Router();
const prisma = new PrismaClient();

// Get reviews
router.get("/", async (req, res) => {
  if (!req.auth) throw new ApiError(401, "Unauthorized");

  const { storeId, page = 1, limit = 20 } = req.query;

  if (!storeId) {
    throw new ApiError(400, "storeId is required");
  }

  const store = await prisma.store.findUnique({
    where: { id: String(storeId) },
  });

  if (!store || store.userId !== req.auth.userId) {
    throw new ApiError(404, "Store not found");
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { storeId: String(storeId) },
      skip,
      take: Number(limit),
      include: { product: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.review.count({ where: { storeId: String(storeId) } }),
  ]);

  res.json({
    reviews,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

export { router as reviewRoutes };
