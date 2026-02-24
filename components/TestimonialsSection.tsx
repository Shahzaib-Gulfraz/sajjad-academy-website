import dbConnect from "@/lib/dbConnect";
import Testimonial from "@/models/Testimonial";
import TestimonialsClient from "./TestimonialsClient";
import { MessageSquare } from "lucide-react";

interface TestimonialData {
  _id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  image?: string;
}

export default async function TestimonialsSection() {
  let testimonials: TestimonialData[] = [];

  try {
    await dbConnect();
    const testimonialDocs = await Testimonial.find({ isActive: true })
      .sort({ order: 1 })
      .limit(12)
      .lean();

    // Convert MongoDB docs to plain objects
    testimonials = testimonialDocs.map((t) => ({
      _id: t._id.toString(),
      name: t.name,
      role: t.role,
      text: t.text,
      rating: t.rating,
      image: t.image,
    }));
  } catch (error) {
    console.error("Error fetching testimonials:", error);
  }

  // If no testimonials, render fallback on server
  if (testimonials.length === 0) {
    return (
      <section className="py-20 bg-gradient-navy text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-serif mb-4">
              What Our <span className="text-gradient-gold">Students Say</span>
            </h2>
          </div>
          <div className="text-center py-12 px-4 bg-white/5 rounded-xl border border-white/10">
            <MessageSquare className="w-12 h-12 text-white/30 mx-auto mb-3" />
            <p className="text-white/60">No testimonials available yet.</p>
          </div>
        </div>
      </section>
    );
  }

  return <TestimonialsClient testimonials={testimonials} />;
}
