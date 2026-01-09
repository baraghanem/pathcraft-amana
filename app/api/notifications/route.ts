import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Notification from '@/lib/models/Notification';
import { authenticateUser } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

export async function GET(request: NextRequest) {
    try {
        const authResult = await authenticateUser(request);
        if (authResult instanceof Response) return authResult;

        await connectDB();

        // Fetch real notifications from DB
        const notifications = await Notification.find({ recipient: authResult.user.id })
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50

        // Map to format expected by frontend
        const formattedNotifications = notifications.map(n => ({
            id: n._id,
            type: n.type,
            title: n.title,
            description: n.description,
            time: new Date(n.createdAt).toLocaleDateString(), // Simple formatting
            icon: getIconForType(n.type),
            read: n.read,
            actionLink: n.link
        }));

        return successResponse({ notifications: formattedNotifications });
    } catch (error) {
        return errorResponse(error);
    }
}

// Helper to match your frontend icons
function getIconForType(type: string) {
    switch (type) {
        case 'streak': return '🔥';
        case 'milestone': return '🎉';
        case 'social': return '👥';
        case 'reminder': return '⏰';
        default: return '✨';
    }
}

// Mark all as read
export async function PUT(request: NextRequest) {
    try {
        const authResult = await authenticateUser(request);
        if (authResult instanceof Response) return authResult;

        await connectDB();

        await Notification.updateMany(
            { recipient: authResult.user.id, read: false },
            { $set: { read: true } }
        );

        return successResponse(null, 'All marked as read');
    } catch (error) {
        return errorResponse(error);
    }
}