import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Notification from '@/lib/models/Notification';
import { authenticateUser } from '@/lib/middleware/auth';
import { successResponse, errorResponse, ApiError } from '@/lib/utils/apiResponse';

/**
 * DELETE /api/notifications/[id] - Delete a specific notification
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authResult = await authenticateUser(request);
        if (authResult instanceof Response) return authResult;

        await connectDB();

        const notification = await Notification.findOneAndDelete({
            _id: id,
            recipient: authResult.user.id
        });

        if (!notification) {
            throw new ApiError(404, 'Notification not found');
        }

        return successResponse(null, 'Notification deleted successfully');
    } catch (error) {
        return errorResponse(error);
    }
}
