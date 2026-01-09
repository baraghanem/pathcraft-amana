import mongoose, { Schema, Model } from 'mongoose';

export interface INotification extends mongoose.Document {
    recipient: mongoose.Types.ObjectId; // Who gets the notification
    sender?: mongoose.Types.ObjectId;   // Who triggered it (optional)
    type: 'milestone' | 'reminder' | 'system' | 'social' | 'streak';
    title: string;
    description: string;
    link?: string; // Where clicking takes the user
    read: boolean;
    createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        sender: { type: Schema.Types.ObjectId, ref: 'User' },
        type: {
            type: String,
            enum: ['milestone', 'reminder', 'system', 'social', 'streak'],
            required: true
        },
        title: { type: String, required: true },
        description: { type: String, required: true },
        link: { type: String },
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Index for quick fetching of user's notifications
NotificationSchema.index({ recipient: 1, createdAt: -1 });

const Notification: Model<INotification> =
    mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;