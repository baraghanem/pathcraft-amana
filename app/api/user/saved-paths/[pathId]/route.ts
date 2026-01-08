import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { Types } from 'mongoose';
import { authenticateUser } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

export async function POST(
    request: NextRequest,
    { params }: { params: { pathId: string } }
) {
    try {
        const authResult = await authenticateUser(request);
        if (authResult instanceof Response) {
            return authResult;
        }

        const pathId = params.pathId;
        await connectDB();

        const user = await User.findById(authResult.user.id);
        if (!user) {
            return errorResponse(new Error('User not found'), 404);
        }

        // Initialize savedPaths if it doesn't exist (though it should from Schema)
        if (!user.savedPaths) {
            user.savedPaths = [];
        }

        // Check if already saved
        const existingIndex = user.savedPaths.findIndex(
            (item: any) => item.pathId.toString() === pathId
        );

        if (existingIndex === -1) {
            user.savedPaths.push({ pathId: new Types.ObjectId(pathId), savedAt: new Date() });
            await user.save();
        }

        return successResponse(null, 'Path saved successfully');
    } catch (error) {
        return errorResponse(error);
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { pathId: string } }
) {
    try {
        const authResult = await authenticateUser(request);
        if (authResult instanceof Response) {
            return authResult;
        }

        const pathId = params.pathId;
        await connectDB();

        const user = await User.findById(authResult.user.id);
        if (!user) {
            return errorResponse(new Error('User not found'), 404);
        }

        if (user.savedPaths) {
            user.savedPaths = user.savedPaths.filter(
                (item: any) => item.pathId.toString() !== pathId
            );
            await user.save();
        }

        return successResponse(null, 'Path removed from saved');
    } catch (error) {
        return errorResponse(error);
    }
}
