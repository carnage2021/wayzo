import type { Metadata } from "next";
import { ProfileForm } from "@/components/account/profile-form";
import { Logo } from "@/components/ui/logo";
import { getProfile, requireUser } from "@/lib/auth";
import { safeNextPath } from "@/lib/utils";
import { FOOD_PREFS } from "@/lib/validation/schemas";

export const metadata: Metadata = { title: "Welcome" };

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const user = await requireUser("/onboarding");
  const profile = await getProfile(user.id);
  const { next } = await searchParams;
  const foodPref = FOOD_PREFS.find((f) => f === profile?.food_pref) ?? null;

  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]">
      <aside className="grid-bg relative flex flex-col justify-between gap-10 overflow-hidden p-6 text-white sm:p-10 lg:p-12">
        <div
          className="absolute -bottom-40 -left-24 size-[480px] rounded-full bg-[radial-gradient(circle,rgba(215,255,61,.2),rgba(215,255,61,0)_65%)]"
          aria-hidden
        />
        <Logo size={36} textClassName="text-white" />
        <div className="relative">
          <div className="eyebrow text-lime">Step 1 of 1</div>
          <h1 className="font-display mt-4 text-[clamp(36px,4vw,56px)] leading-[1.02] font-extrabold">
            Nice to meet you{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}.
          </h1>
          <p className="mt-4 max-w-sm text-lg leading-[1.6] text-white/75">
            A few details so your briefs, budgets and food picks feel like yours. Takes 20 seconds.
          </p>
        </div>
        <p className="relative hidden text-sm text-white/60 lg:block">
          You can change all of this later in Account.
        </p>
      </aside>
      <main className="flex items-center justify-center bg-white px-6 py-12 sm:px-10">
        <div className="w-full max-w-[560px]">
          <ProfileForm
            mode="onboarding"
            next={safeNextPath(next)}
            initial={{
              name: profile?.name ?? "",
              home_city: profile?.home_city ?? "",
              currency: profile?.currency ?? "USD",
              food_pref: foodPref,
              email_notifications: profile?.email_notifications ?? true,
              push_notifications: false,
            }}
          />
        </div>
      </main>
    </div>
  );
}
