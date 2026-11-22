import Link from "next/link";
import { UserMenu } from "@/components/app/user-menu";
import { Logo } from "@/components/ui/logo";
import { getProfile, requireUser } from "@/lib/auth";

/** Top-bar shell for My trips, New trip and Account. */
export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const profile = await getProfile(user.id);

  return (
    <>
      <header className="bg-ink/95 sticky top-0 z-40 border-b border-white/[.08] text-white backdrop-blur-xl">
        <div className="wrap flex h-[68px] items-center justify-between gap-4">
          <Link href="/trips" aria-label="My trips" className="text-white">
            <Logo size={34} textClassName="text-white" />
          </Link>
          <nav aria-label="App" className="flex items-center gap-2">
            <Link
              href="/trips"
              className="hidden rounded-full px-4 py-2 text-[15px] font-medium text-white/80 transition-colors hover:bg-white/[.08] hover:text-white sm:inline-flex"
            >
              My trips
            </Link>
            <UserMenu
              person={{
                id: user.id,
                name: profile?.name ?? user.email ?? null,
                avatar_url: profile?.avatar_url,
              }}
              email={user.email ?? ""}
            />
          </nav>
        </div>
      </header>
      <main className="wrap pt-8 pb-28 sm:pt-12">{children}</main>
    </>
  );
}
