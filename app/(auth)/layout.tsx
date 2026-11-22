import Link from "next/link";
import { Logo } from "@/components/ui/logo";

/** Split auth layout: dark grid brand panel (desktop) + form panel. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <aside className="grid-bg relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex">
        <div
          className="absolute top-1/3 -right-24 size-[520px] rounded-full bg-[radial-gradient(circle,rgba(59,91,255,.35),rgba(59,91,255,0)_65%)]"
          aria-hidden
        />
        <div
          className="border-lime/25 absolute top-1/2 left-1/2 size-[440px] -translate-x-1/2 -translate-y-1/2 animate-[spin_40s_linear_infinite] rounded-full border-[1.5px] border-dashed"
          aria-hidden
        >
          <span className="bg-lime absolute -top-[7px] left-1/2 size-3.5 rounded-full" />
        </div>
        <Link href="/" className="relative text-white" aria-label="Wayzo home">
          <Logo size={38} textClassName="text-white" />
        </Link>
        <div className="relative max-w-md">
          <h2 className="font-display text-[clamp(40px,4vw,60px)] leading-[1.02] font-extrabold">
            Upload your tickets. <span className="text-lime">We&apos;ll run the trip.</span>
          </h2>
          <p className="mt-5 text-lg leading-[1.6] text-white/75">
            Stays, food, a day-by-day plan, a shared budget and a brief for your group every morning.
          </p>
        </div>
        <div className="relative flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/[.06] p-4 text-sm text-white/80">
          <span className="animate-pulse-lime bg-lime inline-flex size-2 rounded-full" />
          Free during early access. No passwords, ever.
        </div>
      </aside>
      <main className="flex flex-col bg-white">
        <div className="flex h-[76px] items-center px-6 lg:hidden">
          <Link href="/" aria-label="Wayzo home">
            <Logo size={34} />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>
      </main>
    </div>
  );
}
