import Link from "next/link";
import { LogoMark } from "@/components/ui/logo";

const LINKS = [
  { href: "/#how", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/#faq", label: "FAQ" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function SiteFooter() {
  return (
    <footer className="bg-mist overflow-hidden pt-[72px] pb-10">
      <div className="wrap">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <Link href="/#top" className="text-ink flex items-center gap-2.5">
            <LogoMark size={34} tone="ink" />
            <span className="font-display text-[22px] font-extrabold">wayzo</span>
          </Link>
          <nav aria-label="Footer" className="flex flex-wrap gap-7 text-[15px] font-medium">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-ink hover:text-blue transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div
          data-rv
          aria-hidden="true"
          className="font-display text-ink mt-14 text-[clamp(96px,22vw,320px)] leading-[.8] font-extrabold !tracking-[-0.05em]"
        >
          wayzo
        </div>
        <div className="text-muted mt-8 flex flex-wrap justify-between gap-4 text-sm">
          <span>© {new Date().getFullYear()} Wayzo. Travel easy.</span>
          <span>Made for people who&apos;d rather be travelling.</span>
        </div>
      </div>
    </footer>
  );
}
