import "./landing.css";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  // leading-[normal]: the design relies on the browser default line-height, not Tailwind's 1.5.
  return (
    <div className="text-ink w-full overflow-x-clip bg-white font-sans leading-[normal]">{children}</div>
  );
}
