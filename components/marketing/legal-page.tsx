import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { SiteFooter } from "./site-footer";

/** Shared shell for Privacy / Terms: dark grid header, readable prose body. */
export function LegalPage({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="grid-bg text-white">
        <div className="wrap flex h-[76px] items-center">
          <Link href="/" className="text-white" aria-label="Wayzo home">
            <Logo size={38} textClassName="text-white" />
          </Link>
        </div>
        <div className="wrap pt-16 pb-20">
          <div className="eyebrow text-lime">{eyebrow}</div>
          <h1 className="font-display mt-4 text-[clamp(40px,5vw,64px)] leading-[1.02] font-extrabold">
            {title}
          </h1>
          <p className="mt-4 text-white/70">Last updated {updated}</p>
          <p className="bg-lime text-ink mt-6 inline-flex rounded-full px-3.5 py-1.5 text-[13px] font-bold">
            [LEGAL REVIEW] Placeholder text. Not legal advice.
          </p>
        </div>
      </header>
      <main className="wrap py-20">
        <article className="text-muted [&_h2]:font-display [&_h2]:text-ink [&_strong]:text-ink mx-auto flex max-w-[720px] flex-col gap-6 text-[17px] leading-[1.7] [&_h2]:mt-6 [&_h2]:text-[28px] [&_h2]:leading-tight [&_h2]:font-extrabold [&_li]:ml-5 [&_li]:list-disc">
          {children}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
