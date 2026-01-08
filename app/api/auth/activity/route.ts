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

        await connectDB();

        const user = await User.findById(authResult.user.id);
        if (!user) {
            return errorResponse(new Error('User not found'), 404);
        }

        // Update streak
        await user.updateStreak();

        return successResponse({
            currentStreak: user.currentStreak,
            longestStreak: user.longestStreak,
            totalActiveDays: user.totalActiveDays,
        }, 'Activity tracked');
    } catch (error) {
        return errorResponse(error);
    }
}
