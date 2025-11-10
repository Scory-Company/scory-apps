import { ImageSourcePropType } from 'react-native';

export interface Article {
  id: number;
  image: ImageSourcePropType;
  title: string;
  author: string;
  category: string;
  rating: number;
  reads?: string;
  date?: string;
}

interface FilterOptions {
  searchQuery: string;
  selectedCategory: string;
  allData: Article[];
}

/**
 * Filter content based on search query and selected category
 */
export const filterContent = ({
  searchQuery,
  selectedCategory,
  allData,
}: FilterOptions): Article[] => {
  let filtered = [...allData];

  // Filter by category first
  if (selectedCategory !== 'All') {
    filtered = filtered.filter(
      (item) => item.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }

  // Then filter by search query
  if (searchQuery.trim() !== '') {
    const query = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.author.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );
  }

  return filtered;
};
