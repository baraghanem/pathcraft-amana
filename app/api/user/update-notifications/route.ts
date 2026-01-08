import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { authenticateUser } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

export async function POST(request: NextRequest) {
    try {
        const authResult = await authenticateUser(request);
        if (authResult instanceof Response) {
            return authResult;
        }

        // Currently, we don't store notification settings in the User model.
        // This is a placeholder for future implementation where we would update 
        // a `notifications` field in the User document.

        // const body = await request.json();
        // await connectDB();
        // await User.findByIdAndUpdate(authResult.user.id, { notificationSettings: body });

        return successResponse(null, 'Notification settings updated');
    } catch (error) {
        return errorResponse(error);
    }
}
