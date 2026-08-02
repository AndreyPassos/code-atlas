import { Text } from 'react-native';

export function EnrichedMarkdownText({ markdown }: { markdown: string }) {
  return <Text testID="enriched-markdown-text">{markdown}</Text>;
}

export type MarkdownStyle = Record<string, unknown>;
