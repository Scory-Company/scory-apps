/**
 * Mock Google Scholar Search Results
 *
 * This mock data simulates responses from Google Scholar API
 * Used for testing auto-fallback search functionality before real API integration
 */

export interface ScholarArticle {
  id: string;
  title: string;
  authors: string[];
  year: number;
  journal?: string;
  citations: number;
  abstract: string;
  url: string;
  doi?: string;
  pdfUrl?: string;
  source: 'scholar'; // Indicates this is from external source
}

/**
 * Mock Scholar Results - Comprehensive database
 */
export const mockScholarResults: ScholarArticle[] = [
  // Quantum Computing
  {
    id: 'scholar_1',
    title: 'Quantum Computing Applications in Cryptography: Current State and Future Prospects',
    authors: ['Anderson, James', 'Kumar, Rajesh', 'Schmidt, Anna'],
    year: 2024,
    journal: 'Nature Quantum Information',
    citations: 428,
    abstract: 'We present a thorough analysis of quantum computing\'s impact on modern cryptography. This paper examines post-quantum cryptographic algorithms, quantum key distribution, and their implementation challenges in real-world systems. Our findings suggest that quantum-resistant encryption will be essential by 2030.',
    url: 'https://scholar.google.com/scholar?q=quantum+computing+cryptography',
    doi: '10.1038/s41534-024-00789-x',
    pdfUrl: 'https://www.nature.com/articles/s41534-024-00789-x.pdf',
    source: 'scholar',
  },
  {
    id: 'scholar_2',
    title: 'Quantum Algorithms for Optimization Problems: A Survey',
    authors: ['Chen, Li', 'Wang, Yifei', 'Müller, Stefan'],
    year: 2023,
    journal: 'ACM Computing Surveys',
    citations: 312,
    abstract: 'This survey reviews quantum computing algorithms designed for solving complex optimization problems. We cover quantum annealing, variational quantum eigensolver (VQE), and quantum approximate optimization algorithm (QAOA). Applications in logistics, finance, and drug discovery are discussed.',
    url: 'https://scholar.google.com/scholar?q=quantum+algorithms+optimization',
    doi: '10.1145/3579321',
    pdfUrl: 'https://dl.acm.org/doi/pdf/10.1145/3579321',
    source: 'scholar',
  },
  // Machine Learning
  {
    id: 'scholar_3',
    title: 'Deep Learning for Medical Image Analysis: A Comprehensive Review',
    authors: ['Zhang, Wei', 'Liu, Xiaoming', 'Chen, Li'],
    year: 2023,
    journal: 'IEEE Transactions on Medical Imaging',
    citations: 342,
    abstract: 'This comprehensive review explores the application of deep learning techniques in medical image analysis. We discuss convolutional neural networks, transfer learning, and recent advances in interpretable AI for healthcare applications.',
    url: 'https://scholar.google.com/scholar?q=deep+learning+medical+image',
    doi: '10.1109/TMI.2023.1234567',
    pdfUrl: 'https://arxiv.org/pdf/2301.12345.pdf',
    source: 'scholar',
  },
  // Climate Change
  {
    id: 'scholar_4',
    title: 'Climate Change Impacts on Marine Ecosystems: A Meta-Analysis',
    authors: ['Thompson, Sarah', 'O\'Brien, Michael', 'Yamamoto, Kenji'],
    year: 2023,
    journal: 'Science',
    citations: 567,
    abstract: 'Through meta-analysis of 250+ studies, we quantify the effects of ocean warming and acidification on marine biodiversity. Our findings reveal significant shifts in species distribution and ecosystem functioning.',
    url: 'https://scholar.google.com/scholar?q=climate+change+marine+ecosystems',
    doi: '10.1126/science.abc1234',
    pdfUrl: 'https://www.science.org/doi/pdf/10.1126/science.abc1234',
    source: 'scholar',
  },
  // Neural Networks
  {
    id: 'scholar_5',
    title: 'Neural Architecture Search: Automated Deep Learning Model Design',
    authors: ['Park, Minho', 'Chen, Yifan'],
    year: 2024,
    journal: 'Journal of Machine Learning Research',
    citations: 89,
    abstract: 'Neural Architecture Search (NAS) automates the design of deep learning models. We propose a novel search algorithm that reduces computational costs by 70% while maintaining state-of-the-art performance.',
    url: 'https://scholar.google.com/scholar?q=neural+architecture+search',
    doi: '10.5555/jmlr.2024.123',
    pdfUrl: 'https://jmlr.org/papers/v25/24-0123.pdf',
    source: 'scholar',
  },
  // Urban Planning
  {
    id: 'scholar_6',
    title: 'Sustainable Urban Planning in the 21st Century: Integrating Technology and Ecology',
    authors: ['García, María', 'Johnson, David', 'Nguyen, Linh'],
    year: 2023,
    journal: 'Urban Studies',
    citations: 234,
    abstract: 'This paper explores how smart city technologies can be integrated with ecological principles to create sustainable urban environments. We present case studies from Singapore, Copenhagen, and Barcelona.',
    url: 'https://scholar.google.com/scholar?q=sustainable+urban+planning',
    source: 'scholar',
  },
  // Blockchain
  {
    id: 'scholar_7',
    title: 'Blockchain Technology for Supply Chain Transparency: A Systematic Review',
    authors: ['Kim, Soo-Jin', 'Patel, Raj', 'Wilson, Emma'],
    year: 2024,
    journal: 'IEEE Access',
    citations: 156,
    abstract: 'We systematically review blockchain applications in supply chain management. Our analysis covers 120 implementations across manufacturing, logistics, and retail sectors. We identify key success factors and implementation challenges.',
    url: 'https://scholar.google.com/scholar?q=blockchain+supply+chain',
    doi: '10.1109/ACCESS.2024.5678',
    pdfUrl: 'https://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=5678',
    source: 'scholar',
  },
  // Artificial Intelligence
  {
    id: 'scholar_8',
    title: 'Artificial Intelligence in Healthcare: Opportunities and Ethical Challenges',
    authors: ['Martinez, Carlos', 'Singh, Priya', 'Brown, Alice'],
    year: 2023,
    journal: 'The Lancet Digital Health',
    citations: 445,
    abstract: 'This review examines AI applications in clinical diagnosis, drug discovery, and personalized medicine. We discuss ethical considerations including data privacy, algorithmic bias, and the need for regulatory frameworks.',
    url: 'https://scholar.google.com/scholar?q=artificial+intelligence+healthcare',
    doi: '10.1016/S2589-7500(23)00123-4',
    pdfUrl: 'https://www.thelancet.com/pdfs/journals/landig/PIIS2589750023001234.pdf',
    source: 'scholar',
  },
];

/**
 * Simulates Google Scholar API search
 * @param query - Search query string
 * @returns Promise with filtered scholar results
 */
export const searchScholarMock = async (query: string): Promise<ScholarArticle[]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Smart keyword matching (case-insensitive, multi-word support)
  const lowerQuery = query.toLowerCase().trim();

  // Split query into individual keywords
  const keywords = lowerQuery.split(/\s+/);

  const filtered = mockScholarResults.filter((article) => {
    const searchableText = [
      article.title,
      article.abstract,
      ...article.authors,
      article.journal || '',
    ].join(' ').toLowerCase();

    // Match if ANY keyword is found
    return keywords.some(keyword => searchableText.includes(keyword));
  });

  // Sort by relevance (number of keyword matches)
  const scored = filtered.map(article => {
    const searchableText = [
      article.title,
      article.abstract,
      ...article.authors,
      article.journal || '',
    ].join(' ').toLowerCase();

    // Count keyword matches
    const score = keywords.reduce((count, keyword) => {
      const matches = searchableText.split(keyword).length - 1;
      return count + matches;
    }, 0);

    return { article, score };
  });

  // Sort by score (descending) and return articles
  scored.sort((a, b) => b.score - a.score);
  return scored.map(item => item.article);
};

/**
 * Converts citation count to star rating (out of 5)
 * Formula: Logarithmic scale to handle wide citation ranges
 */
export const citationsToRating = (citations: number): number => {
  if (citations === 0) return 3.0;
  if (citations < 10) return 3.5;
  if (citations < 50) return 4.0;
  if (citations < 200) return 4.5;
  return 5.0;
};
