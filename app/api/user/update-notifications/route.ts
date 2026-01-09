import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { authenticateUser } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

export async function POST(request: NextRequest) {
    try {
        const authResult = await authenticateUser(request);
        if (authResult instanceof Response) return authResult;

        const body = await request.json(); // e.g., { emailAlerts: true, streakReminders: false }
        await connectDB();

        // Update the user's notification settings field
        await User.findByIdAndUpdate(authResult.user.id, {
            notificationSettings: body
        });

        return successResponse(null, 'Preferences updated successfully');
    } catch (error) {
        return errorResponse(error);
    }
}
