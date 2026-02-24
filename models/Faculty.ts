import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFaculty extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    designation: string;
    experience: string;
    bio: string;
    image: string;
    imagePublicId: string;
    subjects: string[];
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const FacultySchema = new Schema<IFaculty>(
    {
        name: { type: String, required: true, trim: true },
        designation: { type: String, required: true },
        experience: { type: String, default: "" },
        bio: { type: String, default: "" },
        image: { type: String, default: "" },
        imagePublicId: { type: String, default: "" },
        subjects: [{ type: String }],
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

FacultySchema.index({ order: 1 });
FacultySchema.index({ isActive: 1 });

const Faculty: Model<IFaculty> =
    mongoose.models.Faculty || mongoose.model<IFaculty>("Faculty", FacultySchema);

export default Faculty;
