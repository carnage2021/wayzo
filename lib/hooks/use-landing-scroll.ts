"use client";

import { useEffect } from "react";

/**
 * Port of the design's inline script:
 * - scroll reveal: only elements below the fold get `.rv`, then `.in` when visible
 * - sticky story: sets html[data-step] from the step in view
 * - scroll-linked CSS vars: --sy (px scrolled), --sp (0..1 progress), html[data-scrolled]
 * Cleans up html attributes on unmount so app pages aren't affected.
 */
export function useLandingScroll() {
  useEffect(() => {
    const root = document.documentElement;
    const vh = window.innerHeight || 800;
    const observers: IntersectionObserver[] = [];

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
      );
      document.querySelectorAll<HTMLElement>("[data-rv]").forEach((el) => {
        if (el.getBoundingClientRect().top > vh * 0.9) {
          el.classList.add("rv");
          io.observe(el);
        }
      });
      observers.push(io);

      const so = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) root.setAttribute("data-step", e.target.getAttribute("data-st") ?? "1");
          });
        },
        { threshold: 0.55 },
      );
      document.querySelectorAll("[data-st]").forEach((el) => so.observe(el));
      observers.push(so);
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY || 0;
      const h = root.scrollHeight - window.innerHeight || 1;
      root.style.setProperty("--sy", String(y));
      root.style.setProperty("--sp", String(Math.min(1, y / h)));
      root.setAttribute("data-scrolled", y > 40 ? "1" : "0");
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();

    return () => {
      observers.forEach((o) => o.disconnect());
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
      root.removeAttribute("data-step");
      root.removeAttribute("data-scrolled");
      root.style.removeProperty("--sy");
      root.style.removeProperty("--sp");
    };
  }, []);
}
