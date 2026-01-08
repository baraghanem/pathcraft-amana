import mongoose, { Schema, Model } from 'mongoose';
import { IUser } from '@/lib/types';
import { comparePassword } from '@/lib/auth';

const UserSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false,
        },
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },
        avatar: {
            type: String,
            default: null,
        },
        // Streak tracking fields
        currentStreak: {
            type: Number,
            default: 0,
        },
        longestStreak: {
            type: Number,
            default: 0,
        },
        lastActivityDate: {
            type: Date,
            default: null,
        },
        totalActiveDays: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

UserSchema.index({ email: 1 });

// Method to compare password
UserSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    return comparePassword(candidatePassword, this.password);
};

// Method to update streak
UserSchema.methods.updateStreak = async function (): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActivity = this.lastActivityDate
        ? new Date(this.lastActivityDate)
        : null;

    if (lastActivity) {
        lastActivity.setHours(0, 0, 0, 0);
    }

    // If already logged activity today, do nothing
    if (lastActivity && lastActivity.getTime() === today.getTime()) {
        return;
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (!lastActivity) {
        // First activity ever
        this.currentStreak = 1;
        this.longestStreak = 1;
        this.totalActiveDays = 1;
    } else if (lastActivity.getTime() === yesterday.getTime()) {
        // Consecutive day
        this.currentStreak += 1;
        this.totalActiveDays += 1;
        if (this.currentStreak > this.longestStreak) {
            this.longestStreak = this.currentStreak;
        }
    } else if (lastActivity.getTime() < yesterday.getTime()) {
        // Streak broken
        this.currentStreak = 1;
        this.totalActiveDays += 1;
    }

    this.lastActivityDate = today;
    await this.save();
};

const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
