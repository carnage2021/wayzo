export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div className="max-w-2xl">
        {eyebrow && <div className="eyebrow text-blue">{eyebrow}</div>}
        <h1 className="font-display mt-2 text-[clamp(28px,3.4vw,36px)] leading-[1.05] font-extrabold">
          {title}
        </h1>
        {description && <p className="text-muted mt-2 text-[15px] leading-relaxed">{description}</p>}
      </div>
      {action}
    </div>
  );
}
