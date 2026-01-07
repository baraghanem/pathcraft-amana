import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { authenticateUser } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

export async function GET(request: NextRequest) {
    try {
        const authResult = await authenticateUser(request);

        // If authResult is a Response, it means authentication failed
        if (authResult instanceof Response) {
            return authResult;
        }

        await connectDB();

        // Get full user details
        const user = await User.findById(authResult.user.id);

        if (!user) {
            return errorResponse(new Error('User not found'), 404);
        }

        return successResponse({
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                avatar: user.avatar,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        return errorResponse(error);
    }
}
