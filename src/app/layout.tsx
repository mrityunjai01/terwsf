import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/src/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.description,
  robots: { index: true, follow: true, maxImagePreview: "large" },
  openGraph: { type: "website", siteName: site.name, title: site.name, description: site.description },
  twitter: { card: "summary_large_image", title: site.name, description: site.description },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><div className="site-shell">
    <header className="masthead"><div className="container masthead-inner">
      <Link href="/" className="brand"><span className="brand-mark">M</span>arket Brief</Link>
      <nav className="nav" aria-label="Primary navigation"><Link href="/markets">Markets</Link><Link href="/technology">Technology</Link><Link href="/admin">Admin</Link></nav>
    </div></header>
    {children}
    <footer className="footer"><div className="container">Independent reporting on markets, companies, and technology.</div></footer>
  </div></body></html>;
}
