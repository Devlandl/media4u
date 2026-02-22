import type { Metadata } from "next";
import { ApplyPageContent } from "./apply-page-content";

export const metadata: Metadata = {
  title: "Free Website Build - Apply Now",
  description: "I'll build your website for FREE. Like what you see? Buy it. Don't like it? No charge. Professional websites for local businesses - zero risk, no contracts.",
  openGraph: {
    title: "Free Website Build - Apply Now | Media4U",
    description: "I'll build your website for FREE. Like what you see? Buy it. Don't like it? No charge.",
  },
};

export default function ApplyPage() {
  return (
    <>
      {/* LocalBusiness Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Free Website Build Application',
            description: 'Apply for a free custom website build for your business',
            url: 'https://media4u.fun/apply',
            provider: {
              '@type': 'LocalBusiness',
              name: 'Media4U',
              description: 'Professional Websites & Immersive VR Experiences',
              url: 'https://media4u.fun',
            },
          }),
        }}
      />

      <ApplyPageContent />
    </>
  );
}
