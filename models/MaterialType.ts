import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMaterialType extends Document {
    _id: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
    name: string;
    slug: string;
    icon: string;
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const MaterialTypeSchema = new Schema<IMaterialType>(
    {
        courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, lowercase: true, trim: true },
        icon: { type: String, default: "📄" },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

MaterialTypeSchema.index({ courseId: 1, order: 1 });
MaterialTypeSchema.index({ courseId: 1, slug: 1 }, { unique: true });

MaterialTypeSchema.virtual("id").get(function () {
    return this._id.toHexString();
});
MaterialTypeSchema.set("toJSON", { virtuals: true });
MaterialTypeSchema.set("toObject", { virtuals: true });

const MaterialType: Model<IMaterialType> =
    mongoose.models.MaterialType ||
    mongoose.model<IMaterialType>("MaterialType", MaterialTypeSchema);

export default MaterialType;
