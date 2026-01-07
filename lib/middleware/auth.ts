import { NextRequest } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { UserPayload } from '@/lib/types';
import { unauthorizedResponse } from '@/lib/utils/apiResponse';

export interface AuthenticatedRequest extends NextRequest {
    user?: UserPayload;
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export async function authenticateUser(
    request: NextRequest
): Promise<{ user: UserPayload } | Response> {
    try {
        const authHeader = request.headers.get('Authorization');
        const token = extractTokenFromHeader(authHeader);

        if (!token) {
            return unauthorizedResponse('No token provided');
        }

        const user = verifyToken(token);
        return { user };
    } catch (error) {
        return unauthorizedResponse('Invalid or expired token');
    }
}

/**
 * Extract user from request (use after authenticateUser)
 */
export function getUserFromRequest(
    request: NextRequest
): UserPayload | null {
    try {
        const authHeader = request.headers.get('Authorization');
        const token = extractTokenFromHeader(authHeader);
        if (!token) return null;
        return verifyToken(token);
    } catch {
        return null;
    }
}
