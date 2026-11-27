export type AuthorRole = "writer" | "reviewer" | "both";

export type EditorialAuthor = {
  slug: string;
  name: string;
  role: AuthorRole;
  bio: string;
};

// Replace these approved editorial identities with the publication's verified staff details.
export const EDITORIAL_AUTHORS: readonly EditorialAuthor[] = [
  { slug: "anika-shah", name: "Anika Shah", role: "both", bio: "Finance and markets editor." },
  { slug: "daniel-ortiz", name: "Daniel Ortiz", role: "writer", bio: "Technology and enterprise reporter." },
  { slug: "leila-hassan", name: "Leila Hassan", role: "writer", bio: "Companies and earnings reporter." },
  { slug: "marcus-lee", name: "Marcus Lee", role: "reviewer", bio: "Senior markets editor and fact reviewer." },
  { slug: "sofia-patel", name: "Sofia Patel", role: "both", bio: "Data and macroeconomics editor." },
] as const;

export const AUTHOR_BY_SLUG = Object.fromEntries(
  EDITORIAL_AUTHORS.map((author) => [author.slug, author]),
) as Record<string, EditorialAuthor>;
