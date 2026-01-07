import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Path from '@/lib/models/Path';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

/**
 * GET /api/categories - Get all categories with path counts
 */
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Aggregate categories and count paths
        const categories = await Path.aggregate([
            {
                $match: { isPublic: true },
            },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { count: -1 },
            },
            {
                $project: {
                    _id: 0,
                    name: '$_id',
                    count: 1,
                },
            },
        ]);

        return successResponse({ categories });
    } catch (error) {
        return errorResponse(error);
    }
}
