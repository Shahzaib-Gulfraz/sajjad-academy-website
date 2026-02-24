import mongoose, { Schema, Document, Model } from "mongoose";
import "@/models/Class";

export interface ICourse extends Document {
  _id: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  thumbnail: string;
  thumbnailPublicId: string;
  icon: string;
  tags: string[];
  instructor: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    thumbnail: { type: String, default: "" },
    thumbnailPublicId: { type: String, default: "" },
    icon: { type: String, default: "📚" },
    tags: [{ type: String }],
    instructor: { type: String, default: "" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CourseSchema.index({ classId: 1, order: 1 });
CourseSchema.index({ isActive: 1 });
CourseSchema.index({ slug: 1 });
CourseSchema.index({ classId: 1, slug: 1 }, { unique: true });
CourseSchema.index({ name: "text" });
CourseSchema.index({ createdAt: -1 });

CourseSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
CourseSchema.set("toJSON", { virtuals: true });
CourseSchema.set("toObject", { virtuals: true });

const Course: Model<ICourse> =
  mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema);

export default Course;
