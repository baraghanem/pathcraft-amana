import mongoose, { Schema, Model } from 'mongoose';
import { IPath, IStep } from '@/lib/types';

const StepSchema = new Schema<IStep>(
    {
        title: {
            type: String,
            required: [true, 'Step title is required'],
            trim: true,
            maxlength: [200, 'Step title cannot exceed 200 characters'],
        },
        description: {
            type: String,
            required: [true, 'Step description is required'],
            trim: true,
            maxlength: [1000, 'Step description cannot exceed 1000 characters'],
        },
        resources: {
            type: [String],
            default: [],
        },
        estimatedDuration: {
            type: String,
            default: null,
        },
        order: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        _id: true, // Enable _id for steps
    }
);

const PathSchema = new Schema<IPath>(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            minlength: [3, 'Title must be at least 3 characters'],
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
            minlength: [10, 'Description must be at least 10 characters'],
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            trim: true,
        },
        difficulty: {
            type: String,
            required: [true, 'Difficulty is required'],
            enum: {
                values: ['Beginner', 'Intermediate', 'Advanced'],
                message: 'Difficulty must be Beginner, Intermediate, or Advanced',
            },
        },
        steps: {
            type: [StepSchema],
            validate: {
                validator: function (steps: IStep[]) {
                    return steps.length > 0 && steps.length <= 50;
                },
                message: 'Path must have between 1 and 50 steps',
            },
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Author is required'],
        },
        isPublic: {
            type: Boolean,
            default: true,
        },
        cloneCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        tags: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for better query performance
PathSchema.index({ title: 'text', description: 'text' }); // Text search
PathSchema.index({ category: 1, difficulty: 1 }); // Filter by category and difficulty
PathSchema.index({ author: 1 }); // Find paths by author
PathSchema.index({ isPublic: 1, createdAt: -1 }); // Public paths sorted by date
PathSchema.index({ cloneCount: -1 }); // Sort by popularity

// Prevent model recompilation in development
const Path: Model<IPath> =
    mongoose.models.Path || mongoose.model<IPath>('Path', PathSchema);

export default Path;
