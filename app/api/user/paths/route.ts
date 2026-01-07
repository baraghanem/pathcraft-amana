import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Path from '@/lib/models/Path';
import { authenticateUser } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

/**
 * GET /api/user/paths - Get user's created paths
 */
export async function GET(request: NextRequest) {
    try {
        const authResult = await authenticateUser(request);
        if (authResult instanceof Response) {
            return authResult;
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status'); // e.g., 'active', 'completed'

        // Build query
        const query: any = { author: authResult.user.id };

        // Get all paths created by user
        const paths = await Path.find(query)
            .sort({ updatedAt: -1 })
            .populate('author', 'name avatar')
            .lean();

        return successResponse({ paths, total: paths.length });
    } catch (error) {
        return errorResponse(error);
    }
}
