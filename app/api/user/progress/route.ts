import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import UserProgress from '@/lib/models/UserProgress';
import Path from '@/lib/models/Path';
import { authenticateUser } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

/**
 * GET /api/user/progress - Get user's learning progress on all paths
 */
export async function GET(request: NextRequest) {
    try {
        const authResult = await authenticateUser(request);
        if (authResult instanceof Response) {
            return authResult;
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status'); // Filter by status

        // Build query
        const query: any = { userId: authResult.user.id };
        if (status) {
            query.status = status;
        }

        // Get all progress records with path details
        const progressRecords = await UserProgress.find(query)
            .populate({
                path: 'pathId',
                select: 'title description category difficulty steps',
                populate: {
                    path: 'author',
                    select: 'name',
                },
            })
            .sort({ lastActivityAt: -1 })
            .lean();

        // Calculate completion percentage for each
        const progressWithStats = progressRecords.map((record: any) => {
            const path = record.pathId;
            const totalSteps = path?.steps?.length || 0;
            const completedCount = record.completedSteps?.length || 0;
            const completionPercentage = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

            return {
                ...record,
                completionPercentage,
                totalSteps,
                completedCount,
            };
        });

        return successResponse({
            progress: progressWithStats,
            total: progressWithStats.length,
        });
    } catch (error) {
        return errorResponse(error);
    }
}
