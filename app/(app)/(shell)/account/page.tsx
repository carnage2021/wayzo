import type { Metadata } from "next";
import { DeleteAccount } from "@/components/account/delete-account";
import { EmailsManager } from "@/components/account/emails-manager";
import { ProfileForm } from "@/components/account/profile-form";
import { FlashToast } from "@/components/app/flash-toast";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { getProfile, requireUser } from "@/lib/auth";
import { db } from "@/lib/firebase/admin";
import { toUserEmail } from "@/lib/firebase/convert";
import type { UserEmailRow } from "@/lib/firebase/types";
import { FOOD_PREFS } from "@/lib/validation/schemas";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ email_verified?: string }>;
}) {
  const user = await requireUser("/account");
  const profile = await getProfile(user.id);
  const emailSnap = await db().collection("userEmails").where("user_id", "==", user.id).get();
  const emails = emailSnap.docs
    .map((d) => toUserEmail(d))
    .filter((e): e is UserEmailRow => e !== null)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map(({ id, email, verified_at }) => ({ id, email, verified_at }));
  const { email_verified } = await searchParams;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      {email_verified === "1" && <FlashToast message="Email verified" />}
      {email_verified === "0" && (
        <FlashToast variant="error" message="That link is invalid or expired. Send a new one." />
      )}

      <div className="flex items-center gap-5">
        <Avatar
          person={{ id: user.id, name: profile?.name ?? null, avatar_url: profile?.avatar_url }}
          size={72}
        />
        <div className="min-w-0">
          <div className="eyebrow text-blue">Account</div>
          <h1 className="font-display mt-2 truncate text-[clamp(28px,3.6vw,40px)] leading-[1.05] font-extrabold">
            {profile?.name ?? "Your account"}
          </h1>
        </div>
      </div>

      <Card size="lg">
        <div>
          <CardTitle className="text-[22px]">Profile</CardTitle>
          <CardDescription className="mt-1">Used for your briefs, budgets and food picks.</CardDescription>
        </div>
        <ProfileForm
          mode="account"
          initial={{
            name: profile?.name ?? "",
            home_city: profile?.home_city ?? "",
            currency: profile?.currency ?? "USD",
            food_pref: FOOD_PREFS.find((f) => f === profile?.food_pref) ?? null,
            email_notifications: profile?.email_notifications ?? true,
            push_notifications: profile?.push_notifications ?? false,
          }}
        />
      </Card>

      <Card size="lg">
        <div>
          <CardTitle className="text-[22px]">Your emails</CardTitle>
          <CardDescription className="mt-1">
            Booking emails forwarded from any verified address land in your trips automatically.
          </CardDescription>
        </div>
        <EmailsManager primaryEmail={user.email ?? ""} rows={emails} />
      </Card>

      <Card size="lg" className="border-[#FECDCA]">
        <CardTitle className="text-[22px]">Delete account</CardTitle>
        <CardDescription>Permanently delete your Wayzo account and personal data.</CardDescription>
        <DeleteAccount />
      </Card>
    </div>
  );
}
