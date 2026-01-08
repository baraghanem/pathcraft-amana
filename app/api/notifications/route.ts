import { NextRequest } from 'next/server';
import { authenticateUser } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

// Mock data store (replace with DB methods later)
const notifications = [
    {
        id: '1',
        type: 'streak',
        title: '🔥 Streak Milestone!',
        description: 'You reached a 7 day streak!',
        time: '5 minutes ago',
        icon: '🔥',
        read: false,
    },
];

export async function GET(request: NextRequest) {
    try {
        const authResult = await authenticateUser(request);
        if (authResult instanceof Response) {
            return authResult;
        }

        // Return mock notifications
        return successResponse({ notifications });
    } catch (error) {
        return errorResponse(error);
    }
}

export async function POST(request: NextRequest) {
    // Implement mark as read, delete, etc.
    return successResponse(null, 'Notification updated');
}
