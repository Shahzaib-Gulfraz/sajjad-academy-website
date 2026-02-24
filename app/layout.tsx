import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sajjadacademy.com"),
  title: {
    default: "SH Academy — Excellence in O Level & A Level Education",
    template: "%s | SH Academy"
  },
  description:
    "Pakistan's leading Cambridge education academy. Expert faculty, proven results, and comprehensive O Level & A Level preparation. 30+ years of excellence with 95% A*/A rate.",
  keywords: [
    "IGCSE coaching",
    "AS level tutoring",
    "A2 level preparation",
    "Cambridge exams",
    "O Level coaching Pakistan",
    "A Level courses",
    "Economics tuition",
    "Business Studies coaching",
    "Sciences tuition",
    "Pakistan education",
    "Cambridge International",
    "online tutoring",
  ],
  authors: [{ name: "SH Academy" }],
  creator: "SH Academy",
  publisher: "SH Academy",

  // Open Graph for social media sharing
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sajjadacademy.com",
    title: "SH Academy — Excellence in O Level & A Level Education",
    description: "Pakistan's leading Cambridge education academy with 30+ years of excellence and 95% A*/A rate. Expert faculty and proven results.",
    siteName: "SH Academy",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SH Academy - Premier IGCSE, AS & A2 Level Coaching",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "SH Academy — Excellence in O Level & A Level Education",
    description: "Pakistan's leading Cambridge education academy with 30+ years of excellence.",
    images: ["/og-image.jpg"],
  },

  // Icons and favicons
  icons: {
    icon: "/next.svg",
  },

  // Robots directives
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Verification (add these from Google Search Console)
  verification: {
    // google: "your-google-site-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "SH Academy",
    description: "Premier IGCSE, AS & A2 Level Coaching in Pakistan",
    url: "https://sajjadacademy.com",
    logo: "https://sajjadacademy.com/logo.png",
    address: {
      "@type": "PostalAddress",
      addressCountry: "PK",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Admissions",
      email: "info@sajjadacademy.com",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "500",
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${sourceSans.variable} ${playfair.variable} font-sans antialiased`} suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
