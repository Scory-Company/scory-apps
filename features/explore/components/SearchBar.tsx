import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearch: () => void; // Trigger search on button click or Enter
  placeholder?: string;
  isSearchingScholar?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onSearch,
  placeholder = 'Search journals, topics, authors...',
  isSearchingScholar = false,
}) => {
  const colors = Colors.light;

  const handleSubmit = () => {
    if (value.trim()) {
      onSearch();
    }
  };

  return (
    <View style={[styles.searchContainer, { backgroundColor: colors.surface }, Shadows.sm]}>
      <Ionicons name="search" size={20} color={colors.textMuted} />
      <TextInput
        style={[styles.searchInput, { color: colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={handleSubmit}
        returnKeyType="search"
      />
      {/* Scholar Search Loading Indicator */}
      {isSearchingScholar && (
        <View style={styles.scholarIndicator}>
          <ActivityIndicator size="small" color="#6366F1" />
        </View>
      )}
      {/* Clear Button */}
      {value.length > 0 && !isSearchingScholar && (
        <TouchableOpacity onPress={() => onChangeText('')}>
          <Ionicons name="close-circle" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      )}
      {/* Search Button */}
      {value.trim().length > 0 && !isSearchingScholar && (
        <TouchableOpacity onPress={handleSubmit} style={styles.searchButton}>
          <Ionicons name="arrow-forward-circle" size={24} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    paddingVertical: 0,
  },
  scholarIndicator: {
    paddingRight: Spacing.xs,
  },
  searchButton: {
    marginLeft: Spacing.xs,
  },
});
