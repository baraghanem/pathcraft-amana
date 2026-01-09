import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Notification from '@/lib/models/Notification';
import { authenticateUser } from '@/lib/middleware/auth';
import { successResponse, errorResponse, ApiError } from '@/lib/utils/apiResponse';

/**
 * POST /api/notifications/[id]/read - Mark a specific notification as read
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authResult = await authenticateUser(request);
        if (authResult instanceof Response) return authResult;

        await connectDB();

        const notification = await Notification.findOneAndUpdate(
            { _id: id, recipient: authResult.user.id },
            { $set: { read: true } },
            { new: true }
        );

        if (!notification) {
            throw new ApiError(404, 'Notification not found');
        }

        return successResponse({ notification }, 'Notification marked as read');
    } catch (error) {
        return errorResponse(error);
    }
}
