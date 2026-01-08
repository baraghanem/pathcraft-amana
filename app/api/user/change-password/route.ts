import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { authenticateUser } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const authResult = await authenticateUser(request);
        if (authResult instanceof Response) {
            return authResult;
        }

        const body = await request.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return errorResponse(new Error('Current and new password are required'), 400);
        }

        if (newPassword.length < 6) {
            return errorResponse(new Error('Password must be at least 6 characters'), 400);
        }

        await connectDB();

        const user = await User.findById(authResult.user.id).select('+password');
        if (!user) {
            return errorResponse(new Error('User not found'), 404);
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return errorResponse(new Error('Incorrect current password'), 400);
        }

        user.password = await hashPassword(newPassword);
        await user.save();

        return successResponse(null, 'Password updated successfully');
    } catch (error) {
        return errorResponse(error);
    }
}
