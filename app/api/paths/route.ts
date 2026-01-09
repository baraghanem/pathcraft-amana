import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Path from '@/lib/models/Path';
import { authenticateUser, getUserFromRequest } from '@/lib/middleware/auth';
import { createPathSchema, searchParamsSchema } from '@/lib/utils/validation';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { CreatePathRequest } from '@/lib/types';

/**
 * GET /api/paths - Get all public paths with search and filters
 */
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const params = Object.fromEntries(searchParams);
        const isAdminQuery = params.admin === 'true';

        // Validate and parse query parameters
        const { query, category, difficulty, page, limit, sortBy, sortOrder } =
            searchParamsSchema.parse(params);

        // Build filter query
        // If admin=true and authenticated, show all paths. Otherwise only public.
        let filter: any = { isPublic: true };

        if (isAdminQuery) {
            const authResult = await authenticateUser(request);
            if (!(authResult instanceof Response)) {
                filter = {}; // Admin sees all
            }
        }

        if (query) {
            filter.$text = { $search: query };
        }

        if (category) {
            filter.category = category;
        }

        if (difficulty) {
            filter.difficulty = difficulty;
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Build sort object
        const sort: any = {};
        if (query && filter.$text) {
            sort.score = { $meta: 'textScore' };
        } else {
            sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
        }

        // Execute query with pagination
        const [paths, total] = await Promise.all([
            Path.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('author', 'name avatar')
                .lean(),
            Path.countDocuments(filter),
        ]);

        return successResponse({
            paths,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        return errorResponse(error);
    }
}

/**
 * POST /api/paths - Create a new path (authenticated)
 */
export async function POST(request: NextRequest) {
    try {
        const authResult = await authenticateUser(request);
        if (authResult instanceof Response) {
            return authResult;
        }

        await connectDB();

        const body: CreatePathRequest = await request.json();

        // Validate request body
        const validatedData = createPathSchema.parse(body);

        // Create path
        const path = await Path.create({
            ...validatedData,
            author: authResult.user.id,
        });

        // Populate author info
        await path.populate('author', 'name avatar');

        return successResponse({ path }, 'Path created successfully', 201);
    } catch (error) {
        return errorResponse(error);
    }
}
