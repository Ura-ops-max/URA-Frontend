// src/components/product/shared/FormSchema.ts
import * as z from 'zod';

export const productSchema = z.object({
  name: z.string().min(3, 'Product name is required'),
  category: z.string().min(1, 'Please select a category'),
  description: z.string().min(10, 'Provide a better description'),
  price: z.string().min(1, 'Price is required'),
  stock: z.string().optional(),
  size: z.string().optional(),
});

export const postSchema = z.object({
  caption: z.string().min(1, 'Caption is required'),
  tags: z.array(z.string()).default([]),
  productId: z.string().optional(), // Link to product
});
