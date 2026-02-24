import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITestimonial extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  role: string;
  text: string;
  rating: number;
  image?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true },
    text: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
    image: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes for performance optimization
TestimonialSchema.index({ isActive: 1, order: 1 }); // Compound index for active testimonials sorted by order
TestimonialSchema.index({ rating: -1 }); // For filtering/sorting by rating

const Testimonial: Model<ITestimonial> =
  mongoose.models.Testimonial || mongoose.model<ITestimonial>("Testimonial", TestimonialSchema);

export default Testimonial;
