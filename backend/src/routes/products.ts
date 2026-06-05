import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { ApiError } from "../utils/index.js";

const router = Router();
const prisma = new PrismaClient();

// Get products
router.get("/", async (req, res) => {
  if (!req.auth) throw new ApiError(401, "Unauthorized");

  const { storeId, page = 1, limit = 20, search } = req.query;

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

  const where: any = { storeId: String(storeId) };
  if (search) {
    where.OR = [
      { name: { contains: String(search), mode: "insensitive" } },
      { description: { contains: String(search), mode: "insensitive" } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { updatedAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    products,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// Get product details
router.get("/:id", async (req, res) => {
  if (!req.auth) throw new ApiError(401, "Unauthorized");

  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { store: true },
  });

  if (!product || product.store.userId !== req.auth.userId) {
    throw new ApiError(404, "Product not found");
  }

  res.json(product);
});

export { router as productRoutes };
