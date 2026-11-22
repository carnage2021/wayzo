import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#groups", label: "For groups" },
  { href: "#faq", label: "FAQ" },
];

/** Fixed nav; turns frosted ink once html[data-scrolled="1"]. */
export function SiteNav() {
  return (
    <>
      <div className="progress" aria-hidden="true" />
      <header className="nav fixed inset-x-0 top-0 z-50">
        <div className="wrap">
          <nav aria-label="Main" className="flex h-[76px] items-center justify-between gap-6">
            <a href="#top" className="flex items-center gap-2.5 text-white hover:text-white">
              <LogoMark size={38} />
              <span className="font-display text-[26px] font-extrabold text-white">wayzo</span>
            </a>
            <div className="hidden gap-[34px] lg:flex">
              {LINKS.map((l) => (
                <a key={l.href} className="navlink" href={l.href}>
                  {l.label}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-5">
              <Link href="/login" className="navlink hidden sm:inline">
                Sign in
              </Link>
              <a className={buttonVariants({ variant: "lime", size: "compact" })} href="#waitlist">
                Get early access
              </a>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
