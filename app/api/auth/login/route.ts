import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { generateToken } from '@/lib/auth';
import { loginSchema } from '@/lib/utils/validation';
import { successResponse, errorResponse, ApiError } from '@/lib/utils/apiResponse';
import { LoginRequest, AuthResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body: LoginRequest = await request.json();

        // Validate request body
        const validatedData = loginSchema.parse(body);

        // Find user and include password for comparison
        const user = await User.findOne({ email: validatedData.email }).select('+password');

        if (!user) {
            throw new ApiError(401, 'Invalid email or password');
        }

        // Compare password
        const isPasswordValid = await user.comparePassword(validatedData.password);

        if (!isPasswordValid) {
            throw new ApiError(401, 'Invalid email or password');
        }

        // Generate JWT token
        const token = generateToken({
            id: user._id.toString(),
            email: user.email,
            name: user.name,
        });

        const response: AuthResponse = {
            success: true,
            token,
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                avatar: user.avatar,
            },
        };

        return successResponse(response, 'Login successful');
    } catch (error) {
        return errorResponse(error);
    }
}
