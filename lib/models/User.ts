import mongoose, { Schema, Model } from 'mongoose';
import { IUser } from '@/lib/types';
import bcrypt from 'bcryptjs';

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
        streak: {
            type: Number,
            default: 0,
        },
        lastActiveDate: {
            type: Date,
            default: null,
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
    return bcrypt.compare(candidatePassword, this.password);
};

// Method to update streak
UserSchema.methods.updateStreak = async function (): Promise<void> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    if (!this.lastActiveDate) {
        this.streak = 1;
        this.lastActiveDate = now;
        await this.save();
        return;
    }

    const lastActive = new Date(this.lastActiveDate);
    const lastDate = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate()).getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    if (today === lastDate) return; // Already active today

    if (today - lastDate === oneDay) {
        this.streak += 1; // Consecutive day
    } else {
        this.streak = 1; // Streak broken
    }

    this.lastActiveDate = now;
    await this.save();
};

const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
