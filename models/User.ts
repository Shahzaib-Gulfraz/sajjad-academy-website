import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: "student" | "admin";
  subscribedCourses: mongoose.Types.ObjectId[];
  status: "active" | "suspended";
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    subscribedCourses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    resetToken: { type: String, select: false },
    resetTokenExpiry: { type: Date, select: false },
  },
  { timestamps: true }
);

// Indexes for performance optimization
// Note: email index is automatically created by unique: true
UserSchema.index({ role: 1 }); // For filtering by role (student/admin)
UserSchema.index({ status: 1 }); // For filtering active users
UserSchema.index({ createdAt: -1 }); // For sorting by registration date

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
