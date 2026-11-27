import type { MetadataRoute } from "next";
import { site } from "@/src/lib/site";

export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/", "/preview/", "/search"] }, sitemap: [`${site.url}/sitemap.xml`, `${site.url}/news-sitemap.xml`] }; }
