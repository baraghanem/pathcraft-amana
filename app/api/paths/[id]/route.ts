import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Path from '@/lib/models/Path';
import { authenticateUser } from '@/lib/middleware/auth';
import { updatePathSchema } from '@/lib/utils/validation';
import {
    successResponse,
    errorResponse,
    notFoundResponse,
    forbiddenResponse,
} from '@/lib/utils/apiResponse';
import { UpdatePathRequest } from '@/lib/types';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/paths/[id] - Get single path details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        await connectDB();

        const { id } = await params;

        const path = await Path.findById(id).populate('author', 'name avatar').lean();

        if (!path) {
            return notFoundResponse('Path');
        }

        // Check if path is public or if user is the author
        if (!path.isPublic) {
            const authResult = await authenticateUser(request);
            if (authResult instanceof Response || authResult.user.id !== path.author.toString()) {
                return forbiddenResponse('This path is private');
            }
        }

        return successResponse({ path });
    } catch (error) {
        return errorResponse(error);
    }
}

/**
 * PUT /api/paths/[id] - Update path (authenticated, owner only)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await authenticateUser(request);
        if (authResult instanceof Response) {
            return authResult;
        }

        await connectDB();

        const { id } = await params;

        // Find path
        const path = await Path.findById(id);

        if (!path) {
            return notFoundResponse('Path');
        }

        // Check ownership
        if (path.author.toString() !== authResult.user.id) {
            return forbiddenResponse('You can only update your own paths');
        }

        const body: UpdatePathRequest = await request.json();

        // Validate request body
        const validatedData = updatePathSchema.parse(body);

        // Update path
        const updatedPath = await Path.findByIdAndUpdate(
            id,
            { $set: validatedData },
            { new: true, runValidators: true }
        ).populate('author', 'name avatar');

        return successResponse({ path: updatedPath }, 'Path updated successfully');
    } catch (error) {
        return errorResponse(error);
    }
}

/**
 * DELETE /api/paths/[id] - Delete path (authenticated, owner only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await authenticateUser(request);
        if (authResult instanceof Response) {
            return authResult;
        }

        await connectDB();

        const { id } = await params;

        // Find path
        const path = await Path.findById(id);

        if (!path) {
            return notFoundResponse('Path');
        }

        // Check ownership
        if (path.author.toString() !== authResult.user.id) {
            return forbiddenResponse('You can only delete your own paths');
        }

        // Delete path
        await Path.findByIdAndDelete(id);

        // TODO: Also delete associated user progress records
        // await UserProgress.deleteMany({ pathId: id });

        return successResponse(null, 'Path deleted successfully');
    } catch (error) {
        return errorResponse(error);
    }
}
