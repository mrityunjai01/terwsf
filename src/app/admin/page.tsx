import Link from "next/link";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };

export default function AdminPage() {
  return (
    <main className="page">
      <div className="container">
        <div className="admin-header">
          <div>
            <div className="eyebrow">Editorial workspace</div>
            <h1>Admin</h1>
          </div>
          <Link href="/" className="meta">
            ← View site
          </Link>
        </div>
        <p className="dek">
          The editorial queue will appear here once authentication and the
          PostgreSQL-backed article repository are connected.
        </p>
        <section className="admin-empty" aria-live="polite">
          <h2>No articles loaded</h2>
          <p>
            This dashboard is intentionally empty. Connect the admin data
            access layer to Drizzle before displaying drafts or published
            stories.
          </p>
        </section>
      </div>
    </main>
  );
}
