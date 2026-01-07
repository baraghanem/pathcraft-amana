import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { hashPassword, generateToken } from '@/lib/auth';
import { registerSchema } from '@/lib/utils/validation';
import { successResponse, errorResponse, ApiError } from '@/lib/utils/apiResponse';
import { RegisterRequest, AuthResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body: RegisterRequest = await request.json();

        // Validate request body
        const validatedData = registerSchema.parse(body);

        // Check if user already exists
        const existingUser = await User.findOne({ email: validatedData.email });
        if (existingUser) {
            throw new ApiError(409, 'User with this email already exists');
        }

        // Hash password
        const hashedPassword = await hashPassword(validatedData.password);

        // Create user
        const user = await User.create({
            email: validatedData.email,
            password: hashedPassword,
            name: validatedData.name,
        });

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

        return successResponse(response, 'User registered successfully', 201);
    } catch (error) {
        return errorResponse(error);
    }
}
