import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Path from '@/lib/models/Path';
import { authenticateUser } from '@/lib/middleware/auth';
import {
    successResponse,
    errorResponse,
    notFoundResponse,
    forbiddenResponse,
} from '@/lib/utils/apiResponse';
import Notification from '@/lib/models/Notification';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * POST /api/paths/[id]/clone - Clone a path to user's account
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await authenticateUser(request);
        if (authResult instanceof Response) {
            return authResult;
        }

        await connectDB();

        const { id } = await params;

        // Find original path
        const originalPath = await Path.findById(id);

        if (!originalPath) {
            return notFoundResponse('Path');
        }

        if (!originalPath.isPublic) {
            return forbiddenResponse('Cannot clone a private path');
        }

        // Create cloned path
        const clonedPath = await Path.create({
            title: `${originalPath.title} (Copy)`,
            description: originalPath.description,
            category: originalPath.category,
            difficulty: originalPath.difficulty,
            steps: originalPath.steps.map((step) => ({
                title: step.title,
                description: step.description,
                resources: step.resources,
                estimatedDuration: step.estimatedDuration,
                order: step.order,
            })),
            author: authResult.user.id,
            isPublic: false, // Default to private for cloned paths
            cloneCount: 0,
            tags: originalPath.tags,
        });

        // Increment clone count on original
        await Path.findByIdAndUpdate(id, { $inc: { cloneCount: 1 } });

        // Notify the original author that someone cloned their path
        if (originalPath.author.toString() !== authResult.user.id) {
            await Notification.create({
                recipient: originalPath.author,
                sender: authResult.user.id,
                type: 'social',
                title: 'Path Cloned!',
                description: `${authResult.user.name} just cloned your path "${originalPath.title}"`,
                link: `/path/${originalPath._id}`, // Link to their path
                read: false
            });
        }

        // Populate author info
        await clonedPath.populate('author', 'name avatar');

        return successResponse(
            { path: clonedPath },
            'Path cloned successfully',
            201
        );
    } catch (error) {
        return errorResponse(error);
    }
}
