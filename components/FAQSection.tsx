import dbConnect from "@/lib/dbConnect";
import FAQ from "@/models/FAQ";
import FAQClient from "./FAQClient";
import { HelpCircle } from "lucide-react";

interface FAQData {
  _id: string;
  question: string;
  answer: string;
  category: string;
}

export default async function FAQSection() {
  let faqs: FAQData[] = [];

  try {
    await dbConnect();
    const faqDocs = await FAQ.find({ isActive: true })
      .sort({ order: 1 })
      .limit(20)
      .lean();

    // Convert MongoDB docs to plain objects
    faqs = faqDocs.map((faq) => ({
      _id: faq._id.toString(),
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
    }));
  } catch (error) {
    console.error("Error fetching FAQs:", error);
  }

  // If no FAQs, render fallback on server
  if (faqs.length === 0) {
    return (
      <section
        id="faq"
        className="py-16 sm:py-20 bg-linear-to-b from-white via-cream-50/30 to-white"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-navy-800 mb-3">
              Frequently Asked{" "}
              <span className="text-gradient-gold">Questions</span>
            </h2>
          </div>
          <div className="text-center py-12 px-4 bg-white/50 rounded-xl border border-navy-100">
            <HelpCircle className="w-12 h-12 text-navy-300 mx-auto mb-3" />
            <p className="text-navy-500">No FAQs available yet.</p>
          </div>
        </div>
      </section>
    );
  }

  return <FAQClient faqs={faqs} />;
}
