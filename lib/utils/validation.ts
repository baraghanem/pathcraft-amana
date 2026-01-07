import { z } from 'zod';

// ==================== User Validation ====================
export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password too long'),
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name too long'),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

// ==================== Path Validation ====================
export const stepSchema = z.object({
    title: z.string().min(1, 'Step title is required').max(200),
    description: z.string().min(1, 'Step description is required').max(1000),
    resources: z.array(z.string().url()).optional(),
    estimatedDuration: z.string().optional(),
    order: z.number().int().min(0),
});

export const createPathSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(200),
    description: z
        .string()
        .min(10, 'Description must be at least 10 characters')
        .max(2000),
    category: z.string().min(1, 'Category is required'),
    difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
    steps: z
        .array(stepSchema)
        .min(1, 'At least one step is required')
        .max(50, 'Too many steps'),
    isPublic: z.boolean().optional().default(true),
    tags: z.array(z.string()).optional(),
});

export const updatePathSchema = z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().min(10).max(2000).optional(),
    category: z.string().min(1).optional(),
    difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
    steps: z.array(stepSchema).min(1).max(50).optional(),
    isPublic: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
});

// ==================== Progress Validation ====================
export const updateProgressSchema = z.object({
    stepId: z.string().min(1, 'Step ID is required'),
    completed: z.boolean(),
});

// ==================== AI Generation Validation ====================
export const generateRoadmapSchema = z.object({
    topic: z.string().min(3, 'Topic must be at least 3 characters').max(200),
    goal: z.string().max(500).optional(),
    difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
    currentLevel: z.string().max(500).optional(),
});

// ==================== Search Validation ====================
export const searchParamsSchema = z.object({
    query: z.string().optional(),
    category: z.string().optional(),
    difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    sortBy: z.enum(['createdAt', 'cloneCount', 'title']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
