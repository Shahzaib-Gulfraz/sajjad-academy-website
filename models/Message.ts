import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessage extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    status: "unread" | "read" | "replied";
    adminReply: string;
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        phone: { type: String, default: "" },
        subject: { type: String, required: true, trim: true },
        message: { type: String, required: true },
        status: {
            type: String,
            enum: ["unread", "read", "replied"],
            default: "unread",
        },
        adminReply: { type: String, default: "" },
    },
    { timestamps: true }
);

MessageSchema.index({ status: 1 });
MessageSchema.index({ createdAt: -1 });

MessageSchema.virtual("id").get(function () {
    return this._id.toHexString();
});
MessageSchema.set("toJSON", { virtuals: true });
MessageSchema.set("toObject", { virtuals: true });

const Message: Model<IMessage> =
    mongoose.models.Message ||
    mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
