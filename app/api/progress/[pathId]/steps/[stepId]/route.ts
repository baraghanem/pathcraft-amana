import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import UserProgress from '@/lib/models/UserProgress';
import Path from '@/lib/models/Path';
import { authenticateUser } from '@/lib/middleware/auth';
import { updateProgressSchema } from '@/lib/utils/validation';
import {
    successResponse,
    errorResponse,
    notFoundResponse,
    ApiError,
} from '@/lib/utils/apiResponse';
import { Types } from 'mongoose';

interface RouteParams {
    params: Promise<{ pathId: string; stepId: string }>;
}

/**
 * PUT /api/progress/[pathId]/steps/[stepId] - Mark step as complete/incomplete
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await authenticateUser(request);
        if (authResult instanceof Response) {
            return authResult;
        }

        await connectDB();

        const { pathId, stepId } = await params;
        const body = await request.json();

        // Validate request
        const { completed } = updateProgressSchema.parse({ stepId, ...body });

        // Verify path and step exist
        const path = await Path.findById(pathId);
        if (!path) {
            return notFoundResponse('Path');
        }

        const stepExists = path.steps.some(
            (step) => step._id?.toString() === stepId
        );
        if (!stepExists) {
            throw new ApiError(404, 'Step not found in this path');
        }

        // Find or create progress record
        let progress = await UserProgress.findOne({
            userId: authResult.user.id,
            pathId,
        });

        if (!progress) {
            // Auto-create progress record if it doesn't exist
            progress = await UserProgress.create({
                userId: authResult.user.id,
                pathId,
                completedSteps: [],
                status: 'active',
            });
        }

        // Update completed steps
        const stepObjectId = new Types.ObjectId(stepId);
        const stepIndex = progress.completedSteps.findIndex(
            (id) => id.toString() === stepId
        );

        if (completed && stepIndex === -1) {
            // Add step to completed
            progress.completedSteps.push(stepObjectId);
        } else if (!completed && stepIndex !== -1) {
            // Remove step from completed
            progress.completedSteps.splice(stepIndex, 1);
        }

        // Check if all steps are completed
        const allStepsCompleted = progress.completedSteps.length === path.steps.length;
        if (allStepsCompleted && progress.status !== 'completed') {
            progress.status = 'completed';
            progress.completedAt = new Date();
        } else if (!allStepsCompleted && progress.status === 'completed') {
            progress.status = 'active';
            progress.completedAt = undefined;
        }

        progress.lastActivityAt = new Date();
        await progress.save();

        // Calculate stats
        const totalSteps = path.steps.length;
        const completedCount = progress.completedSteps.length;
        const completionPercentage = Math.round((completedCount / totalSteps) * 100);

        return successResponse({
            progress,
            completionPercentage,
            totalSteps,
            completedCount,
            stepCompleted: completed,
        });
    } catch (error) {
        return errorResponse(error);
    }
}
