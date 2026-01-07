import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class ApiError extends Error {
    constructor(
        public statusCode: number,
        message: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export function successResponse<T>(data: T, message?: string, statusCode = 200) {
    return NextResponse.json(
        {
            success: true,
            data,
            message,
        },
        { status: statusCode }
    );
}

export function errorResponse(error: unknown, statusCode = 500) {
    console.error('API Error:', error);

    // Handle Zod validation errors
    if (error instanceof ZodError) {
        return NextResponse.json(
            {
                success: false,
                error: 'Validation error',
                details: error.errors.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                })),
            },
            { status: 400 }
        );
    }

    // Handle custom API errors
    if (error instanceof ApiError) {
        return NextResponse.json(
            {
                success: false,
                error: error.message,
            },
            { status: error.statusCode }
        );
    }

    // Handle Mongoose errors
    if (error && typeof error === 'object' && 'name' in error) {
        if (error.name === 'ValidationError') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Database validation error',
                    details: error,
                },
                { status: 400 }
            );
        }

        if (error.name === 'CastError') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid ID format',
                },
                { status: 400 }
            );
        }
    }

    // Handle generic errors
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
        {
            success: false,
            error: message,
        },
        { status: statusCode }
    );
}

export function notFoundResponse(resource = 'Resource') {
    return NextResponse.json(
        {
            success: false,
            error: `${resource} not found`,
        },
        { status: 404 }
    );
}

export function unauthorizedResponse(message = 'Unauthorized') {
    return NextResponse.json(
        {
            success: false,
            error: message,
        },
        { status: 401 }
    );
}

export function forbiddenResponse(message = 'Forbidden') {
    return NextResponse.json(
        {
            success: false,
            error: message,
        },
        { status: 403 }
    );
}
