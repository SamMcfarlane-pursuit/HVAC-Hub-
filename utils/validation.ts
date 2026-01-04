import { z } from 'zod';

// Authentication Schema
export const LoginSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters")
});

export type LoginRequest = z.infer<typeof LoginSchema>;

// Payment Intent Schema
export const PaymentIntentSchema = z.object({
    amount: z.number().min(50, "Minimum amount is $0.50").max(999999, "Amount precise limit exceeded"),
    currency: z.string().length(3).default('usd'),
    assetId: z.string().min(1, "Asset ID is required")
});

export type PaymentIntentRequest = z.infer<typeof PaymentIntentSchema>;

// Job Creation Schema (Retrofit)
export const JobCreateSchema = z.object({
    clientName: z.string().min(2, "Client name is required"),
    address: z.string().min(5, "Address must be valid"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    requiredSkillLevel: z.enum(['Apprentice', 'Journeyman', 'Master']),
    estimatedDuration: z.number().min(1).max(24)
});

export type JobCreateRequest = z.infer<typeof JobCreateSchema>;
