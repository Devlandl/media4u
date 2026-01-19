import type { Metadata } from "next";
import { ContactPageContent } from "./contact-page-content";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return <ContactPageContent />;
}
