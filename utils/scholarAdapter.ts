import { ScholarArticle } from '@/services/scholar';

/**
 * Transform Google Scholar article to Scory article format
 */
export const transformScholarToScory = (scholarArticle: ScholarArticle) => {
  // Extract citation count (use as popularity indicator)
  const citedBy = scholarArticle.inline_links?.cited_by?.total || 0;

  // Extract year from publication info
  const yearMatch = scholarArticle.publication_info?.summary?.match(/\d{4}/);
  const year = yearMatch ? yearMatch[0] : 'N/A';

  // Extract first author
  const firstAuthor =
    scholarArticle.publication_info?.authors?.[0]?.name || 'Unknown Author';

  // Get all authors
  const allAuthors = scholarArticle.publication_info?.authors
    ?.map((a) => a.name)
    .join(', ');

  // Convert citations to rating (0-5 scale)
  // Using logarithmic scale: log10(citations + 1) normalized to 0-5
  const rating = Math.min(5, Math.log10(citedBy + 1) * 1.2);

  // Find PDF link
  const pdfResource = scholarArticle.resources?.find(
    (r) => r.file_format === 'PDF' || r.title.toLowerCase().includes('pdf')
  );

  // Get number of versions
  const versions = scholarArticle.inline_links?.versions?.total || 0;

  return {
    // IDs
    id: `scholar-${scholarArticle.result_id}`,
    slug: scholarArticle.result_id,

    // Content
    title: scholarArticle.title,
    excerpt: scholarArticle.snippet || 'No abstract available',

    // Authors
    author: firstAuthor,
    allAuthors: allAuthors || firstAuthor,

    // Category
    category: 'Academic',

    // Metrics
    rating: parseFloat(rating.toFixed(1)),
    reads: citedBy > 0 ? `${citedBy.toLocaleString()} citations` : 'No citations yet',
    citedBy: citedBy,
    versions: versions,

    // Image
    imageUrl: 'https://scholar.google.com/favicon.ico',

    // Links
    link: scholarArticle.link,
    pdfUrl: pdfResource?.link,

    // Metadata
    publishedAt: year !== 'N/A' ? `${year}-01-01` : new Date().toISOString(),
    publicationInfo: scholarArticle.publication_info?.summary || '',

    // Flags
    isAcademic: true,
    source: 'Google Scholar',

    // Scholar-specific data (for detail view)
    scholarData: {
      result_id: scholarArticle.result_id,
      cited_by_link: scholarArticle.inline_links?.cited_by?.link,
      cited_by_id: scholarArticle.inline_links?.cited_by?.cites_id,
      versions_link: scholarArticle.inline_links?.versions?.link,
      related_articles_link: scholarArticle.inline_links?.related_articles_link,
      all_resources: scholarArticle.resources || [],
    },
  };
};

/**
 * Extract year from publication info string
 */
export const extractYear = (publicationInfo?: string): number | null => {
  if (!publicationInfo) return null;
  const match = publicationInfo.match(/\d{4}/);
  return match ? parseInt(match[0], 10) : null;
};

/**
 * Calculate popularity score from citations
 * Uses logarithmic scale to normalize very high citation counts
 */
export const calculatePopularityScore = (citations: number): number => {
  if (citations === 0) return 0;
  // log10 scale: 1 citation = ~0, 10 = ~20, 100 = ~40, 1000 = ~60, 10000 = ~80, 100000 = ~100
  return Math.min(100, Math.log10(citations) * 20);
};

/**
 * Format citation count for display
 */
export const formatCitations = (count: number): string => {
  if (count === 0) return 'No citations';
  if (count === 1) return '1 citation';
  if (count < 1000) return `${count} citations`;
  if (count < 1000000) return `${(count / 1000).toFixed(1)}k citations`;
  return `${(count / 1000000).toFixed(1)}M citations`;
};
