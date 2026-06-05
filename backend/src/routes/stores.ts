import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { validateRequest, ApiError } from "../utils/index.js";
import { createStoreSchema, updateStoreSchema } from "../schemas/index.js";
import { encryptToken } from "../utils/encryption.js";

const router = Router();
const prisma = new PrismaClient();

// Get user stores
router.get("/", async (req, res) => {
  if (!req.auth) throw new ApiError(401, "Unauthorized");

  const stores = await prisma.store.findMany({
    where: { userId: req.auth.userId },
    select: {
      id: true,
      name: true,
      wbSellerID: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.json(stores);
});

// Create store
router.post("/", async (req, res) => {
  if (!req.auth) throw new ApiError(401, "Unauthorized");

  const data = validateRequest(createStoreSchema, req.body);

  const existing = await prisma.store.findFirst({
    where: {
      userId: req.auth.userId,
      wbSellerID: data.wbSellerID,
    },
  });

  if (existing) {
    throw new ApiError(409, "Store with this seller ID already exists");
  }

  const store = await prisma.store.create({
    data: {
      userId: req.auth.userId,
      name: data.name,
      wbSellerID: data.wbSellerID,
      wbToken: encryptToken(data.wbToken),
    },
  });

  res.status(201).json({
    id: store.id,
    name: store.name,
    wbSellerID: store.wbSellerID,
    isActive: store.isActive,
  });
});

// Get store
router.get("/:id", async (req, res) => {
  if (!req.auth) throw new ApiError(401, "Unauthorized");

  const store = await prisma.store.findUnique({
    where: { id: req.params.id },
  });

  if (!store || store.userId !== req.auth.userId) {
    throw new ApiError(404, "Store not found");
  }

  res.json({
    id: store.id,
    name: store.name,
    wbSellerID: store.wbSellerID,
    isActive: store.isActive,
  });
});

// Update store
router.patch("/:id", async (req, res) => {
  if (!req.auth) throw new ApiError(401, "Unauthorized");

  const store = await prisma.store.findUnique({
    where: { id: req.params.id },
  });

  if (!store || store.userId !== req.auth.userId) {
    throw new ApiError(404, "Store not found");
  }

  const data = validateRequest(updateStoreSchema, req.body);

  const updated = await prisma.store.update({
    where: { id: req.params.id },
    data: {
      name: data.name,
      wbToken: data.wbToken ? encryptToken(data.wbToken) : undefined,
    },
  });

  res.json({
    id: updated.id,
    name: updated.name,
    wbSellerID: updated.wbSellerID,
    isActive: updated.isActive,
  });
});

// Delete store
router.delete("/:id", async (req, res) => {
  if (!req.auth) throw new ApiError(401, "Unauthorized");

  const store = await prisma.store.findUnique({
    where: { id: req.params.id },
  });

  if (!store || store.userId !== req.auth.userId) {
    throw new ApiError(404, "Store not found");
  }

  await prisma.store.delete({ where: { id: req.params.id } });

  res.status(204).send();
});

export { router as storeRoutes };
