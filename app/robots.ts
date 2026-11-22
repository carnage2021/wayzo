import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/privacy", "/terms", "/s/"],
        disallow: ["/trips", "/account", "/onboarding", "/admin", "/api/", "/auth/", "/login"],
      },
    ],
    sitemap: `${publicEnv.appUrl}/sitemap.xml`,
  };
}
