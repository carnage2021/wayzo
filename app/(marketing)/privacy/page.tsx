import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Wayzo collects, uses and protects your data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Privacy" title="Your trips are yours." updated="November 22, 2026">
      <p>
        This policy explains what Wayzo collects when you use our website and web app, why we collect it and
        the choices you have. <strong>[LEGAL REVIEW]</strong>
      </p>
      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Account data:</strong> your email, name, profile photo (if you sign in with Google), home
          city, currency and preferences.
        </li>
        <li>
          <strong>Trip data:</strong> trips you create or join, bookings and tickets you upload or forward,
          plans, expenses, photos and votes.
        </li>
        <li>
          <strong>Waitlist data:</strong> your email, who you usually travel with and how you found us.
        </li>
        <li>
          <strong>Usage data:</strong> basic product analytics and error reports to keep Wayzo working.
        </li>
      </ul>
      <h2>How we use it</h2>
      <p>
        To run your trip dashboard: read your tickets, suggest places from live map data, send your daily
        brief and reminders, and keep your group in sync. We never sell your personal data.
      </p>
      <h2>Who can see your trips</h2>
      <p>
        Trips are private by default. Only members you invite can see a trip. A trip story is public only if
        you publish it, and you can unpublish it anytime.
      </p>
      <h2>Service providers</h2>
      <p>
        We use trusted processors for hosting, database and storage, AI ticket reading, maps and places, email
        and analytics. They process data only on our instructions.{" "}
        <strong>[LEGAL REVIEW: list processors]</strong>
      </p>
      <h2>Your rights</h2>
      <p>
        You can export or delete your data at any time from your account page, or by emailing us. Deleting
        your account removes your profile and your membership of trips.
      </p>
      <h2>Contact</h2>
      <p>
        Questions? Email{" "}
        <a className="text-blue font-semibold" href="mailto:hello@wayzo.app">
          hello@wayzo.app
        </a>
        .
      </p>
    </LegalPage>
  );
}
