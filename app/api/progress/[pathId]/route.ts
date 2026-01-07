import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import UserProgress from '@/lib/models/UserProgress';
import Path from '@/lib/models/Path';
import { authenticateUser } from '@/lib/middleware/auth';
import {
    successResponse,
    errorResponse,
    notFoundResponse,
} from '@/lib/utils/apiResponse';

interface RouteParams {
    params: Promise<{ pathId: string }>;
}

/**
 * GET /api/progress/[pathId] - Get progress for specific path
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await authenticateUser(request);
        if (authResult instanceof Response) {
            return authResult;
        }

        await connectDB();

        const { pathId } = await params;

        // Find progress record
        const progress = await UserProgress.findOne({
            userId: authResult.user.id,
            pathId,
        })
            .populate({
                path: 'pathId',
                select: 'title description steps',
            })
            .lean();

        if (!progress) {
            return notFoundResponse('Progress record');
        }

        // Calculate completion percentage
        const path = progress.pathId as any;
        const totalSteps = path?.steps?.length || 0;
        const completedCount = progress.completedSteps?.length || 0;
        const completionPercentage = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

        return successResponse({
            progress,
            completionPercentage,
            totalSteps,
            completedCount,
        });
    } catch (error) {
        return errorResponse(error);
    }
}

/**
 * POST /api/progress/[pathId] - Start tracking a path
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await authenticateUser(request);
        if (authResult instanceof Response) {
            return authResult;
        }

        await connectDB();

        const { pathId } = await params;

        // Verify path exists
        const path = await Path.findById(pathId);
        if (!path) {
            return notFoundResponse('Path');
        }

        // Check if progress already exists
        let progress = await UserProgress.findOne({
            userId: authResult.user.id,
            pathId,
        });

        if (progress) {
            return successResponse({ progress }, 'Already tracking this path');
        }

        // Create new progress record
        progress = await UserProgress.create({
            userId: authResult.user.id,
            pathId,
            completedSteps: [],
            status: 'active',
        });

        await progress.populate({
            path: 'pathId',
            select: 'title description steps',
        });

        return successResponse(
            {
                progress,
                completionPercentage: 0,
                totalSteps: path.steps.length,
                completedCount: 0,
            },
            'Started tracking path',
            201
        );
    } catch (error) {
        return errorResponse(error);
    }
}

/**
 * PUT /api/progress/[pathId] - Update progress status
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await authenticateUser(request);
        if (authResult instanceof Response) {
            return authResult;
        }

        await connectDB();

        const { pathId } = await params;
        const { status } = await request.json();

        // Update progress
        const progress = await UserProgress.findOneAndUpdate(
            {
                userId: authResult.user.id,
                pathId,
            },
            {
                $set: {
                    status,
                    ...(status === 'completed' ? { completedAt: new Date() } : {}),
                    lastActivityAt: new Date(),
                },
            },
            { new: true }
        );

        if (!progress) {
            return notFoundResponse('Progress record');
        }

        return successResponse({ progress }, 'Progress updated');
    } catch (error) {
        return errorResponse(error);
    }
}
