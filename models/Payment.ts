import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  amount: number;
  method: "bank" | "jazzcash" | "easypaisa" | "card";
  screenshotUrl?: string;       // Cloudinary URL of payment proof
  screenshotPublicId?: string;  // Cloudinary public_id
  status: "pending" | "approved" | "rejected";
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    amount: { type: Number, required: true },
    method: {
      type: String,
      enum: ["bank", "jazzcash", "easypaisa", "card"],
      required: true,
    },
    screenshotUrl: { type: String },
    screenshotPublicId: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNote: { type: String },
  },
  { timestamps: true }
);

// Indexes for performance optimization
PaymentSchema.index({ status: 1 }); // For filtering by status
PaymentSchema.index({ user: 1 }); // For user's payment history
PaymentSchema.index({ course: 1 }); // For course payment lookup
PaymentSchema.index({ createdAt: -1 }); // For sorting recent payments
PaymentSchema.index({ user: 1, course: 1, status: 1 }); // Compound index for duplicate check

const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;
