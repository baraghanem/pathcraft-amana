import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Notification from '@/lib/models/Notification';
import { authenticateUser } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

/**
 * POST /api/notifications/mark-all-read - Mark all notifications as read
 */
export async function POST(request: NextRequest) {
    try {
        const authResult = await authenticateUser(request);
        if (authResult instanceof Response) return authResult;

        await connectDB();

        await Notification.updateMany(
            { recipient: authResult.user.id, read: false },
            { $set: { read: true } }
        );

        return successResponse(null, 'All notifications marked as read');
    } catch (error) {
        return errorResponse(error);
    }
}
