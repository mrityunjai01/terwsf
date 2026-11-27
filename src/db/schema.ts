import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const articles = pgTable(
  "articles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    dek: text("dek").notNull(),
    body: text("body").notNull(),
    section: text("section").notNull(),
    category: text("category").notNull(),
    articleType: text("article_type").notNull(),
    writtenByAuthorSlug: text("written_by_author_slug").notNull(),
    reviewedByAuthorSlug: text("reviewed_by_author_slug").notNull(),
    sourceName: text("source_name").notNull(),
    sourceUrl: text("source_url").notNull(),
    heroImageUrl: text("hero_image_url").notNull(),
    heroImageAlt: text("hero_image_alt").notNull(),
    published: boolean("published").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
  },
  (table) => [
    index("articles_published_idx").on(table.published, table.publishedAt),
    index("articles_section_idx").on(table.section),
  ],
);

export const articleRevisions = pgTable("article_revisions", {
  id: uuid("id").defaultRandom().primaryKey(),
  articleId: uuid("article_id").notNull(),
  body: text("body").notNull(),
  revisionNumber: integer("revision_number").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
