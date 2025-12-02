import { ContentBlock } from '@/services';
import React from 'react';
import { CalloutBlock } from './CalloutBlock';
import { DividerBlock } from './DividerBlock';
import { HeadingBlock } from './HeadingBlock';
import { ImageBlock } from './ImageBlock';
import { InfographicBlock } from './InfographicBlock';
import { ListBlock } from './ListBlock';
import { QuoteBlock } from './QuoteBlock';
import { TextBlock } from './TextBlock';

interface BlockRendererProps {
  block: ContentBlock;
  index: number;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({ block, index }) => {
  switch (block.type) {
    case 'text':
      return <TextBlock text={block.data.text} />;

    case 'heading':
      return <HeadingBlock text={block.data.text} level={block.data.level} />;

    case 'quote':
      return <QuoteBlock text={block.data.text} author={block.data.author} />;

    case 'list':
      return <ListBlock style={block.data.style} items={block.data.items} />;

    case 'image':
      return <ImageBlock url={block.data.url} caption={block.data.caption} alt={block.data.alt} />;

    case 'infographic':
      return <InfographicBlock url={block.data.url} caption={block.data.caption} alt={block.data.alt} />;

    case 'callout':
      return <CalloutBlock text={block.data.text} variant={block.data.variant} />;

    case 'divider':
      return <DividerBlock />;

    default:
      // This should never happen due to TypeScript discriminated union
      return null;
  }
};
