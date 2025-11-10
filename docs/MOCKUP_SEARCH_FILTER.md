# Search & Filter Implementation Mockup

## Architecture Overview

```tsx
// explore.tsx - Main Component Structure

export default function ExploreScreen() {
  // ============ STATE MANAGEMENT ============
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // ============ COMPUTED VALUES ============
  const hasActiveFilters = searchQuery.trim() !== '' || selectedCategory !== 'All';
  const isSearching = searchQuery.trim() !== '';

  // Filter all content based on search + category
  const filteredResults = useMemo(() => {
    if (!hasActiveFilters) return null;

    return filterAllContent({
      searchQuery,
      selectedCategory,
      allData: [...forYouData, ...recentlyAddedData, ...topRatedData]
    });
  }, [searchQuery, selectedCategory]);

  // ============ HANDLERS ============
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (text.trim() !== '') {
      setIsSearchFocused(true);
    }
  };

  // ============ RENDER LOGIC ============
  return (
    <SafeAreaView>
      {/* Fixed Header */}
      <View style={styles.header}>
        <Text>Explore</Text>
      </View>

      {/* Search Bar - Always visible */}
      <View style={styles.searchBarContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearchChange}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          showClearButton={searchQuery !== ''}
          onClear={() => setSearchQuery('')}
        />
      </View>

      <ScrollView>
        {/* Category Filter - Always visible */}
        <CategoryFilterChips
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* CONDITIONAL RENDERING */}
        {hasActiveFilters ? (
          // ========== FILTERED VIEW ==========
          <FilteredContentView
            results={filteredResults}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            onClearFilters={handleClearFilters}
          />
        ) : (
          // ========== DEFAULT VIEW ==========
          <>
            {/* Trending Topics */}
            <TrendingSection data={trendingTopics} />

            {/* For You Section */}
            <ForYouSection data={forYouData} />

            {/* Top Rated */}
            <TopRatedSection data={topRatedData} />

            {/* Recently Added */}
            <RecentlyAddedSection data={recentlyAddedData} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
```

---

## Component 1: FilteredContentView

```tsx
// features/explore/components/FilteredContentView.tsx

interface FilteredContentViewProps {
  results: Article[];
  searchQuery: string;
  selectedCategory: string;
  onClearFilters: () => void;
}

export const FilteredContentView: React.FC<FilteredContentViewProps> = ({
  results,
  searchQuery,
  selectedCategory,
  onClearFilters,
}) => {
  const colors = Colors.light;

  // No results case
  if (results.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="search-outline"
          title="No Results Found"
          message={`No articles found for "${searchQuery}" in ${selectedCategory}`}
          actionLabel="Clear Filters"
          onActionPress={onClearFilters}
        />
      </View>
    );
  }

  // Has results
  return (
    <View style={styles.container}>
      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultCount}>
          {results.length} article{results.length > 1 ? 's' : ''} found
        </Text>

        {/* Active Filters */}
        <View style={styles.activeFilters}>
          {searchQuery && (
            <Chip
              label={`Search: "${searchQuery}"`}
              onRemove={() => onClearFilters()}
            />
          )}
          {selectedCategory !== 'All' && (
            <Chip
              label={selectedCategory}
              onRemove={() => onClearFilters()}
            />
          )}
        </View>

        {/* Clear All Button */}
        <TouchableOpacity onPress={onClearFilters} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear All Filters</Text>
        </TouchableOpacity>
      </View>

      {/* Results Grid */}
      <View style={styles.resultsGrid}>
        {results.map((article) => (
          <SearchResultCard
            key={article.id}
            {...article}
            highlightText={searchQuery}
          />
        ))}
      </View>
    </View>
  );
};
```

---

## Component 2: SearchResultCard

```tsx
// features/explore/components/SearchResultCard.tsx

interface SearchResultCardProps {
  image: any;
  title: string;
  author: string;
  category: string;
  rating: number;
  reads: string;
  highlightText?: string;
  onPress?: () => void;
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({
  image,
  title,
  author,
  category,
  rating,
  reads,
  highlightText,
  onPress,
}) => {
  const colors = Colors.light;

  // Highlight matching text
  const renderHighlightedTitle = () => {
    if (!highlightText) return title;

    const parts = title.split(new RegExp(`(${highlightText})`, 'gi'));
    return (
      <Text style={styles.title}>
        {parts.map((part, i) =>
          part.toLowerCase() === highlightText.toLowerCase() ? (
            <Text key={i} style={styles.highlight}>{part}</Text>
          ) : (
            <Text key={i}>{part}</Text>
          )
        )}
      </Text>
    );
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={image} style={styles.image} />
      <View style={styles.content}>
        {renderHighlightedTitle()}
        <Text style={styles.author}>{author}</Text>
        <View style={styles.meta}>
          <Badge text={category} color={colors.primary} />
          <Rating value={rating} />
          <Text style={styles.reads}>{reads} reads</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
```

---

## Component 3: Enhanced SearchBar

```tsx
// features/explore/components/SearchBar.tsx - Enhanced version

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  showClearButton?: boolean;
  onClear?: () => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onFocus,
  onBlur,
  showClearButton,
  onClear,
  placeholder = 'Search journals, topics, authors...',
}) => {
  const colors = Colors.light;
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[
      styles.container,
      isFocused && styles.containerFocused
    ]}>
      <Ionicons name="search" size={20} color={colors.textMuted} />

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        onFocus={() => {
          setIsFocused(true);
          onFocus?.();
        }}
        onBlur={() => {
          setIsFocused(false);
          onBlur?.();
        }}
      />

      {/* Clear Button */}
      {showClearButton && value !== '' && (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <Ionicons name="close-circle" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      )}

      {/* Search Count Badge (when has results) */}
      {value && (
        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <Text style={styles.badgeText}>24</Text>
        </View>
      )}
    </View>
  );
};
```

---

## Component 4: ActiveFilterChip

```tsx
// features/explore/components/FilterChip.tsx

interface ChipProps {
  label: string;
  onRemove: () => void;
}

export const Chip: React.FC<ChipProps> = ({ label, onRemove }) => {
  const colors = Colors.light;

  return (
    <View style={[styles.chip, { backgroundColor: colors.surfaceSecondary }]}>
      <Text style={styles.chipText}>{label}</Text>
      <TouchableOpacity onPress={onRemove}>
        <Ionicons name="close" size={16} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
};
```

---

## Helper Functions

```tsx
// utils/filterContent.ts

interface FilterOptions {
  searchQuery: string;
  selectedCategory: string;
  allData: Article[];
}

export const filterAllContent = ({
  searchQuery,
  selectedCategory,
  allData,
}: FilterOptions): Article[] => {
  let filtered = [...allData];

  // Filter by category
  if (selectedCategory !== 'All') {
    filtered = filtered.filter(
      (item) => item.category === selectedCategory
    );
  }

  // Filter by search query
  if (searchQuery.trim() !== '') {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.author.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );
  }

  return filtered;
};
```

---

## UI States Summary

### State 1: Default (No filters)
```
✓ All content sections visible
✓ Search bar placeholder
✓ "All" category selected
```

### State 2: Search Only
```
✓ Results view replaces sections
✓ "X articles found" header
✓ Search term highlighted in results
✓ Clear button visible
```

### State 3: Category Filter Only
```
✓ Results filtered by category
✓ Active category chip highlighted
✓ Other sections hidden
```

### State 4: Search + Category
```
✓ Combined filter active
✓ Both filters shown as chips
✓ Refined results
✓ "Clear All Filters" button
```

### State 5: No Results
```
✓ Empty state
✓ Suggestions
✓ "Clear Filters" action
```

---

## Visual Enhancements

1. **Smooth Transitions**
   - Fade in/out between views
   - Slide results from bottom

2. **Loading States**
   - Skeleton screens during search
   - Debounce search input (300ms)

3. **Micro-interactions**
   - Active filter pulse animation
   - Results count badge
   - Highlight matched text

4. **Accessibility**
   - Clear button labels
   - Result count announcements
   - Filter state descriptions

---

## Performance Optimizations

```tsx
// Debounced search
const debouncedSearch = useDebouncedValue(searchQuery, 300);

// Memoized filter results
const filteredResults = useMemo(() => {
  return filterAllContent(debouncedSearch, selectedCategory, allData);
}, [debouncedSearch, selectedCategory, allData]);

// Virtual list for many results
<FlatList
  data={filteredResults}
  renderItem={({ item }) => <SearchResultCard {...item} />}
  keyExtractor={(item) => item.id.toString()}
  initialNumToRender={10}
  maxToRenderPerBatch={5}
/>
```

---

## Next Steps

1. ✅ Review mockup
2. ⏳ Implement FilteredContentView component
3. ⏳ Enhance SearchBar with clear button
4. ⏳ Create SearchResultCard
5. ⏳ Add empty states
6. ⏳ Implement filter logic
7. ⏳ Add animations & transitions

---

**Note:** This is a mockup/blueprint. Ready to implement when approved! 🚀
