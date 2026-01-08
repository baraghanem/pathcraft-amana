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

        const body = await request.json();
        const { name, avatar } = body;

        if (!name) {
            return errorResponse(new Error('Name is required'), 400);
        }

        await connectDB();

        const user = await User.findById(authResult.user.id);
        if (!user) {
            return errorResponse(new Error('User not found'), 404);
        }

        user.name = name;
        if (avatar !== undefined) {
            user.avatar = avatar;
        }

        await user.save();

        return successResponse({
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                avatar: user.avatar,
            },
        }, 'Profile updated successfully');
    } catch (error) {
        return errorResponse(error);
    }
}
