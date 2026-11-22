import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms for using Wayzo.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Terms" title="The fine print, kept short." updated="November 22, 2026">
      <p>
        By using Wayzo you agree to these terms. Please read them. <strong>[LEGAL REVIEW]</strong>
      </p>
      <h2>Early access</h2>
      <p>
        Wayzo is in early access. Features may change, and the service may be unavailable at times. Core trip
        planning is free during early access.
      </p>
      <h2>Your content</h2>
      <p>
        You keep ownership of everything you upload. You give us permission to process it only to provide the
        service to you and your trip members.
      </p>
      <h2>AI suggestions</h2>
      <p>
        Wayzo reads tickets and suggests places with the help of AI and live map data. Always check important
        details like times, booking codes and opening hours before you travel. Wayzo does not make bookings
        for you.
      </p>
      <h2>Partner links</h2>
      <p>
        Some stay suggestions link to booking partners. We may earn a commission when you book, at no extra
        cost to you. Bookings are between you and the partner.
      </p>
      <h2>Acceptable use</h2>
      <p>
        Don&apos;t misuse Wayzo, upload content you don&apos;t have the right to share, or try to access other
        people&apos;s trips.
      </p>
      <h2>Liability</h2>
      <p>
        Wayzo is provided as is. To the extent allowed by law, we are not liable for missed connections,
        changed plans or third-party services. <strong>[LEGAL REVIEW]</strong>
      </p>
    </LegalPage>
  );
}
