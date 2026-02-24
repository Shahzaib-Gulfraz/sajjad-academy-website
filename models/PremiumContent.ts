import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPremiumFeatures {
    videoCount?: number;
    pastPaperCount?: number;
    quizCount?: number;
    notesCount?: number;
    otherFeatures?: string[];
}

export interface IPremiumContent extends Document {
    _id: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    price: number;
    features: IPremiumFeatures;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const PremiumContentSchema = new Schema<IPremiumContent>(
    {
        courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
        title: { type: String, required: true, trim: true },
        description: { type: String, default: "" },
        price: { type: Number, required: true, min: 0 },
        features: {
            videoCount: { type: Number, default: 0 },
            pastPaperCount: { type: Number, default: 0 },
            quizCount: { type: Number, default: 0 },
            notesCount: { type: Number, default: 0 },
            otherFeatures: [{ type: String }],
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

PremiumContentSchema.index({ courseId: 1 });
PremiumContentSchema.index({ isActive: 1 });

PremiumContentSchema.virtual("id").get(function () {
    return this._id.toHexString();
});
PremiumContentSchema.set("toJSON", { virtuals: true });
PremiumContentSchema.set("toObject", { virtuals: true });

const PremiumContent: Model<IPremiumContent> =
    mongoose.models.PremiumContent ||
    mongoose.model<IPremiumContent>("PremiumContent", PremiumContentSchema);

export default PremiumContent;
