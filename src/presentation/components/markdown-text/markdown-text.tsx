import { View } from 'react-native';
import { Text } from '../text';

export interface MarkdownTextProps {
  content: string;
  testID?: string;
}

function renderInline(text: string, keyPrefix: string) {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part, index) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <Text key={`${keyPrefix}-${index}`} className="font-bold">
          {part.slice(2, -2)}
        </Text>
      ) : (
        <Text key={`${keyPrefix}-${index}`}>{part}</Text>
      )
    );
}

/**
 * Minimal, dependency-free renderer for the subset of markdown found in
 * repository READMEs (headings, bold, bullet lists). Not a full CommonMark
 * implementation — good enough to stop raw `#`/`*` syntax leaking to users.
 */
export function MarkdownText({ content, testID = 'markdown-text' }: MarkdownTextProps) {
  const lines = content.split('\n');

  return (
    <View testID={testID} className="gap-xs">
      {lines.map((line, index) => {
        const key = `line-${index}`;

        if (line.startsWith('### ')) {
          return (
            <Text key={key} variant="label" className="mt-sm">
              {renderInline(line.slice(4), key)}
            </Text>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <Text key={key} variant="subheading" className="mt-md">
              {renderInline(line.slice(3), key)}
            </Text>
          );
        }
        if (line.startsWith('# ')) {
          return (
            <Text key={key} variant="heading" className="mt-md">
              {renderInline(line.slice(2), key)}
            </Text>
          );
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <Text key={key} variant="body">
              {'• '}
              {renderInline(line.slice(2), key)}
            </Text>
          );
        }
        if (line.trim() === '') {
          return <View key={key} className="h-xs" />;
        }
        return (
          <Text key={key} variant="body">
            {renderInline(line, key)}
          </Text>
        );
      })}
    </View>
  );
}
