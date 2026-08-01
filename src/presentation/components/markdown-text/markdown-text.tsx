import { Linking } from 'react-native';
import { useColorScheme } from 'nativewind';
import { EnrichedMarkdownText, type MarkdownStyle } from 'react-native-enriched-markdown';
import { colors } from '../../../shared/design-tokens';

export interface MarkdownTextProps {
  content: string;
  testID?: string;
}

const ALLOWED_URL_SCHEMES = new Set(['https:', 'http:']);

// README content comes from an external, untrusted source (any repo owner's
// markdown) -- a link isn't guaranteed to be http(s). Reject other schemes
// (javascript:, custom app schemes, intent: on Android, ...) before opening.
async function openMarkdownLink(url: string): Promise<void> {
  let scheme: string;
  try {
    scheme = new URL(url).protocol;
  } catch {
    return;
  }

  if (!ALLOWED_URL_SCHEMES.has(scheme)) {
    return;
  }

  if (await Linking.canOpenURL(url)) {
    await Linking.openURL(url);
  }
}

interface ColorScheme {
  readonly background: string;
  readonly surface: string;
  readonly text: string;
  readonly textSecondary: string;
  readonly primary: string;
  readonly error: string;
  readonly border: string;
}

function buildMarkdownStyle(scheme: ColorScheme): MarkdownStyle {
  return {
    paragraph: { color: scheme.text, fontSize: 16, lineHeight: 22, marginBottom: 8 },
    h1: { color: scheme.text, fontSize: 28, fontWeight: '700', marginTop: 16, marginBottom: 8 },
    h2: { color: scheme.text, fontSize: 24, fontWeight: '700', marginTop: 14, marginBottom: 8 },
    h3: { color: scheme.text, fontSize: 20, fontWeight: '600', marginTop: 12, marginBottom: 6 },
    h4: { color: scheme.text, fontSize: 18, fontWeight: '600', marginTop: 10, marginBottom: 6 },
    h5: { color: scheme.text, fontSize: 16, fontWeight: '600', marginTop: 8, marginBottom: 4 },
    h6: {
      color: scheme.textSecondary,
      fontSize: 14,
      fontWeight: '600',
      marginTop: 8,
      marginBottom: 4,
    },
    blockquote: {
      color: scheme.textSecondary,
      borderColor: scheme.border,
      backgroundColor: scheme.surface,
    },
    list: { color: scheme.text, bulletColor: scheme.primary, markerColor: scheme.primary },
    codeBlock: { backgroundColor: scheme.surface, borderColor: scheme.border, color: scheme.text },
    code: { backgroundColor: scheme.surface, color: scheme.error },
    link: { color: scheme.primary, underline: true },
    strong: { color: scheme.text },
    em: { color: scheme.text },
    thematicBreak: { color: scheme.border },
    table: {
      color: scheme.text,
      borderColor: scheme.border,
      headerBackgroundColor: scheme.surface,
      headerTextColor: scheme.text,
      rowOddBackgroundColor: scheme.background,
      rowEvenBackgroundColor: scheme.surface,
    },
    taskList: { checkedColor: scheme.primary, checkmarkColor: scheme.background },
  };
}

/**
 * Renders repository READMEs (CommonMark + GFM — tables, task lists) using
 * react-native-enriched-markdown's native renderer, themed to match the rest
 * of the design system instead of the library's light-mode defaults.
 */
export function MarkdownText({ content, testID = 'markdown-text' }: MarkdownTextProps) {
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === 'dark' ? colors.dark : colors.light;

  return (
    <EnrichedMarkdownText
      testID={testID}
      markdown={content}
      flavor="github"
      selectable
      onLinkPress={({ url }) => openMarkdownLink(url)}
      markdownStyle={buildMarkdownStyle(scheme)}
    />
  );
}
