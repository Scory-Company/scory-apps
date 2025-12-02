import { Spacing } from '@/constants/theme';
import { ContentBlock } from '@/services';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BlockRenderer } from './blocks';

interface ArticleContentProps {
  blocks: ContentBlock[];
}

export const ArticleContent: React.FC<ArticleContentProps> = ({ blocks }) => {
  return (
    <View style={styles.articleContent}>
      {blocks.map((block, index) => (
        <BlockRenderer key={index} block={block} index={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  articleContent: {
    marginBottom: Spacing.lg,
  },
});
