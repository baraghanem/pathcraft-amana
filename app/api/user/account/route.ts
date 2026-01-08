import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { authenticateUser } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

export async function DELETE(request: NextRequest) {
    try {
        const authResult = await authenticateUser(request);
        if (authResult instanceof Response) {
            return authResult;
        }

        await connectDB();

        const user = await User.findByIdAndDelete(authResult.user.id);
        if (!user) {
            return errorResponse(new Error('User not found'), 404);
        }

        // TODO: Delete usage progress, paths, etc. associated with the user if needed.
        // For now, we just delete the user account.

        return successResponse(null, 'Account deleted successfully');
    } catch (error) {
        return errorResponse(error);
    }
}
