import { Document, Types } from 'mongoose';

// ==================== User Types ====================
export interface IUser extends Document {
    _id: Types.ObjectId;
    email: string;
    password: string;
    name: string;
    avatar?: string;
    streak: number;
    lastActiveDate?: Date;
    savedPaths: Array<{ pathId: Types.ObjectId; savedAt: Date }>;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    updateStreak(): Promise<void>;
}

export interface UserPayload {
    id: string;
    email: string;
    name: string;
}

// ==================== Path/Roadmap Types ====================
export interface IStep {
    _id?: Types.ObjectId;
    title: string;
    description: string;
    resources?: string[];
    estimatedDuration?: string;
    order: number;
}

export interface IPath extends Document {
    _id: Types.ObjectId;
    title: string;
    description: string;
    category: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    steps: IStep[];
    author: Types.ObjectId;
    isPublic: boolean;
    cloneCount: number;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
}

// ==================== User Progress Types ====================
export interface IUserProgress extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    pathId: Types.ObjectId;
    completedSteps: Types.ObjectId[];
    status: 'active' | 'completed' | 'archived';
    startedAt: Date;
    lastActivityAt: Date;
    completedAt?: Date;
}

// ==================== API Types ====================

// Auth API Types
export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    token: string;
    user: {
        id: string;
        email: string;
        name: string;
        avatar?: string;
    };
}

// Path API Types
export interface CreatePathRequest {
    title: string;
    description: string;
    category: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    steps: Omit<IStep, '_id'>[];
    isPublic?: boolean;
    tags?: string[];
}

export interface UpdatePathRequest {
    title?: string;
    description?: string;
    category?: string;
    difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
    steps?: IStep[];
    isPublic?: boolean;
    tags?: string[];
}

export interface PathResponse {
    success: boolean;
    path: IPath;
}

export interface PathsListResponse {
    success: boolean;
    paths: IPath[];
    total: number;
    page: number;
    limit: number;
}

// Progress API Types
export interface UpdateProgressRequest {
    stepId: string;
    completed: boolean;
}

export interface ProgressResponse {
    success: boolean;
    progress: IUserProgress;
    completionPercentage: number;
}

// AI Generation Types
export interface GenerateRoadmapRequest {
    topic: string;
    goal?: string;
    difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
    currentLevel?: string;
}

export interface GenerateRoadmapResponse {
    success: boolean;
    roadmap: {
        title: string;
        description: string;
        category: string;
        difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
        steps: Omit<IStep, '_id'>[];
    };
}

// Generic API Response
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

// Search and Filter Types
export interface SearchParams {
    query?: string;
    category?: string;
    difficulty?: string;
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'cloneCount' | 'title';
    sortOrder?: 'asc' | 'desc';
}
