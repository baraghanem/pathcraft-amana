import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Notification from '@/lib/models/Notification';
import { authenticateUser } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

/**
 * DELETE /api/notifications/clear-all - Clear all notifications for the user
 */
export async function DELETE(request: NextRequest) {
    try {
        const authResult = await authenticateUser(request);
        if (authResult instanceof Response) return authResult;

        await connectDB();

        await Notification.deleteMany({ recipient: authResult.user.id });

        return successResponse(null, 'All notifications cleared');
    } catch (error) {
        return errorResponse(error);
    }
}
