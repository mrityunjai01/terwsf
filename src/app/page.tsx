import Link from "next/link";
import { getPublishedArticles } from "@/src/lib/articles";

export const revalidate = 300;

export default function HomePage() {
  const articles = getPublishedArticles();
  const [lead, ...rest] = articles;
  return <main className="page"><div className="container">
    <section className="lead"><div className="lead-copy"><div className="eyebrow">Finance news</div><h1>Finance news, without the noise.</h1><p className="dek">Carefully sourced coverage of the forces moving markets, companies, and technology.</p></div><div><p className="meta">No stories published yet</p><p>Published coverage will appear here when the PostgreSQL content repository is connected.</p></div></section>
    {lead && <section className="story-grid"><Link className="story-card" href={`/article/${lead.slug}`}><div className="eyebrow">{lead.category}</div><h2>{lead.title}</h2><p>{lead.dek}</p><div className="meta">{lead.writtenBy.name} · {lead.publishedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div></Link>{rest.map((article) => <Link className="story-card" href={`/article/${article.slug}`} key={article.id}><div className="eyebrow">{article.category}</div><h2>{article.title}</h2><p>{article.dek}</p><div className="meta">{article.writtenBy.name} · {article.publishedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div></Link>)}</section>}
  </div></main>;
}
