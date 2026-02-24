import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMaterial extends Document {
    _id: mongoose.Types.ObjectId;
    materialTypeId: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    fileUrl: string;
    filePublicId: string;
    fileType: string;
    fileName: string;
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const MaterialSchema = new Schema<IMaterial>(
    {
        materialTypeId: { type: Schema.Types.ObjectId, ref: "MaterialType", required: true },
        courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
        title: { type: String, required: true, trim: true },
        description: { type: String, default: "" },
        fileUrl: { type: String, default: "" },
        filePublicId: { type: String, default: "" },
        fileType: { type: String, default: "" },
        fileName: { type: String, default: "" },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

MaterialSchema.index({ materialTypeId: 1, order: 1 });
MaterialSchema.index({ courseId: 1 });
MaterialSchema.index({ createdAt: -1 });

MaterialSchema.virtual("id").get(function () {
    return this._id.toHexString();
});
MaterialSchema.set("toJSON", { virtuals: true });
MaterialSchema.set("toObject", { virtuals: true });

const Material: Model<IMaterial> =
    mongoose.models.Material ||
    mongoose.model<IMaterial>("Material", MaterialSchema);

export default Material;
