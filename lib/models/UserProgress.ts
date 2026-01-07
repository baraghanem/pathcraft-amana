import mongoose, { Schema, Model } from 'mongoose';
import '@/lib/models/User';
import '@/lib/models/Path';
import { IUserProgress } from '@/lib/types';

const UserProgressSchema = new Schema<IUserProgress>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
        },
        pathId: {
            type: Schema.Types.ObjectId,
            ref: 'Path',
            required: [true, 'Path ID is required'],
        },
        completedSteps: {
            type: [Schema.Types.ObjectId],
            default: [],
        },
        status: {
            type: String,
            enum: {
                values: ['active', 'completed', 'archived'],
                message: 'Status must be active, completed, or archived',
            },
            default: 'active',
        },
        startedAt: {
            type: Date,
            default: Date.now,
        },
        lastActivityAt: {
            type: Date,
            default: Date.now,
        },
        completedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to ensure one progress record per user-path combination
UserProgressSchema.index({ userId: 1, pathId: 1 }, { unique: true });

// Index for querying user's progress
UserProgressSchema.index({ userId: 1, status: 1 });

// Index for querying by path
UserProgressSchema.index({ pathId: 1 });

// Prevent model recompilation in development
const UserProgress: Model<IUserProgress> =
    mongoose.models.UserProgress ||
    mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);

export default UserProgress;
