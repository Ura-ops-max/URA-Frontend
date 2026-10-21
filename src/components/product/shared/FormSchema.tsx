// src/components/product/shared/FormSchema.ts
import * as z from 'zod';

export const productSchema = z.object({
  name: z.string().min(3, 'Product name is required'),
  category: z.string().min(1, 'Please select a category'),
  description: z.string().max(2000, 'Description is too long').optional().or(z.literal('')),
  price: z.string().min(1, 'Price is required'),
  stock: z.string().optional(),
  size: z.string().optional(),
});

export const postSchema = z.object({
  caption: z.string().min(1, 'Caption is required'),
  tags: z.array(z.string()).default([]),
  productId: z.string().optional(), // Link to product
});
