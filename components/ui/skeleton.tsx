import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-[skeleton_1.4s_ease-in-out_infinite] rounded-2xl bg-[linear-gradient(90deg,#EEF1F6_0%,#F6F8FB_50%,#EEF1F6_100%)] bg-[length:200%_100%]",
        className,
      )}
      {...props}
    />
  );
}
