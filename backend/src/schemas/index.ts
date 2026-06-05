import { z } from "zod";

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;

// Store schemas
export const createStoreSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  wbToken: z.string().min(1, "WB token is required"),
  wbSellerID: z.string().min(1, "WB Seller ID is required"),
});

export const updateStoreSchema = createStoreSchema.partial();

export type CreateStoreRequest = z.infer<typeof createStoreSchema>;
export type UpdateStoreRequest = z.infer<typeof updateStoreSchema>;

// Product schemas
export const updateProductSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  discount: z.number().min(0).max(100).optional(),
  stock: z.number().nonnegative().optional(),
});

export const generateDescriptionSchema = z.object({
  targetAudience: z.string().min(1, "Target audience is required"),
  advantages: z.array(z.string()).min(1, "At least one advantage is required"),
  style: z.enum(["formal", "casual", "creative"], {
    errorMap: () => ({ message: "Invalid text style" }),
  }),
  keywords: z.array(z.string()).optional(),
  maxLength: z.number().min(100).max(5000).optional(),
});

export type UpdateProductRequest = z.infer<typeof updateProductSchema>;
export type GenerateDescriptionRequest = z.infer<typeof generateDescriptionSchema>;

// Order schemas
export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "assembled", "shipped", "delivered", "cancelled"], {
    errorMap: () => ({ message: "Invalid order status" }),
  }),
});

export type UpdateOrderStatusRequest = z.infer<typeof updateOrderStatusSchema>;

// Review schemas
export const respondToReviewSchema = z.object({
  response: z.string().min(10, "Response must be at least 10 characters").max(1000),
});

export type RespondToReviewRequest = z.infer<typeof respondToReviewSchema>;
