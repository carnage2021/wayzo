import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default function NotFound() {
  return (
    <main className="grid-bg flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center text-white">
      <Logo size={40} textClassName="text-white" />
      <div className="font-display text-lime text-[clamp(96px,18vw,200px)] leading-[.85] font-extrabold">
        404
      </div>
      <h1 className="font-display text-[clamp(28px,3.4vw,40px)] leading-tight font-extrabold">
        This route doesn&apos;t exist.
      </h1>
      <p className="max-w-md text-white/70">
        The page moved, the link is wrong, or it&apos;s a trip you&apos;re not a member of.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/trips" className={buttonVariants({ variant: "lime" })}>
          My trips
        </Link>
        <Link href="/" className={buttonVariants({ variant: "ghost" })}>
          Home
        </Link>
      </div>
    </main>
  );
}
