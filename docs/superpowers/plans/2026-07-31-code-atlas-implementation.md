# Code Atlas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React Native/Expo app for browsing GitHub/GitLab repositories with Clean Architecture, runtime provider switching, and a Design System Showcase.

**Architecture:** Clean Architecture + Hexagonal (Ports & Adapters). Domain is pure TypeScript. Infrastructure implements domain ports. Presentation consumes application hooks. ProviderFactory is the single swap point for GitHub/GitLab.

**Tech Stack:** Expo SDK 56, React Native 0.85, TypeScript 6, NativeWind, React Navigation 7, React Query 5, Zustand 4, Axios, Expo SecureStore, Jest, React Native Testing Library

## Global Constraints

- Expo SDK 56, React Native 0.85, TypeScript 6
- NativeWind exclusively — no StyleSheet
- Strict TypeScript — no `any`, use `unknown`
- Domain layer: zero external imports (pure TS)
- Commits: English only, Conventional Commits format, no AI signatures
- Path aliases: `@/*` → `./src/*`

---

## Phase 1: Foundation

### Task 1: Clean up leftover files

**Files:**
- Delete: `components/BackButton.tsx`, `components/EditScreenInfo.tsx`, `components/HeaderButton.tsx`, `components/ScreenContent.tsx`, `components/TabBarIcon.tsx`
- Delete: `screens/modal.tsx`, `screens/one.tsx`, `screens/two.tsx`
- Delete: `store/store.ts`, `store/` directory
- Delete: `navigation/index.tsx`, `navigation/tab-navigator.tsx`, `navigation/` directory

- [ ] **Step 1: Delete leftover component files**

```bash
rm components/BackButton.tsx components/EditScreenInfo.tsx components/HeaderButton.tsx components/ScreenContent.tsx components/TabBarIcon.tsx
```

- [ ] **Step 2: Delete leftover screen files**

```bash
rm screens/modal.tsx screens/one.tsx screens/two.tsx
```

- [ ] **Step 3: Delete leftover store and navigation**

```bash
rm -rf store/ navigation/
```

- [ ] **Step 4: Verify cleanup**

```bash
ls components/ screens/ store/ navigation/
```

Expected: directories should not exist or be empty

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove leftover template files from create-expo-stack"
```

---

### Task 2: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install React Query**

```bash
npx expo install @tanstack/react-query
```

- [ ] **Step 2: Install Axios**

```bash
npx expo install axios
```

- [ ] **Step 3: Install Expo SecureStore**

```bash
npx expo install expo-secure-store
```

- [ ] **Step 4: Install Expo AuthSession + Crypto**

```bash
npx expo install expo-auth-session expo-crypto
```

- [ ] **Step 5: Install testing dependencies**

```bash
npm install --save-dev @testing-library/react-native @testing-library/jest-native jest @types/jest
```

- [ ] **Step 6: Install Husky + Commitlint**

```bash
npm install --save-dev husky @commitlint/cli @commitlint/config-conventional lint-staged
```

- [ ] **Step 7: Verify package.json**

Run: `cat package.json | grep -E "tanstack|axios|expo-secure-store|expo-auth|husky|commitlint"`
Expected: all packages listed

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install project dependencies"
```

---

### Task 3: Create directory structure

**Files:**
- Create: entire `src/` directory tree

- [ ] **Step 1: Create domain directories**

```bash
mkdir -p src/domain/{entities,value-objects,ports,use-cases/{repositories,issues,auth},errors}
```

- [ ] **Step 2: Create application directories**

```bash
mkdir -p src/application/services
```

- [ ] **Step 3: Create infrastructure directories**

```bash
mkdir -p src/infrastructure/{providers/{github,gitlab},http/interceptors,storage,mappers,dtos/{github,gitlab},react-query/{queries,mutations},hooks}
```

- [ ] **Step 4: Create presentation directories**

```bash
mkdir -p src/presentation/{screens/{source-selector/components,repository-search/components,repository-details/components,issues/components,design-system},components/{button,input,text,card,avatar,badge,spinner,skeleton,empty-state,error-state,divider,surface},navigation,providers}
```

- [ ] **Step 5: Create shared directories**

```bash
mkdir -p src/shared/{design-tokens,theme,types}
```

- [ ] **Step 6: Verify structure**

```bash
find src -type d | sort
```

Expected: full directory tree as specified in design spec

- [ ] **Step 7: Commit**

```bash
git add src/
git commit -m "chore: create clean architecture directory structure"
```

---

## Phase 2: Design Tokens & Theme

### Task 4: Create design tokens

**Files:**
- Create: `src/shared/design-tokens/colors.ts`
- Create: `src/shared/design-tokens/spacing.ts`
- Create: `src/shared/design-tokens/typography.ts`
- Create: `src/shared/design-tokens/radius.ts`
- Create: `src/shared/design-tokens/sizes.ts`
- Create: `src/shared/design-tokens/index.ts`

- [ ] **Step 1: Create colors token**

```typescript
// src/shared/design-tokens/colors.ts
export const colors = {
  light: {
    background: '#FFFFFF',
    surface: '#F5F5F5',
    surfaceHover: '#EBEBEB',
    text: '#1A1A1A',
    textSecondary: '#666666',
    textTertiary: '#999999',
    primary: '#007AFF',
    primaryHover: '#0066DD',
    error: '#FF3B30',
    errorHover: '#DD2F28',
    success: '#34C759',
    warning: '#FF9500',
    border: '#E5E5E5',
    borderHover: '#CCCCCC',
    skeleton: '#E5E5E5',
    skeletonHighlight: '#F5F5F5',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  dark: {
    background: '#000000',
    surface: '#1C1C1E',
    surfaceHover: '#2C2C2E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    textTertiary: '#636366',
    primary: '#0A84FF',
    primaryHover: '#409CFF',
    error: '#FF453A',
    errorHover: '#FF6961',
    success: '#30D158',
    warning: '#FF9F0A',
    border: '#38383A',
    borderHover: '#48484A',
    skeleton: '#38383A',
    skeletonHighlight: '#48484A',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
} as const;

export type ColorToken = typeof colors.light;
```

- [ ] **Step 2: Create spacing token**

```typescript
// src/shared/design-tokens/spacing.ts
export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export type SpacingToken = typeof spacing;
```

- [ ] **Step 3: Create typography token**

```typescript
// src/shared/design-tokens/typography.ts
export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export type TypographyToken = typeof typography;
```

- [ ] **Step 4: Create radius token**

```typescript
// src/shared/design-tokens/radius.ts
export const radius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export type RadiusToken = typeof radius;
```

- [ ] **Step 5: Create sizes token**

```typescript
// src/shared/design-tokens/sizes.ts
export const sizes = {
  icon: {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
  },
  avatar: {
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  },
  button: {
    sm: 32,
    md: 44,
    lg: 56,
  },
  input: {
    sm: 32,
    md: 44,
    lg: 56,
  },
} as const;

export type SizeToken = typeof sizes;
```

- [ ] **Step 6: Create barrel export**

```typescript
// src/shared/design-tokens/index.ts
export { colors, type ColorToken } from './colors';
export { spacing, type SpacingToken } from './spacing';
export { typography, type TypographyToken } from './typography';
export { radius, type RadiusToken } from './radius';
export { sizes, type SizeToken } from './sizes';
```

- [ ] **Step 7: Commit**

```bash
git add src/shared/design-tokens/
git commit -m "feat: add design tokens (colors, spacing, typography, radius, sizes)"
```

---

### Task 5: Create theme configuration

**Files:**
- Create: `src/shared/theme/light.ts`
- Create: `src/shared/theme/dark.ts`
- Create: `src/shared/theme/index.ts`
- Modify: `tailwind.config.js`

- [ ] **Step 1: Create light theme**

```typescript
// src/shared/theme/light.ts
import { colors } from '../design-tokens';

export const lightTheme = {
  background: colors.light.background,
  surface: colors.light.surface,
  surfaceHover: colors.light.surfaceHover,
  text: colors.light.text,
  textSecondary: colors.light.textSecondary,
  textTertiary: colors.light.textTertiary,
  primary: colors.light.primary,
  primaryHover: colors.light.primaryHover,
  error: colors.light.error,
  errorHover: colors.light.errorHover,
  success: colors.light.success,
  warning: colors.light.warning,
  border: colors.light.border,
  borderHover: colors.light.borderHover,
  skeleton: colors.light.skeleton,
  skeletonHighlight: colors.light.skeletonHighlight,
  overlay: colors.light.overlay,
} as const;
```

- [ ] **Step 2: Create dark theme**

```typescript
// src/shared/theme/dark.ts
import { colors } from '../design-tokens';

export const darkTheme = {
  background: colors.dark.background,
  surface: colors.dark.surface,
  surfaceHover: colors.dark.surfaceHover,
  text: colors.dark.text,
  textSecondary: colors.dark.textSecondary,
  textTertiary: colors.dark.textTertiary,
  primary: colors.dark.primary,
  primaryHover: colors.dark.primaryHover,
  error: colors.dark.error,
  errorHover: colors.dark.errorHover,
  success: colors.dark.success,
  warning: colors.dark.warning,
  border: colors.dark.border,
  borderHover: colors.dark.borderHover,
  skeleton: colors.dark.skeleton,
  skeletonHighlight: colors.dark.skeletonHighlight,
  overlay: colors.dark.overlay,
} as const;
```

- [ ] **Step 3: Create theme barrel export**

```typescript
// src/shared/theme/index.ts
export { lightTheme } from './light';
export { darkTheme } from './dark';

export type Theme = typeof lightTheme;
```

- [ ] **Step 4: Update Tailwind config with design tokens**

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,ts,tsx}',
    './src/**/*.{js,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: { light: '#FFFFFF', dark: '#000000' },
        surface: { light: '#F5F5F5', dark: '#1C1C1E' },
        'surface-hover': { light: '#EBEBEB', dark: '#2C2C2E' },
        text: { light: '#1A1A1A', dark: '#FFFFFF' },
        'text-secondary': { light: '#666666', dark: '#8E8E93' },
        'text-tertiary': { light: '#999999', dark: '#636366' },
        primary: { light: '#007AFF', dark: '#0A84FF' },
        'primary-hover': { light: '#0066DD', dark: '#409CFF' },
        error: { light: '#FF3B30', dark: '#FF453A' },
        'error-hover': { light: '#DD2F28', dark: '#FF6961' },
        success: { light: '#34C759', dark: '#30D158' },
        warning: { light: '#FF9500', dark: '#FF9F0A' },
        border: { light: '#E5E5E5', dark: '#38383A' },
        'border-hover': { light: '#CCCCCC', dark: '#48484A' },
        skeleton: { light: '#E5E5E5', dark: '#38383A' },
        'skeleton-highlight': { light: '#F5F5F5', dark: '#48484A' },
      },
      spacing: {
        xxs: '2px',
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        xxl: '32px',
        xxxl: '48px',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      fontSize: {
        xs: '12px',
        sm: '14px',
        md: '16px',
        lg: '18px',
        xl: '20px',
        xxl: '24px',
        xxxl: '32px',
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 5: Commit**

```bash
git add src/shared/theme/ tailwind.config.js
git commit -m "feat: add theme configuration with light/dark mode"
```

---

## Phase 3: Design System Components

### Task 6: Create Text component

**Files:**
- Create: `src/presentation/components/text/text.tsx`
- Create: `src/presentation/components/text/text.test.tsx`
- Create: `src/presentation/components/text/index.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/presentation/components/text/text.test.tsx
import { render } from '@testing-library/react-native';
import { Text } from './text';

describe('Text', () => {
  it('renders body text by default', () => {
    const { getByText } = render(<Text>Hello</Text>);
    expect(getByText('Hello')).toBeTruthy();
  });

  it('renders heading variant', () => {
    const { getByText } = render(<Text variant="heading">Title</Text>);
    expect(getByText('Title')).toBeTruthy();
  });

  it('renders caption variant', () => {
    const { getByText } = render(<Text variant="caption">Caption</Text>);
    expect(getByText('Caption')).toBeTruthy();
  });

  it('applies secondary color', () => {
    const { getByText } = render(<Text color="secondary">Secondary</Text>);
    expect(getByText('Secondary')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest src/presentation/components/text/text.test.tsx --no-coverage
```

Expected: FAIL (module not found)

- [ ] **Step 3: Write implementation**

```typescript
// src/presentation/components/text/text.tsx
import { Text as RNText, TextProps as RNTextProps } from 'react-native';

type TextVariant = 'heading' | 'subheading' | 'body' | 'caption' | 'label';
type TextColor = 'primary' | 'secondary' | 'tertiary' | 'error' | 'success';

interface TextProps extends Omit<RNTextProps, 'style'> {
  variant?: TextVariant;
  color?: TextColor;
  children: React.ReactNode;
}

const variantClasses: Record<TextVariant, string> = {
  heading: 'text-xxxl font-bold',
  subheading: 'text-xl font-semibold',
  body: 'text-md font-regular',
  caption: 'text-xs font-regular',
  label: 'text-sm font-medium',
};

const colorClasses: Record<TextColor, string> = {
  primary: 'text-primary',
  secondary: 'text-text-secondary',
  tertiary: 'text-text-tertiary',
  error: 'text-error',
  success: 'text-success',
};

export function Text({ variant = 'body', color, className, children, ...props }: TextProps) {
  const colorClass = color ? colorClasses[color] : '';
  return (
    <RNText className={`${variantClasses[variant]} ${colorClass} ${className ?? ''}`} {...props}>
      {children}
    </RNText>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx jest src/presentation/components/text/text.test.tsx --no-coverage
```

Expected: PASS

- [ ] **Step 5: Create barrel export**

```typescript
// src/presentation/components/text/index.ts
export { Text } from './text';
export type { TextProps } from './text';
```

- [ ] **Step 6: Commit**

```bash
git add src/presentation/components/text/
git commit -m "feat: add Text design system component"
```

---

### Task 7: Create Button component

**Files:**
- Create: `src/presentation/components/button/button.tsx`
- Create: `src/presentation/components/button/button.test.tsx`
- Create: `src/presentation/components/button/index.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/presentation/components/button/button.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from './button';

describe('Button', () => {
  it('renders with label', () => {
    const { getByText } = render(<Button onPress={() => {}}>Press me</Button>);
    expect(getByText('Press me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button onPress={onPress}>Press me</Button>);
    fireEvent.press(getByText('Press me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders primary variant by default', () => {
    const { getByText } = render(<Button onPress={() => {}}>Primary</Button>);
    expect(getByText('Primary')).toBeTruthy();
  });

  it('renders secondary variant', () => {
    const { getByText } = render(
      <Button variant="secondary" onPress={() => {}}>Secondary</Button>
    );
    expect(getByText('Secondary')).toBeTruthy();
  });

  it('renders ghost variant', () => {
    const { getByText } = render(
      <Button variant="ghost" onPress={() => {}}>Ghost</Button>
    );
    expect(getByText('Ghost')).toBeTruthy();
  });

  it('disables when disabled prop is true', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button disabled onPress={onPress}>Disabled</Button>
    );
    fireEvent.press(getByText('Disabled'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest src/presentation/components/button/button.test.tsx --no-coverage
```

Expected: FAIL (module not found)

- [ ] **Step 3: Write implementation**

```typescript
// src/presentation/components/button/button.tsx
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary active:bg-primary-hover',
  secondary: 'bg-surface active:bg-surface-hover border border-border',
  ghost: 'bg-transparent active:bg-surface',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-sm px-md',
  md: 'h-md px-lg',
  lg: 'h-lg px-xl',
};

const textVariantClasses: Record<ButtonSize, string> = {
  sm: 'text-sm font-medium',
  md: 'text-md font-semibold',
  lg: 'text-lg font-semibold',
};

const disabledClasses = 'opacity-50';

export function Button({
  variant = 'primary',
  size = 'md',
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <TouchableOpacity
      className={`rounded-lg items-center justify-center ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? disabledClasses : ''} ${className ?? ''}`}
      disabled={disabled}
      accessibilityRole="button"
      {...props}
    >
      {typeof children === 'string' ? (
        <Text className={textVariantClasses[size]}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx jest src/presentation/components/button/button.test.tsx --no-coverage
```

Expected: PASS

- [ ] **Step 5: Create barrel export**

```typescript
// src/presentation/components/button/index.ts
export { Button } from './button';
export type { ButtonProps } from './button';
```

- [ ] **Step 6: Commit**

```bash
git add src/presentation/components/button/
git commit -m "feat: add Button design system component"
```

---

### Task 8: Create Input component

**Files:**
- Create: `src/presentation/components/input/input.tsx`
- Create: `src/presentation/components/input/input.test.tsx`
- Create: `src/presentation/components/input/index.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/presentation/components/input/input.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { Input } from './input';

describe('Input', () => {
  it('renders with placeholder', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Search..." onChangeText={() => {}} />
    );
    expect(getByPlaceholderText('Search...')).toBeTruthy();
  });

  it('calls onChangeText when text changes', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <Input placeholder="Search..." onChangeText={onChangeText} />
    );
    fireEvent.changeText(getByPlaceholderText('Search...'), 'react');
    expect(onChangeText).toHaveBeenCalledWith('react');
  });

  it('renders with label', () => {
    const { getByText } = render(
      <Input label="Search" placeholder="Search..." onChangeText={() => {}} />
    );
    expect(getByText('Search')).toBeTruthy();
  });

  it('renders with error message', () => {
    const { getByText } = render(
      <Input error="Required" placeholder="Search..." onChangeText={() => {}} />
    );
    expect(getByText('Required')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest src/presentation/components/input/input.test.tsx --no-coverage
```

Expected: FAIL (module not found)

- [ ] **Step 3: Write implementation**

```typescript
// src/presentation/components/input/input.tsx
import { TextInput, TextInputProps, View } from 'react-native';
import { Text } from '../text';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <View className={`gap-xs ${className ?? ''}`}>
      {label && <Text variant="label">{label}</Text>}
      <TextInput
        className={`h-md px-md bg-surface rounded-lg text-md border ${
          error ? 'border-error' : 'border-border'
        }`}
        placeholderTextColor="#999999"
        {...props}
      />
      {error && <Text variant="caption" color="error">{error}</Text>}
    </View>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx jest src/presentation/components/input/input.test.tsx --no-coverage
```

Expected: PASS

- [ ] **Step 5: Create barrel export**

```typescript
// src/presentation/components/input/index.ts
export { Input } from './input';
export type { InputProps } from './input';
```

- [ ] **Step 6: Commit**

```bash
git add src/presentation/components/input/
git commit -m "feat: add Input design system component"
```

---

### Task 9: Create Card, Avatar, Badge components

**Files:**
- Create: `src/presentation/components/card/card.tsx` + `index.ts`
- Create: `src/presentation/components/avatar/avatar.tsx` + `index.ts`
- Create: `src/presentation/components/badge/badge.tsx` + `index.ts`

- [ ] **Step 1: Create Card component**

```typescript
// src/presentation/components/card/card.tsx
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <View className={`bg-surface rounded-lg p-lg ${className ?? ''}`} {...props}>
      {children}
    </View>
  );
}
```

- [ ] **Step 2: Create Avatar component**

```typescript
// src/presentation/components/avatar/avatar.tsx
import { View, Image, Text as RNText } from 'react-native';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: AvatarSize;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
};

const textSizeClasses: Record<AvatarSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-lg',
  xl: 'text-xl',
};

function getInitials(name: string): string {
  return name
    .split(/[\s._-]+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function Avatar({ uri, name, size = 'md' }: AvatarProps) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        className={`${sizeClasses[size]} rounded-full`}
        accessibilityLabel={`Avatar of ${name}`}
      />
    );
  }

  return (
    <View
      className={`${sizeClasses[size]} rounded-full bg-primary items-center justify-center`}
      accessibilityLabel={`Avatar of ${name}`}
    >
      <RNText className={`text-white font-semibold ${textSizeClasses[size]}`}>
        {getInitials(name)}
      </RNText>
    </View>
  );
}
```

- [ ] **Step 3: Create Badge component**

```typescript
// src/presentation/components/badge/badge.tsx
import { View } from 'react-native';
import { Text } from '../text';

type BadgeVariant = 'default' | 'success' | 'error' | 'warning';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  color?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-surface border border-border',
  success: 'bg-success/20',
  error: 'bg-error/20',
  warning: 'bg-warning/20',
};

const textColorClasses: Record<BadgeVariant, string> = {
  default: 'text-text-secondary',
  success: 'text-success',
  error: 'text-error',
  warning: 'text-warning',
};

export function Badge({ label, variant = 'default' }: BadgeProps) {
  return (
    <View className={`px-sm py-xxs rounded-full ${variantClasses[variant]}`}>
      <Text variant="caption" className={textColorClasses[variant]}>
        {label}
      </Text>
    </View>
  );
}
```

- [ ] **Step 4: Create barrel exports**

```typescript
// src/presentation/components/card/index.ts
export { Card } from './card';

// src/presentation/components/avatar/index.ts
export { Avatar } from './avatar';

// src/presentation/components/badge/index.ts
export { Badge } from './badge';
```

- [ ] **Step 5: Commit**

```bash
git add src/presentation/components/card/ src/presentation/components/avatar/ src/presentation/components/badge/
git commit -m "feat: add Card, Avatar, Badge design system components"
```

---

### Task 10: Create Spinner, Skeleton, EmptyState, ErrorState components

**Files:**
- Create: `src/presentation/components/spinner/spinner.tsx` + `index.ts`
- Create: `src/presentation/components/skeleton/skeleton.tsx` + `index.ts`
- Create: `src/presentation/components/empty-state/empty-state.tsx` + `index.ts`
- Create: `src/presentation/components/error-state/error-state.tsx` + `index.ts`

- [ ] **Step 1: Create Spinner component**

```typescript
// src/presentation/components/spinner/spinner.tsx
import { ActivityIndicator, ActivityIndicatorProps } from 'react-native';

interface SpinnerProps extends Omit<ActivityIndicatorProps, 'size'> {
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: 16, md: 24, lg: 32 };

export function Spinner({ size = 'md', ...props }: SpinnerProps) {
  return <ActivityIndicator size={sizeMap[size]} {...props} />;
}
```

- [ ] **Step 2: Create Skeleton component**

```typescript
// src/presentation/components/skeleton/skeleton.tsx
import { View, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 4 }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={{ width, height, borderRadius, opacity }}
      className="bg-skeleton"
    />
  );
}
```

- [ ] **Step 3: Create EmptyState component**

```typescript
// src/presentation/components/empty-state/empty-state.tsx
import { View } from 'react-native';
import { Text } from '../text';
import { Button } from '../button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-xxl gap-lg">
      {icon && <Text className="text-4xl">{icon}</Text>}
      <Text variant="subheading" className="text-center">
        {title}
      </Text>
      {description && (
        <Text variant="body" color="secondary" className="text-center">
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button variant="secondary" onPress={onAction}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
}
```

- [ ] **Step 4: Create ErrorState component**

```typescript
// src/presentation/components/error-state/error-state.tsx
import { View } from 'react-native';
import { Text } from '../text';
import { Button } from '../button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-xxl gap-lg">
      <Text className="text-4xl">⚠️</Text>
      <Text variant="subheading" className="text-center">
        {title}
      </Text>
      <Text variant="body" color="secondary" className="text-center">
        {message}
      </Text>
      {onRetry && (
        <Button variant="secondary" onPress={onRetry}>
          Try again
        </Button>
      )}
    </View>
  );
}
```

- [ ] **Step 5: Create barrel exports**

```typescript
// src/presentation/components/spinner/index.ts
export { Spinner } from './spinner';

// src/presentation/components/skeleton/index.ts
export { Skeleton } from './skeleton';

// src/presentation/components/empty-state/index.ts
export { EmptyState } from './empty-state';

// src/presentation/components/error-state/index.ts
export { ErrorState } from './error-state';
```

- [ ] **Step 6: Commit**

```bash
git add src/presentation/components/spinner/ src/presentation/components/skeleton/ src/presentation/components/empty-state/ src/presentation/components/error-state/
git commit -m "feat: add Spinner, Skeleton, EmptyState, ErrorState components"
```

---

### Task 11: Create Divider, Surface, and components barrel

**Files:**
- Create: `src/presentation/components/divider/divider.tsx` + `index.ts`
- Create: `src/presentation/components/surface/surface.tsx` + `index.ts`
- Create: `src/presentation/components/index.ts`

- [ ] **Step 1: Create Divider component**

```typescript
// src/presentation/components/divider/divider.tsx
import { View, ViewProps } from 'react-native';

interface DividerProps extends ViewProps {}

export function Divider({ className, ...props }: DividerProps) {
  return <View className={`h-px bg-border ${className ?? ''}`} {...props} />;
}
```

- [ ] **Step 2: Create Surface component**

```typescript
// src/presentation/components/surface/surface.tsx
import { View, ViewProps } from 'react-native';

interface SurfaceProps extends ViewProps {
  children: React.ReactNode;
}

export function Surface({ children, className, ...props }: SurfaceProps) {
  return (
    <View className={`bg-background ${className ?? ''}`} {...props}>
      {children}
    </View>
  );
}
```

- [ ] **Step 3: Create barrel exports**

```typescript
// src/presentation/components/divider/index.ts
export { Divider } from './divider';

// src/presentation/components/surface/index.ts
export { Surface } from './surface';
```

- [ ] **Step 4: Create components barrel**

```typescript
// src/presentation/components/index.ts
export { Button } from './button';
export { Input } from './input';
export { Text } from './text';
export { Card } from './card';
export { Avatar } from './avatar';
export { Badge } from './badge';
export { Spinner } from './spinner';
export { Skeleton } from './skeleton';
export { EmptyState } from './empty-state';
export { ErrorState } from './error-state';
export { Divider } from './divider';
export { Surface } from './surface';
```

- [ ] **Step 5: Commit**

```bash
git add src/presentation/components/divider/ src/presentation/components/surface/ src/presentation/components/index.ts
git commit -m "feat: add Divider, Surface, and components barrel export"
```

---

## Phase 4: Domain Layer

### Task 12: Create domain entities

**Files:**
- Create: `src/domain/entities/repository.entity.ts`
- Create: `src/domain/entities/issue.entity.ts`
- Create: `src/domain/entities/owner.entity.ts`
- Create: `src/domain/entities/label.entity.ts`
- Create: `src/domain/entities/user.entity.ts`
- Create: `src/domain/entities/index.ts`

- [ ] **Step 1: Create Repository entity**

```typescript
// src/domain/entities/repository.entity.ts
import type { RepositoryId } from '../value-objects';
import type { Owner } from './owner.entity';

export interface Repository {
  readonly id: RepositoryId;
  readonly name: string;
  readonly fullName: string;
  readonly description: string | null;
  readonly stars: number;
  readonly forks: number;
  readonly language: string | null;
  readonly owner: Owner;
  readonly updatedAt: Date;
  readonly isFavorite: boolean;
}
```

- [ ] **Step 2: Create Issue entity**

```typescript
// src/domain/entities/issue.entity.ts
import type { IssueId, IssueState } from '../value-objects';
import type { Owner } from './owner.entity';
import type { Label } from './label.entity';

export interface Issue {
  readonly id: IssueId;
  readonly number: number;
  readonly title: string;
  readonly body: string;
  readonly state: IssueState;
  readonly author: Owner;
  readonly labels: ReadonlyArray<Label>;
  readonly commentsCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
```

- [ ] **Step 3: Create Owner entity**

```typescript
// src/domain/entities/owner.entity.ts
export interface Owner {
  readonly login: string;
  readonly avatarUrl: string;
  readonly type: 'User' | 'Organization';
}
```

- [ ] **Step 4: Create Label entity**

```typescript
// src/domain/entities/label.entity.ts
export interface Label {
  readonly name: string;
  readonly color: string;
}
```

- [ ] **Step 5: Create User entity**

```typescript
// src/domain/entities/user.entity.ts
export interface User {
  readonly login: string;
  readonly avatarUrl: string;
}
```

- [ ] **Step 6: Create Comment entity**

```typescript
// src/domain/entities/comment.entity.ts
export interface Comment {
  readonly id: string;
  readonly body: string;
  readonly author: {
    readonly login: string;
    readonly avatarUrl: string;
  };
  readonly createdAt: Date;
}
```

- [ ] **Step 7: Create barrel export**

```typescript
// src/domain/entities/index.ts
export type { Repository } from './repository.entity';
export type { Issue } from './issue.entity';
export type { Owner } from './owner.entity';
export type { Label } from './label.entity';
export type { User } from './user.entity';
export type { Comment } from './comment.entity';
```

- [ ] **Step 8: Commit**

```bash
git add src/domain/entities/
git commit -m "feat: add domain entities (Repository, Issue, Owner, Label, User, Comment)"
```

---

### Task 13: Create value objects

**Files:**
- Create: `src/domain/value-objects/repository-id.ts`
- Create: `src/domain/value-objects/issue-id.ts`
- Create: `src/domain/value-objects/issue-state.ts`
- Create: `src/domain/value-objects/provider-type.ts`
- Create: `src/domain/value-objects/pagination.ts`
- Create: `src/domain/value-objects/index.ts`

- [ ] **Step 1: Create branded ID types**

```typescript
// src/domain/value-objects/repository-id.ts
export type RepositoryId = string & { readonly __brand: 'RepositoryId' };

export function createRepositoryId(value: string): RepositoryId {
  return value as RepositoryId;
}

export function getRepositoryIdValue(id: RepositoryId): string {
  return id as string;
}
```

```typescript
// src/domain/value-objects/issue-id.ts
export type IssueId = string & { readonly __brand: 'IssueId' };

export function createIssueId(value: string): IssueId {
  return value as IssueId;
}
```

- [ ] **Step 2: Create IssueState type**

```typescript
// src/domain/value-objects/issue-state.ts
export type IssueState = 'open' | 'closed';
```

- [ ] **Step 3: Create ProviderType type**

```typescript
// src/domain/value-objects/provider-type.ts
export type ProviderType = 'github' | 'gitlab';
```

- [ ] **Step 4: Create Pagination types**

```typescript
// src/domain/value-objects/pagination.ts
export interface Pagination {
  readonly page: number;
  readonly perPage: number;
  readonly totalCount: number;
}

export interface PaginatedResult<T> {
  readonly items: ReadonlyArray<T>;
  readonly pagination: Pagination;
}

export interface SearchParams {
  readonly query: string;
  readonly page: number;
  readonly perPage: number;
}

export interface GetIssuesParams {
  readonly owner: string;
  readonly name: string;
  readonly state: IssueState | 'all';
  readonly page: number;
  readonly perPage: number;
}

export interface GetCommentsParams {
  readonly owner: string;
  readonly name: string;
  readonly issueNumber: number;
  readonly page: number;
  readonly perPage: number;
}
```

- [ ] **Step 5: Create barrel export**

```typescript
// src/domain/value-objects/index.ts
export { type RepositoryId, createRepositoryId, getRepositoryIdValue } from './repository-id';
export { type IssueId, createIssueId } from './issue-id';
export { type IssueState } from './issue-state';
export { type ProviderType } from './provider-type';
export type { Pagination, PaginatedResult, SearchParams, GetIssuesParams, GetCommentsParams } from './pagination';
```

- [ ] **Step 6: Commit**

```bash
git add src/domain/value-objects/
git commit -m "feat: add domain value objects (branded IDs, pagination, provider types)"
```

---

### Task 14: Create domain ports

**Files:**
- Create: `src/domain/ports/repository.port.ts`
- Create: `src/domain/ports/issue.port.ts`
- Create: `src/domain/ports/auth.port.ts`
- Create: `src/domain/ports/storage.port.ts`
- Create: `src/domain/ports/index.ts`

- [ ] **Step 1: Create RepositoryPort**

```typescript
// src/domain/ports/repository.port.ts
import type { Repository } from '../entities';
import type { PaginatedResult, SearchParams } from '../value-objects';

export interface RepositoryPort {
  search(params: SearchParams): Promise<PaginatedResult<Repository>>;
  getById(owner: string, name: string): Promise<Repository>;
  getReadme(owner: string, name: string): Promise<string>;
}
```

- [ ] **Step 2: Create IssuePort**

```typescript
// src/domain/ports/issue.port.ts
import type { Issue, Comment } from '../entities';
import type { PaginatedResult, GetIssuesParams, GetCommentsParams } from '../value-objects';

export interface IssuePort {
  getIssues(params: GetIssuesParams): Promise<PaginatedResult<Issue>>;
  getComments(params: GetCommentsParams): Promise<PaginatedResult<Comment>>;
}
```

- [ ] **Step 3: Create AuthPort**

```typescript
// src/domain/ports/auth.port.ts
import type { User } from '../entities';

export interface AuthPort {
  login(): Promise<User>;
  logout(): Promise<void>;
  getToken(): Promise<string | null>;
  isAuthenticated(): Promise<boolean>;
  getCurrentUser(): Promise<User | null>;
}
```

- [ ] **Step 4: Create StoragePort**

```typescript
// src/domain/ports/storage.port.ts
export interface StoragePort {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}
```

- [ ] **Step 5: Create barrel export**

```typescript
// src/domain/ports/index.ts
export type { RepositoryPort } from './repository.port';
export type { IssuePort } from './issue.port';
export type { AuthPort } from './auth.port';
export type { StoragePort } from './storage.port';
```

- [ ] **Step 6: Commit**

```bash
git add src/domain/ports/
git commit -m "feat: add domain ports (Repository, Issue, Auth, Storage contracts)"
```

---

### Task 15: Create domain errors

**Files:**
- Create: `src/domain/errors/domain-error.ts`
- Create: `src/domain/errors/repository-not-found.ts`
- Create: `src/domain/errors/authentication-required.ts`
- Create: `src/domain/errors/provider-unavailable.ts`
- Create: `src/domain/errors/index.ts`

- [ ] **Step 1: Create base DomainError**

```typescript
// src/domain/errors/domain-error.ts
export class DomainError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
  }
}
```

- [ ] **Step 2: Create specific error classes**

```typescript
// src/domain/errors/repository-not-found.ts
import { DomainError } from './domain-error';

export class RepositoryNotFoundError extends DomainError {
  constructor(owner: string, name: string) {
    super(`Repository ${owner}/${name} not found`, 'REPOSITORY_NOT_FOUND');
    this.name = 'RepositoryNotFoundError';
  }
}
```

```typescript
// src/domain/errors/authentication-required.ts
import { DomainError } from './domain-error';

export class AuthenticationRequiredError extends DomainError {
  constructor() {
    super('Authentication is required', 'AUTHENTICATION_REQUIRED');
    this.name = 'AuthenticationRequiredError';
  }
}
```

```typescript
// src/domain/errors/provider-unavailable.ts
import { DomainError } from './domain-error';

export class ProviderUnavailableError extends DomainError {
  constructor(provider: string) {
    super(`Provider ${provider} is unavailable`, 'PROVIDER_UNAVAILABLE');
    this.name = 'ProviderUnavailableError';
  }
}
```

- [ ] **Step 3: Create barrel export**

```typescript
// src/domain/errors/index.ts
export { DomainError } from './domain-error';
export { RepositoryNotFoundError } from './repository-not-found';
export { AuthenticationRequiredError } from './authentication-required';
export { ProviderUnavailableError } from './provider-unavailable';
```

- [ ] **Step 4: Commit**

```bash
git add src/domain/errors/
git commit -m "feat: add domain error classes"
```

---

### Task 16: Create domain use cases

**Files:**
- Create: `src/domain/use-cases/repositories/search-repositories.use-case.ts`
- Create: `src/domain/use-cases/repositories/get-repository-details.use-case.ts`
- Create: `src/domain/use-cases/repositories/get-repository-readme.use-case.ts`
- Create: `src/domain/use-cases/issues/get-issues.use-case.ts`
- Create: `src/domain/use-cases/issues/get-issue-comments.use-case.ts`
- Create: `src/domain/use-cases/auth/login.use-case.ts`
- Create: `src/domain/use-cases/auth/logout.use-case.ts`
- Create: `src/domain/use-cases/auth/check-auth-status.use-case.ts`
- Create: `src/domain/use-cases/index.ts`

- [ ] **Step 1: Create SearchRepositoriesUseCase**

```typescript
// src/domain/use-cases/repositories/search-repositories.use-case.ts
import type { RepositoryPort } from '../../ports';
import type { PaginatedResult, SearchParams } from '../../value-objects';
import type { Repository } from '../../entities';

export class SearchRepositoriesUseCase {
  constructor(private readonly repositoryPort: RepositoryPort) {}

  async execute(params: SearchParams): Promise<PaginatedResult<Repository>> {
    return this.repositoryPort.search(params);
  }
}
```

- [ ] **Step 2: Create GetRepositoryDetailsUseCase**

```typescript
// src/domain/use-cases/repositories/get-repository-details.use-case.ts
import type { RepositoryPort } from '../../ports';
import type { Repository } from '../../entities';

export class GetRepositoryDetailsUseCase {
  constructor(private readonly repositoryPort: RepositoryPort) {}

  async execute(owner: string, name: string): Promise<Repository> {
    return this.repositoryPort.getById(owner, name);
  }
}
```

- [ ] **Step 3: Create GetRepositoryReadmeUseCase**

```typescript
// src/domain/use-cases/repositories/get-repository-readme.use-case.ts
import type { RepositoryPort } from '../../ports';

export class GetRepositoryReadmeUseCase {
  constructor(private readonly repositoryPort: RepositoryPort) {}

  async execute(owner: string, name: string): Promise<string> {
    return this.repositoryPort.getReadme(owner, name);
  }
}
```

- [ ] **Step 4: Create GetIssuesUseCase**

```typescript
// src/domain/use-cases/issues/get-issues.use-case.ts
import type { IssuePort } from '../../ports';
import type { PaginatedResult, GetIssuesParams } from '../../value-objects';
import type { Issue } from '../../entities';

export class GetIssuesUseCase {
  constructor(private readonly issuePort: IssuePort) {}

  async execute(params: GetIssuesParams): Promise<PaginatedResult<Issue>> {
    return this.issuePort.getIssues(params);
  }
}
```

- [ ] **Step 5: Create GetIssueCommentsUseCase**

```typescript
// src/domain/use-cases/issues/get-issue-comments.use-case.ts
import type { IssuePort } from '../../ports';
import type { PaginatedResult, GetCommentsParams } from '../../value-objects';
import type { Comment } from '../../entities';

export class GetIssueCommentsUseCase {
  constructor(private readonly issuePort: IssuePort) {}

  async execute(params: GetCommentsParams): Promise<PaginatedResult<Comment>> {
    return this.issuePort.getComments(params);
  }
}
```

- [ ] **Step 6: Create LoginUseCase**

```typescript
// src/domain/use-cases/auth/login.use-case.ts
import type { AuthPort } from '../../ports';
import type { User } from '../../entities';

export class LoginUseCase {
  constructor(private readonly authPort: AuthPort) {}

  async execute(): Promise<User> {
    return this.authPort.login();
  }
}
```

- [ ] **Step 7: Create LogoutUseCase**

```typescript
// src/domain/use-cases/auth/logout.use-case.ts
import type { AuthPort } from '../../ports';

export class LogoutUseCase {
  constructor(private readonly authPort: AuthPort) {}

  async execute(): Promise<void> {
    return this.authPort.logout();
  }
}
```

- [ ] **Step 8: Create CheckAuthStatusUseCase**

```typescript
// src/domain/use-cases/auth/check-auth-status.use-case.ts
import type { AuthPort } from '../../ports';

export class CheckAuthStatusUseCase {
  constructor(private readonly authPort: AuthPort) {}

  async execute(): Promise<boolean> {
    return this.authPort.isAuthenticated();
  }
}
```

- [ ] **Step 9: Create barrel export**

```typescript
// src/domain/use-cases/index.ts
export { SearchRepositoriesUseCase } from './repositories/search-repositories.use-case';
export { GetRepositoryDetailsUseCase } from './repositories/get-repository-details.use-case';
export { GetRepositoryReadmeUseCase } from './repositories/get-repository-readme.use-case';
export { GetIssuesUseCase } from './issues/get-issues.use-case';
export { GetIssueCommentsUseCase } from './issues/get-issue-comments.use-case';
export { LoginUseCase } from './auth/login.use-case';
export { LogoutUseCase } from './auth/logout.use-case';
export { CheckAuthStatusUseCase } from './auth/check-auth-status.use-case';
```

- [ ] **Step 10: Create domain barrel**

```typescript
// src/domain/index.ts
export * from './entities';
export * from './value-objects';
export * from './ports';
export * from './use-cases';
export * from './errors';
```

- [ ] **Step 11: Commit**

```bash
git add src/domain/
git commit -m "feat: add domain use cases (search, details, issues, auth)"
```

---

## Phase 5: Infrastructure Layer

### Task 17: Create DTOs

**Files:**
- Create: `src/infrastructure/dtos/github/github-repository.dto.ts`
- Create: `src/infrastructure/dtos/github/github-issue.dto.ts`
- Create: `src/infrastructure/dtos/gitlab/gitlab-repository.dto.ts`
- Create: `src/infrastructure/dtos/gitlab/gitlab-issue.dto.ts`

- [ ] **Step 1: Create GitHub DTOs**

```typescript
// src/infrastructure/dtos/github/github-repository.dto.ts
export interface GitHubOwnerDTO {
  readonly login: string;
  readonly avatar_url: string;
  readonly type: 'User' | 'Organization';
}

export interface GitHubRepositoryDTO {
  readonly id: number;
  readonly name: string;
  readonly full_name: string;
  readonly description: string | null;
  readonly stargazers_count: number;
  readonly forks_count: number;
  readonly language: string | null;
  readonly owner: GitHubOwnerDTO;
  readonly updated_at: string;
}

export interface GitHubSearchResponseDTO {
  readonly total_count: number;
  readonly incomplete_results: boolean;
  readonly items: ReadonlyArray<GitHubRepositoryDTO>;
}
```

```typescript
// src/infrastructure/dtos/github/github-issue.dto.ts
export interface GitHubLabelDTO {
  readonly name: string;
  readonly color: string;
}

export interface GitHubIssueDTO {
  readonly id: number;
  readonly number: number;
  readonly title: string;
  readonly body: string;
  readonly state: 'open' | 'closed';
  readonly user: GitHubOwnerDTO;
  readonly labels: ReadonlyArray<GitHubLabelDTO>;
  readonly comments: number;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface GitHubCommentDTO {
  readonly id: number;
  readonly body: string;
  readonly user: {
    readonly login: string;
    readonly avatar_url: string;
  };
  readonly created_at: string;
}

interface GitHubOwnerDTO {
  readonly login: string;
  readonly avatar_url: string;
  readonly type: 'User' | 'Organization';
}
```

- [ ] **Step 2: Create GitLab DTOs**

```typescript
// src/infrastructure/dtos/gitlab/gitlab-repository.dto.ts
export interface GitLabOwnerDTO {
  readonly username: string;
  readonly avatar_url: string;
  readonly state: string;
}

export interface GitLabRepositoryDTO {
  readonly id: number;
  readonly name: string;
  readonly path_with_namespace: string;
  readonly description: string | null;
  readonly star_count: number;
  readonly forks_count: number;
  readonly language: string | null;
  readonly owner: GitLabOwnerDTO | null;
  readonly last_activity_at: string;
}

export interface GitLabSearchResponseDTO {
  readonly data: ReadonlyArray<GitLabRepositoryDTO>;
  readonly total: number;
  readonly page: number;
  readonly per_page: number;
}
```

```typescript
// src/infrastructure/dtos/gitlab/gitlab-issue.dto.ts
export interface GitLabLabelDTO {
  readonly name: string;
  readonly color: string;
}

export interface GitLabIssueDTO {
  readonly id: number;
  readonly iid: number;
  readonly title: string;
  readonly description: string;
  readonly state: 'opened' | 'closed';
  readonly author: {
    readonly username: string;
    readonly avatar_url: string;
  };
  readonly labels: ReadonlyArray<string>;
  readonly user_notes_count: number;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface GitLabCommentDTO {
  readonly id: number;
  readonly body: string;
  readonly author: {
    readonly username: string;
    readonly avatar_url: string;
  };
  readonly created_at: string;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/infrastructure/dtos/
git commit -m "feat: add GitHub and GitLab API DTOs"
```

---

### Task 18: Create mappers

**Files:**
- Create: `src/infrastructure/mappers/github-repository.mapper.ts`
- Create: `src/infrastructure/mappers/github-issue.mapper.ts`
- Create: `src/infrastructure/mappers/gitlab-repository.mapper.ts`
- Create: `src/infrastructure/mappers/gitlab-issue.mapper.ts`

- [ ] **Step 1: Create GitHub repository mapper**

```typescript
// src/infrastructure/mappers/github-repository.mapper.ts
import type { Repository, Owner } from '../../domain/entities';
import type { RepositoryId } from '../../domain/value-objects';
import { createRepositoryId } from '../../domain/value-objects';
import type { GitHubRepositoryDTO, GitHubOwnerDTO } from '../dtos/github/github-repository.dto';

function mapOwner(dto: GitHubOwnerDTO): Owner {
  return {
    login: dto.login,
    avatarUrl: dto.avatar_url,
    type: dto.type,
  };
}

export class GitHubRepositoryMapper {
  static toDomain(dto: GitHubRepositoryDTO): Repository {
    return {
      id: createRepositoryId(String(dto.id)),
      name: dto.name,
      fullName: dto.full_name,
      description: dto.description,
      stars: dto.stargazers_count,
      forks: dto.forks_count,
      language: dto.language,
      owner: mapOwner(dto.owner),
      updatedAt: new Date(dto.updated_at),
      isFavorite: false,
    };
  }
}
```

- [ ] **Step 2: Create GitHub issue mapper**

```typescript
// src/infrastructure/mappers/github-issue.mapper.ts
import type { Issue, Label, Owner, Comment } from '../../domain/entities';
import type { IssueId } from '../../domain/value-objects';
import { createIssueId } from '../../domain/value-objects';
import type { GitHubIssueDTO, GitHubLabelDTO, GitHubCommentDTO } from '../dtos/github/github-issue.dto';

function mapLabel(dto: GitHubLabelDTO): Label {
  return { name: dto.name, color: dto.color };
}

function mapAuthor(user: { login: string; avatar_url: string; type?: string }): Owner {
  return {
    login: user.login,
    avatarUrl: user.avatar_url,
    type: (user.type as 'User' | 'Organization') ?? 'User',
  };
}

export class GitHubIssueMapper {
  static toDomain(dto: GitHubIssueDTO): Issue {
    return {
      id: createIssueId(String(dto.id)),
      number: dto.number,
      title: dto.title,
      body: dto.body,
      state: dto.state,
      author: mapAuthor(dto.user),
      labels: dto.labels.map(mapLabel),
      commentsCount: dto.comments,
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at),
    };
  }

  static commentToDomain(dto: GitHubCommentDTO): Comment {
    return {
      id: String(dto.id),
      body: dto.body,
      author: {
        login: dto.user.login,
        avatarUrl: dto.user.avatar_url,
      },
      createdAt: new Date(dto.created_at),
    };
  }
}
```

- [ ] **Step 3: Create GitLab repository mapper**

```typescript
// src/infrastructure/mappers/gitlab-repository.mapper.ts
import type { Repository, Owner } from '../../domain/entities';
import { createRepositoryId } from '../../domain/value-objects';
import type { GitLabRepositoryDTO, GitLabOwnerDTO } from '../dtos/gitlab/gitlab-repository.dto';

function mapOwner(dto: GitLabOwnerDTO | null): Owner {
  if (!dto) {
    return { login: 'unknown', avatarUrl: '', type: 'User' };
  }
  return {
    login: dto.username,
    avatarUrl: dto.avatar_url,
    type: 'User',
  };
}

export class GitLabRepositoryMapper {
  static toDomain(dto: GitLabRepositoryDTO): Repository {
    return {
      id: createRepositoryId(String(dto.id)),
      name: dto.name,
      fullName: dto.path_with_namespace,
      description: dto.description,
      stars: dto.star_count,
      forks: dto.forks_count,
      language: dto.language,
      owner: mapOwner(dto.owner),
      updatedAt: new Date(dto.last_activity_at),
      isFavorite: false,
    };
  }
}
```

- [ ] **Step 4: Create GitLab issue mapper**

```typescript
// src/infrastructure/mappers/gitlab-issue.mapper.ts
import type { Issue, Label, Comment } from '../../domain/entities';
import { createIssueId } from '../../domain/value-objects';
import type { GitLabIssueDTO, GitLabCommentDTO } from '../dtos/gitlab/gitlab-issue.dto';

function mapLabels(labels: ReadonlyArray<string>): ReadonlyArray<Label> {
  return labels.map((name) => ({ name, color: '#007AFF' }));
}

export class GitLabIssueMapper {
  static toDomain(dto: GitLabIssueDTO): Issue {
    return {
      id: createIssueId(String(dto.id)),
      number: dto.iid,
      title: dto.title,
      body: dto.description,
      state: dto.state === 'opened' ? 'open' : 'closed',
      author: {
        login: dto.author.username,
        avatarUrl: dto.author.avatar_url,
        type: 'User',
      },
      labels: mapLabels(dto.labels),
      commentsCount: dto.user_notes_count,
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at),
    };
  }

  static commentToDomain(dto: GitLabCommentDTO): Comment {
    return {
      id: String(dto.id),
      body: dto.body,
      author: {
        login: dto.author.username,
        avatarUrl: dto.author.avatar_url,
      },
      createdAt: new Date(dto.created_at),
    };
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add src/infrastructure/mappers/
git commit -m "feat: add GitHub and GitLab mappers (DTO to domain)"
```

---

### Task 19: Create HTTP client with interceptors

**Files:**
- Create: `src/infrastructure/http/axios-client.ts`
- Create: `src/infrastructure/http/interceptors/auth.interceptor.ts`
- Create: `src/infrastructure/http/interceptors/error.interceptor.ts`
- Create: `src/infrastructure/http/interceptors/retry.interceptor.ts`

- [ ] **Step 1: Create error interceptor**

```typescript
// src/infrastructure/http/interceptors/error.interceptor.ts
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

export interface ApiError {
  readonly message: string;
  readonly status: number;
  readonly code: string;
}

export function createErrorInterceptor() {
  return {
    onRejected: (error: AxiosError) => {
      const status = error.response?.status ?? 500;
      const message = error.message || 'An unexpected error occurred';
      const code = error.code ?? 'UNKNOWN_ERROR';

      const apiError: ApiError = { message, status, code };
      return Promise.reject(apiError);
    },
  };
}
```

- [ ] **Step 2: Create auth interceptor**

```typescript
// src/infrastructure/http/interceptors/auth.interceptor.ts
import type { InternalAxiosRequestConfig } from 'axios';

export function createAuthInterceptor(getToken: () => Promise<string | null>) {
  return {
    onRequest: async (config: InternalAxiosRequestConfig) => {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
  };
}
```

- [ ] **Step 3: Create retry interceptor**

```typescript
// src/infrastructure/http/interceptors/retry.interceptor.ts
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
}

export function createRetryInterceptor(config: RetryConfig = {}) {
  const { maxRetries = 3, retryDelay = 1000 } = config;

  return {
    onRejected: async (error: AxiosError) => {
      const request = error.config as InternalAxiosRequestConfig & { __retryCount?: number };

      if (!request?.__retryCount) {
        request.__retryCount = 0;
      }

      if (request.__retryCount >= maxRetries) {
        return Promise.reject(error);
      }

      const status = error.response?.status;
      if (status && status >= 500) {
        request.__retryCount += 1;
        await new Promise((resolve) => setTimeout(resolve, retryDelay * request.__retryCount));
        return Promise.reject(error);
      }

      return Promise.reject(error);
    },
  };
}
```

- [ ] **Step 4: Create axios client factory**

```typescript
// src/infrastructure/http/axios-client.ts
import axios from 'axios';
import { createAuthInterceptor } from './interceptors/auth.interceptor';
import { createErrorInterceptor } from './interceptors/error.interceptor';
import { createRetryInterceptor } from './interceptors/retry.interceptor';

interface HttpClientConfig {
  baseURL: string;
  timeout?: number;
  getToken?: () => Promise<string | null>;
}

export function createHttpClient(config: HttpClientConfig) {
  const client = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout ?? 10000,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (config.getToken) {
    const authInterceptor = createAuthInterceptor(config.getToken);
    client.interceptors.request.use(authInterceptor.onRequest);
  }

  const errorInterceptor = createErrorInterceptor();
  client.interceptors.response.use(undefined, errorInterceptor.onRejected);

  const retryInterceptor = createRetryInterceptor({ maxRetries: 3, retryDelay: 1000 });
  client.interceptors.response.use(undefined, retryInterceptor.onRejected);

  return client;
}
```

- [ ] **Step 5: Commit**

```bash
git add src/infrastructure/http/
git commit -m "feat: add HTTP client with auth, error, and retry interceptors"
```

---

### Task 20: Create storage adapter

**Files:**
- Create: `src/infrastructure/storage/expo-secure-store.adapter.ts`

- [ ] **Step 1: Create SecureStore adapter**

```typescript
// src/infrastructure/storage/expo-secure-store.adapter.ts
import * as SecureStore from 'expo-secure-store';
import type { StoragePort } from '../../domain/ports';

export class ExpoSecureStoreAdapter implements StoragePort {
  private static instance: ExpoSecureStoreAdapter;

  private constructor() {}

  static getInstance(): ExpoSecureStoreAdapter {
    if (!ExpoSecureStoreAdapter.instance) {
      ExpoSecureStoreAdapter.instance = new ExpoSecureStoreAdapter();
    }
    return ExpoSecureStoreAdapter.instance;
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Silently fail on storage errors
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Silently fail on storage errors
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/infrastructure/storage/
git commit -m "feat: add Expo SecureStore adapter for secure token storage"
```

---

### Task 21: Create GitHub adapters

**Files:**
- Create: `src/infrastructure/providers/github/github-api.service.ts`
- Create: `src/infrastructure/providers/github/github-repository.adapter.ts`
- Create: `src/infrastructure/providers/github/github-issue.adapter.ts`
- Create: `src/infrastructure/providers/github/github-auth.adapter.ts`

- [ ] **Step 1: Create GitHub API service**

```typescript
// src/infrastructure/providers/github/github-api.service.ts
import { createHttpClient } from '../../http/axios-client';
import type { StoragePort } from '../../../domain/ports';

const GITHUB_BASE_URL = 'https://api.github.com';

export class GitHubApiService {
  private static instance: GitHubApiService;
  private readonly client;

  private constructor(storagePort: StoragePort) {
    this.client = createHttpClient({
      baseURL: GITHUB_BASE_URL,
      getToken: () => storagePort.getItem('auth_token'),
    });
  }

  static getInstance(storagePort: StoragePort): GitHubApiService {
    if (!GitHubApiService.instance) {
      GitHubApiService.instance = new GitHubApiService(storagePort);
    }
    return GitHubApiService.instance;
  }

  getClient() {
    return this.client;
  }
}
```

- [ ] **Step 2: Create GitHub repository adapter**

```typescript
// src/infrastructure/providers/github/github-repository.adapter.ts
import type { RepositoryPort } from '../../../domain/ports';
import type { PaginatedResult, SearchParams } from '../../../domain/value-objects';
import type { Repository } from '../../../domain/entities';
import type { GitHubSearchResponseDTO } from '../../dtos/github/github-repository.dto';
import { GitHubRepositoryMapper } from '../../mappers/github-repository.mapper';

export class GitHubRepositoryAdapter implements RepositoryPort {
  constructor(private readonly apiClient: ReturnType<typeof import('axios').default.create>) {}

  async search(params: SearchParams): Promise<PaginatedResult<Repository>> {
    const response = await this.apiClient.get<GitHubSearchResponseDTO>('/search/repositories', {
      params: {
        q: params.query,
        page: params.page,
        per_page: params.perPage,
      },
    });

    return {
      items: response.data.items.map(GitHubRepositoryMapper.toDomain),
      pagination: {
        page: params.page,
        perPage: params.perPage,
        totalCount: response.data.total_count,
      },
    };
  }

  async getById(owner: string, name: string): Promise<Repository> {
    const response = await this.apiClient.get(`/repos/${owner}/${name}`);
    return GitHubRepositoryMapper.toDomain(response.data);
  }

  async getReadme(owner: string, name: string): Promise<string> {
    const response = await this.apiClient.get(`/repos/${owner}/${name}/readme`, {
      headers: { Accept: 'application/vnd.github.v3.raw' },
    });
    return response.data;
  }
}
```

- [ ] **Step 3: Create GitHub issue adapter**

```typescript
// src/infrastructure/providers/github/github-issue.adapter.ts
import type { IssuePort } from '../../../domain/ports';
import type { PaginatedResult, GetIssuesParams, GetCommentsParams } from '../../../domain/value-objects';
import type { Issue, Comment } from '../../../domain/entities';
import type { GitHubIssueDTO, GitHubCommentDTO } from '../../dtos/github/github-issue.dto';
import { GitHubIssueMapper } from '../../mappers/github-issue.mapper';

export class GitHubIssueAdapter implements IssuePort {
  constructor(private readonly apiClient: ReturnType<typeof import('axios').default.create>) {}

  async getIssues(params: GetIssuesParams): Promise<PaginatedResult<Issue>> {
    const response = await this.apiClient.get<ReadonlyArray<GitHubIssueDTO>>(
      `/repos/${params.owner}/${params.name}/issues`,
      {
        params: {
          state: params.state === 'all' ? 'all' : params.state,
          page: params.page,
          per_page: params.perPage,
        },
      }
    );

    const totalCountHeader = response.headers['x-total-count'];
    const totalCount = totalCountHeader ? parseInt(totalCountHeader, 10) : response.data.length;

    return {
      items: response.data.map(GitHubIssueMapper.toDomain),
      pagination: {
        page: params.page,
        perPage: params.perPage,
        totalCount,
      },
    };
  }

  async getComments(params: GetCommentsParams): Promise<PaginatedResult<Comment>> {
    const response = await this.apiClient.get<ReadonlyArray<GitHubCommentDTO>>(
      `/repos/${params.owner}/${params.name}/issues/${params.issueNumber}/comments`,
      {
        params: {
          page: params.page,
          per_page: params.perPage,
        },
      }
    );

    return {
      items: response.data.map(GitHubIssueMapper.commentToDomain),
      pagination: {
        page: params.page,
        perPage: params.perPage,
        totalCount: response.data.length,
      },
    };
  }
}
```

- [ ] **Step 4: Create GitHub auth adapter**

```typescript
// src/infrastructure/providers/github/github-auth.adapter.ts
import type { AuthPort } from '../../../domain/ports';
import type { User } from '../../../domain/entities';
import type { StoragePort } from '../../../domain/ports';

const AUTH_TOKEN_KEY = 'auth_token';
const USER_KEY = 'current_user';

export class GitHubAuthAdapter implements AuthPort {
  constructor(private readonly storagePort: StoragePort) {}

  async login(): Promise<User> {
    // OAuth flow would be implemented here with expo-auth-session
    // For now, this is a placeholder that will be wired up
    throw new Error('OAuth flow not implemented yet');
  }

  async logout(): Promise<void> {
    await this.storagePort.removeItem(AUTH_TOKEN_KEY);
    await this.storagePort.removeItem(USER_KEY);
  }

  async getToken(): Promise<string | null> {
    return this.storagePort.getItem(AUTH_TOKEN_KEY);
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  }

  async getCurrentUser(): Promise<User | null> {
    const userJson = await this.storagePort.getItem(USER_KEY);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson) as User;
    } catch {
      return null;
    }
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add src/infrastructure/providers/github/
git commit -m "feat: add GitHub provider adapters (repository, issue, auth)"
```

---

### Task 22: Create GitLab adapters

**Files:**
- Create: `src/infrastructure/providers/gitlab/gitlab-api.service.ts`
- Create: `src/infrastructure/providers/gitlab/gitlab-repository.adapter.ts`
- Create: `src/infrastructure/providers/gitlab/gitlab-issue.adapter.ts`
- Create: `src/infrastructure/providers/gitlab/gitlab-auth.adapter.ts`

- [ ] **Step 1: Create GitLab API service**

```typescript
// src/infrastructure/providers/gitlab/gitlab-api.service.ts
import { createHttpClient } from '../../http/axios-client';
import type { StoragePort } from '../../../domain/ports';

const GITLAB_BASE_URL = 'https://gitlab.com/api/v4';

export class GitLabApiService {
  private static instance: GitLabApiService;
  private readonly client;

  private constructor(storagePort: StoragePort) {
    this.client = createHttpClient({
      baseURL: GITLAB_BASE_URL,
      getToken: () => storagePort.getItem('auth_token'),
    });
  }

  static getInstance(storagePort: StoragePort): GitLabApiService {
    if (!GitLabApiService.instance) {
      GitLabApiService.instance = new GitLabApiService(storagePort);
    }
    return GitLabApiService.instance;
  }

  getClient() {
    return this.client;
  }
}
```

- [ ] **Step 2: Create GitLab repository adapter**

```typescript
// src/infrastructure/providers/gitlab/gitlab-repository.adapter.ts
import type { RepositoryPort } from '../../../domain/ports';
import type { PaginatedResult, SearchParams } from '../../../domain/value-objects';
import type { Repository } from '../../../domain/entities';
import type { GitLabSearchResponseDTO } from '../../dtos/gitlab/gitlab-repository.dto';
import { GitLabRepositoryMapper } from '../../mappers/gitlab-repository.mapper';

export class GitLabRepositoryAdapter implements RepositoryPort {
  constructor(private readonly apiClient: ReturnType<typeof import('axios').default.create>) {}

  async search(params: SearchParams): Promise<PaginatedResult<Repository>> {
    const response = await this.apiClient.get<GitLabSearchResponseDTO>('/projects', {
      params: {
        search: params.query,
        page: params.page,
        per_page: params.perPage,
        order_by: 'last_activity_at',
        sort: 'desc',
      },
    });

    return {
      items: response.data.data.map(GitLabRepositoryMapper.toDomain),
      pagination: {
        page: params.page,
        perPage: params.perPage,
        totalCount: response.data.total,
      },
    };
  }

  async getById(owner: string, name: string): Promise<Repository> {
    const encodedPath = encodeURIComponent(`${owner}/${name}`);
    const response = await this.apiClient.get(`/projects/${encodedPath}`);
    return GitLabRepositoryMapper.toDomain(response.data);
  }

  async getReadme(owner: string, name: string): Promise<string> {
    const encodedPath = encodeURIComponent(`${owner}/${name}`);
    const response = await this.apiClient.get(`/projects/${encodedPath}/repository/files/README.md`, {
      params: { ref: 'main' },
    });
    return atob(response.data.content);
  }
}
```

- [ ] **Step 3: Create GitLab issue adapter**

```typescript
// src/infrastructure/providers/gitlab/gitlab-issue.adapter.ts
import type { IssuePort } from '../../../domain/ports';
import type { PaginatedResult, GetIssuesParams, GetCommentsParams } from '../../../domain/value-objects';
import type { Issue, Comment } from '../../../domain/entities';
import type { GitLabIssueDTO, GitLabCommentDTO } from '../../dtos/gitlab/gitlab-issue.dto';
import { GitLabIssueMapper } from '../../mappers/gitlab-issue.mapper';

export class GitLabIssueAdapter implements IssuePort {
  constructor(private readonly apiClient: ReturnType<typeof import('axios').default.create>) {}

  async getIssues(params: GetIssuesParams): Promise<PaginatedResult<Issue>> {
    const encodedPath = encodeURIComponent(`${params.owner}/${params.name}`);
    const state = params.state === 'all' ? 'all' : params.state === 'open' ? 'opened' : 'closed';

    const response = await this.apiClient.get<ReadonlyArray<GitLabIssueDTO>>(
      `/projects/${encodedPath}/issues`,
      {
        params: {
          state,
          page: params.page,
          per_page: params.perPage,
        },
      }
    );

    const totalCountHeader = response.headers['x-total'];
    const totalCount = totalCountHeader ? parseInt(totalCountHeader, 10) : response.data.length;

    return {
      items: response.data.map(GitLabIssueMapper.toDomain),
      pagination: {
        page: params.page,
        perPage: params.perPage,
        totalCount,
      },
    };
  }

  async getComments(params: GetCommentsParams): Promise<PaginatedResult<Comment>> {
    const encodedPath = encodeURIComponent(`${params.owner}/${params.name}`);

    const response = await this.apiClient.get<ReadonlyArray<GitLabCommentDTO>>(
      `/projects/${encodedPath}/issues/${params.issueNumber}/notes`,
      {
        params: {
          page: params.page,
          per_page: params.perPage,
        },
      }
    );

    return {
      items: response.data.map(GitLabIssueMapper.commentToDomain),
      pagination: {
        page: params.page,
        perPage: params.perPage,
        totalCount: response.data.length,
      },
    };
  }
}
```

- [ ] **Step 4: Create GitLab auth adapter**

```typescript
// src/infrastructure/providers/gitlab/gitlab-auth.adapter.ts
import type { AuthPort } from '../../../domain/ports';
import type { User } from '../../../domain/entities';
import type { StoragePort } from '../../../domain/ports';

const AUTH_TOKEN_KEY = 'auth_token';
const USER_KEY = 'current_user';

export class GitLabAuthAdapter implements AuthPort {
  constructor(private readonly storagePort: StoragePort) {}

  async login(): Promise<User> {
    throw new Error('OAuth flow not implemented yet');
  }

  async logout(): Promise<void> {
    await this.storagePort.removeItem(AUTH_TOKEN_KEY);
    await this.storagePort.removeItem(USER_KEY);
  }

  async getToken(): Promise<string | null> {
    return this.storagePort.getItem(AUTH_TOKEN_KEY);
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  }

  async getCurrentUser(): Promise<User | null> {
    const userJson = await this.storagePort.getItem(USER_KEY);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson) as User;
    } catch {
      return null;
    }
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add src/infrastructure/providers/gitlab/
git commit -m "feat: add GitLab provider adapters (repository, issue, auth)"
```

---

### Task 23: Create provider factory and Zustand stores

**Files:**
- Create: `src/infrastructure/providers/provider-factory.ts`
- Create: `src/infrastructure/hooks/use-provider.ts`
- Create: `src/infrastructure/hooks/use-auth.ts`
- Create: `src/infrastructure/hooks/use-current-user.ts`

- [ ] **Step 1: Create ProviderFactory**

```typescript
// src/infrastructure/providers/provider-factory.ts
import type { ProviderType } from '../../domain/value-objects';
import type { RepositoryPort, IssuePort, AuthPort } from '../../domain/ports';
import type { StoragePort } from '../../domain/ports';
import { GitHubApiService } from './github/github-api.service';
import { GitHubRepositoryAdapter } from './github/github-repository.adapter';
import { GitHubIssueAdapter } from './github/github-issue.adapter';
import { GitHubAuthAdapter } from './github/github-auth.adapter';
import { GitLabApiService } from './gitlab/gitlab-api.service';
import { GitLabRepositoryAdapter } from './gitlab/gitlab-repository.adapter';
import { GitLabIssueAdapter } from './gitlab/gitlab-issue.adapter';
import { GitLabAuthAdapter } from './gitlab/gitlab-auth.adapter';

export interface ProviderInstances {
  readonly repository: RepositoryPort;
  readonly issue: IssuePort;
  readonly auth: AuthPort;
}

export class ProviderFactory {
  static create(providerType: ProviderType, storagePort: StoragePort): ProviderInstances {
    switch (providerType) {
      case 'github': {
        const apiService = GitHubApiService.getInstance(storagePort);
        return {
          repository: new GitHubRepositoryAdapter(apiService.getClient()),
          issue: new GitHubIssueAdapter(apiService.getClient()),
          auth: new GitHubAuthAdapter(storagePort),
        };
      }
      case 'gitlab': {
        const apiService = GitLabApiService.getInstance(storagePort);
        return {
          repository: new GitLabRepositoryAdapter(apiService.getClient()),
          issue: new GitLabIssueAdapter(apiService.getClient()),
          auth: new GitLabAuthAdapter(storagePort),
        };
      }
    }
  }
}
```

- [ ] **Step 2: Create provider store**

```typescript
// src/infrastructure/hooks/use-provider.ts
import { create } from 'zustand';
import type { ProviderType } from '../../domain/value-objects';

interface ProviderState {
  readonly activeProvider: ProviderType;
  readonly setProvider: (provider: ProviderType) => void;
}

export const useProviderStore = create<ProviderState>((set) => ({
  activeProvider: 'github',
  setProvider: (provider) => set({ activeProvider: provider }),
}));
```

- [ ] **Step 3: Create auth store**

```typescript
// src/infrastructure/hooks/use-auth.ts
import { create } from 'zustand';
import type { User } from '../../domain/entities';

interface AuthState {
  readonly user: User | null;
  readonly isAuthenticated: boolean;
  readonly setUser: (user: User | null) => void;
  readonly setAuthenticated: (value: boolean) => void;
  readonly logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: user !== null }),
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
```

- [ ] **Step 4: Create barrel export**

```typescript
// src/infrastructure/hooks/index.ts
export { useProviderStore } from './use-provider';
export { useAuthStore } from './use-auth';
```

- [ ] **Step 5: Commit**

```bash
git add src/infrastructure/providers/provider-factory.ts src/infrastructure/hooks/
git commit -m "feat: add ProviderFactory and Zustand stores (provider, auth)"
```

---

### Task 24: Create React Query hooks

**Files:**
- Create: `src/infrastructure/react-query/query-keys.ts`
- Create: `src/infrastructure/react-query/queries/use-search-repositories.ts`
- Create: `src/infrastructure/react-query/queries/use-repository-details.ts`
- Create: `src/infrastructure/react-query/queries/use-repository-readme.ts`
- Create: `src/infrastructure/react-query/queries/use-issues.ts`
- Create: `src/infrastructure/react-query/queries/use-issue-comments.ts`
- Create: `src/infrastructure/react-query/mutations/use-oauth-login.ts`

- [ ] **Step 1: Create query keys factory**

```typescript
// src/infrastructure/react-query/query-keys.ts
export const queryKeys = {
  repositories: {
    all: ['repositories'] as const,
    search: (query: string) => ['repositories', 'search', query] as const,
    details: (owner: string, name: string) => ['repositories', 'details', owner, name] as const,
    readme: (owner: string, name: string) => ['repositories', 'readme', owner, name] as const,
  },
  issues: {
    all: (owner: string, name: string) => ['issues', owner, name] as const,
    list: (owner: string, name: string, state: string) =>
      ['issues', owner, name, state] as const,
    comments: (owner: string, name: string, issueNumber: number) =>
      ['issues', owner, name, issueNumber, 'comments'] as const,
  },
  auth: {
    status: ['auth', 'status'] as const,
    user: ['auth', 'user'] as const,
  },
} as const;
```

- [ ] **Step 2: Create useSearchRepositories hook**

```typescript
// src/infrastructure/react-query/queries/use-search-repositories.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import type { RepositoryPort } from '../../../domain/ports';
import { queryKeys } from '../query-keys';

const PER_PAGE = 20;

interface UseSearchRepositoriesParams {
  query: string;
  enabled?: boolean;
}

export function useSearchRepositories(
  repositoryPort: RepositoryPort,
  { query, enabled = true }: UseSearchRepositoriesParams
) {
  return useInfiniteQuery({
    queryKey: queryKeys.repositories.search(query),
    queryFn: ({ pageParam = 1 }) =>
      repositoryPort.search({
        query,
        page: pageParam,
        perPage: PER_PAGE,
      }),
    getNextPageParam: (lastPage) => {
      const { page, perPage, totalCount } = lastPage.pagination;
      const totalPages = Math.ceil(totalCount / perPage);
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: enabled && query.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}
```

- [ ] **Step 3: Create useRepositoryDetails hook**

```typescript
// src/infrastructure/react-query/queries/use-repository-details.ts
import { useQuery } from '@tanstack/react-query';
import type { RepositoryPort } from '../../../domain/ports';
import { queryKeys } from '../query-keys';

interface UseRepositoryDetailsParams {
  owner: string;
  name: string;
}

export function useRepositoryDetails(
  repositoryPort: RepositoryPort,
  { owner, name }: UseRepositoryDetailsParams
) {
  return useQuery({
    queryKey: queryKeys.repositories.details(owner, name),
    queryFn: () => repositoryPort.getById(owner, name),
    staleTime: 5 * 60 * 1000,
  });
}
```

- [ ] **Step 4: Create useRepositoryReadme hook**

```typescript
// src/infrastructure/react-query/queries/use-repository-readme.ts
import { useQuery } from '@tanstack/react-query';
import type { RepositoryPort } from '../../../domain/ports';
import { queryKeys } from '../query-keys';

interface UseRepositoryReadmeParams {
  owner: string;
  name: string;
}

export function useRepositoryReadme(
  repositoryPort: RepositoryPort,
  { owner, name }: UseRepositoryReadmeParams
) {
  return useQuery({
    queryKey: queryKeys.repositories.readme(owner, name),
    queryFn: () => repositoryPort.getReadme(owner, name),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}
```

- [ ] **Step 5: Create useIssues hook**

```typescript
// src/infrastructure/react-query/queries/use-issues.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import type { IssuePort } from '../../../domain/ports';
import type { IssueState } from '../../../domain/value-objects';
import { queryKeys } from '../query-keys';

const PER_PAGE = 20;

interface UseIssuesParams {
  owner: string;
  name: string;
  state: IssueState | 'all';
}

export function useIssues(issuePort: IssuePort, { owner, name, state }: UseIssuesParams) {
  return useInfiniteQuery({
    queryKey: queryKeys.issues.list(owner, name, state),
    queryFn: ({ pageParam = 1 }) =>
      issuePort.getIssues({
        owner,
        name,
        state,
        page: pageParam,
        perPage: PER_PAGE,
      }),
    getNextPageParam: (lastPage) => {
      const { page, perPage, totalCount } = lastPage.pagination;
      const totalPages = Math.ceil(totalCount / perPage);
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
```

- [ ] **Step 6: Create useIssueComments hook**

```typescript
// src/infrastructure/react-query/queries/use-issue-comments.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import type { IssuePort } from '../../../domain/ports';
import { queryKeys } from '../query-keys';

const PER_PAGE = 20;

interface UseIssueCommentsParams {
  owner: string;
  name: string;
  issueNumber: number;
}

export function useIssueComments(
  issuePort: IssuePort,
  { owner, name, issueNumber }: UseIssueCommentsParams
) {
  return useInfiniteQuery({
    queryKey: queryKeys.issues.comments(owner, name, issueNumber),
    queryFn: ({ pageParam = 1 }) =>
      issuePort.getComments({
        owner,
        name,
        issueNumber,
        page: pageParam,
        perPage: PER_PAGE,
      }),
    getNextPageParam: (lastPage) => {
      const { page, perPage, totalCount } = lastPage.pagination;
      const totalPages = Math.ceil(totalCount / perPage);
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000,
  });
}
```

- [ ] **Step 7: Create barrel export**

```typescript
// src/infrastructure/react-query/queries/index.ts
export { useSearchRepositories } from './use-search-repositories';
export { useRepositoryDetails } from './use-repository-details';
export { useRepositoryReadme } from './use-repository-readme';
export { useIssues } from './use-issues';
export { useIssueComments } from './use-issue-comments';
```

```typescript
// src/infrastructure/react-query/index.ts
export { queryKeys } from './query-keys';
export * from './queries';
```

- [ ] **Step 8: Commit**

```bash
git add src/infrastructure/react-query/
git commit -m "feat: add React Query hooks (search, details, issues, comments)"
```

---

## Phase 6: Presentation Layer

### Task 25: Create navigation structure

**Files:**
- Create: `src/presentation/navigation/types.ts`
- Create: `src/presentation/navigation/root-navigator.tsx`
- Create: `src/presentation/navigation/auth-stack.tsx`
- Create: `src/presentation/navigation/main-stack.tsx`
- Create: `src/presentation/navigation/tab-navigator.tsx`

- [ ] **Step 1: Create navigation types**

```typescript
// src/presentation/navigation/types.ts
import type { NavigatorScreenParams } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type AuthStackParamList = {
  Login: undefined;
};

export type MainStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  RepositoryDetails: { owner: string; name: string };
  Issues: { owner: string; name: string };
};

export type TabParamList = {
  SourceSelector: undefined;
  RepositorySearch: undefined;
  DesignSystem: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
};

// Screen props types
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = CompositeScreenProps<
  StackScreenProps<AuthStackParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

export type MainStackScreenProps<T extends keyof MainStackParamList> = CompositeScreenProps<
  StackScreenProps<MainStackParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  MainStackScreenProps<keyof MainStackParamList>
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
```

- [ ] **Step 2: Create AuthStack**

```typescript
// src/presentation/navigation/auth-stack.tsx
import { createStackNavigator } from '@react-navigation/stack';
import type { AuthStackParamList } from './types';
import { LoginScreen } from '../screens/login/login.screen';

const Stack = createStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}
```

- [ ] **Step 3: Create TabNavigator**

```typescript
// src/presentation/navigation/tab-navigator.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { TabParamList } from './types';
import { SourceSelectorScreen } from '../screens/source-selector/source-selector.screen';
import { RepositorySearchScreen } from '../screens/repository-search/repository-search.screen';
import { DesignSystemScreen } from '../screens/design-system/design-system.screen';

const Tab = createBottomTabNavigator<TabParamList>();

export function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="SourceSelector" component={SourceSelectorScreen} options={{ title: 'Sources' }} />
      <Tab.Screen name="RepositorySearch" component={RepositorySearchScreen} options={{ title: 'Search' }} />
      <Tab.Screen name="DesignSystem" component={DesignSystemScreen} options={{ title: 'Design System' }} />
    </Tab.Navigator>
  );
}
```

- [ ] **Step 4: Create MainStack**

```typescript
// src/presentation/navigation/main-stack.tsx
import { createStackNavigator } from '@react-navigation/stack';
import type { MainStackParamList } from './types';
import { TabNavigator } from './tab-navigator';
import { RepositoryDetailsScreen } from '../screens/repository-details/repository-details.screen';
import { IssuesScreen } from '../screens/issues/issues.screen';

const Stack = createStackNavigator<MainStackParamList>();

export function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="RepositoryDetails" component={RepositoryDetailsScreen} options={{ title: 'Repository' }} />
      <Stack.Screen name="Issues" component={IssuesScreen} options={{ title: 'Issues' }} />
    </Stack.Navigator>
  );
}
```

- [ ] **Step 5: Create RootNavigator**

```typescript
// src/presentation/navigation/root-navigator.tsx
import { createStackNavigator } from '@react-navigation/stack';
import type { RootStackParamList } from './types';
import { AuthStack } from './auth-stack';
import { MainStack } from './main-stack';
import { useAuthStore } from '../../infrastructure/hooks';

const Stack = createStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainStack} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/presentation/navigation/
git commit -m "feat: add React Navigation structure (root, auth, main, tabs)"
```

---

### Task 26: Create screens

**Files:**
- Create: `src/presentation/screens/source-selector/source-selector.screen.tsx`
- Create: `src/presentation/screens/repository-search/repository-search.screen.tsx`
- Create: `src/presentation/screens/repository-details/repository-details.screen.tsx`
- Create: `src/presentation/screens/issues/issues.screen.tsx`
- Create: `src/presentation/screens/design-system/design-system.screen.tsx`
- Create: `src/presentation/screens/login/login.screen.tsx`

- [ ] **Step 1: Create SourceSelector screen**

```typescript
// src/presentation/screens/source-selector/source-selector.screen.tsx
import { View } from 'react-native';
import { useProviderStore } from '../../../infrastructure/hooks';
import { Card, Text, Button, Avatar, Badge } from '../../components';
import type { ProviderType } from '../../../domain/value-objects';
import type { TabScreenProps } from '../../navigation/types';

type Props = TabScreenProps<'SourceSelector'>;

const providers: ReadonlyArray<{ type: ProviderType; name: string; icon: string }> = [
  { type: 'github', name: 'GitHub', icon: '🐙' },
  { type: 'gitlab', name: 'GitLab', icon: '🦊' },
];

export function SourceSelectorScreen({ navigation }: Props) {
  const { activeProvider, setProvider } = useProviderStore();

  const handleSelectProvider = (provider: ProviderType) => {
    setProvider(provider);
  };

  return (
    <View className="flex-1 bg-background p-lg gap-lg">
      <Text variant="heading">Select Provider</Text>
      <Text variant="body" color="secondary">
        Choose your code hosting platform
      </Text>

      <View className="gap-md">
        {providers.map((provider) => (
          <Card key={provider.type}>
            <Button
              variant={activeProvider === provider.type ? 'primary' : 'secondary'}
              onPress={() => handleSelectProvider(provider.type)}
              className="flex-row items-center gap-md"
            >
              <Text className="text-2xl">{provider.icon}</Text>
              <View className="flex-1">
                <Text variant="subheading">{provider.name}</Text>
              </View>
              {activeProvider === provider.type && <Badge label="Active" variant="success" />}
            </Button>
          </Card>
        ))}
      </View>

      <Button
        variant="ghost"
        onPress={() => navigation.navigate('RepositorySearch')}
        className="mt-auto"
      >
        Continue to Search →
      </Button>
    </View>
  );
}
```

- [ ] **Step 2: Create RepositorySearch screen**

```typescript
// src/presentation/screens/repository-search/repository-search.screen.tsx
import { View, FlatList, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { useProviderStore } from '../../../infrastructure/hooks';
import { ProviderFactory } from '../../../infrastructure/providers/provider-factory';
import { ExpoSecureStoreAdapter } from '../../../infrastructure/storage/expo-secure-store.adapter';
import { useSearchRepositories } from '../../../infrastructure/react-query';
import { Text, Input, Card, Avatar, Badge, Spinner, EmptyState, ErrorState } from '../../components';
import type { Repository } from '../../../domain/entities';
import type { TabScreenProps } from '../../navigation/types';

type Props = TabScreenProps<'RepositorySearch'>;

const storage = ExpoSecureStoreAdapter.getInstance();

export function RepositorySearchScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const activeProvider = useProviderStore((state) => state.activeProvider);

  const providers = ProviderFactory.create(activeProvider, storage);
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useSearchRepositories(providers.repository, { query });

  const repositories = data?.pages.flatMap((page) => page.items) ?? [];

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: Repository }) => (
      <Card className="mb-md">
        <Text variant="subheading">{item.name}</Text>
        <Text variant="body" color="secondary" numberOfLines={2}>
          {item.description ?? 'No description'}
        </Text>
        <View className="flex-row gap-md mt-sm">
          <Badge label={`⭐ ${item.stars}`} />
          <Badge label={`🍴 ${item.forks}`} />
          {item.language && <Badge label={item.language} variant="default" />}
        </View>
      </Card>
    ),
    []
  );

  if (isError) {
    return <ErrorState message={(error as Error).message} onRetry={refetch} />;
  }

  return (
    <View className="flex-1 bg-background">
      <View className="p-lg">
        <Input
          placeholder="Search repositories..."
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {isLoading ? (
        <Spinner size="lg" className="mt-xxl" />
      ) : repositories.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No repositories found"
          description="Try searching for something else"
        />
      ) : (
        <FlatList
          data={repositories}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerClassName="p-lg"
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingNextPage ? <Spinner className="py-md" /> : null}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
        />
      )}
    </View>
  );
}
```

- [ ] **Step 3: Create RepositoryDetails screen**

```typescript
// src/presentation/screens/repository-details/repository-details.screen.tsx
import { View, ScrollView } from 'react-native';
import { useProviderStore } from '../../../infrastructure/hooks';
import { ProviderFactory } from '../../../infrastructure/providers/provider-factory';
import { ExpoSecureStoreAdapter } from '../../../infrastructure/storage/expo-secure-store.adapter';
import { useRepositoryDetails, useRepositoryReadme } from '../../../infrastructure/react-query';
import { Text, Card, Badge, Spinner, ErrorState, Button } from '../../components';
import type { MainStackScreenProps } from '../../navigation/types';

type Props = MainStackScreenProps<'RepositoryDetails'>;

const storage = ExpoSecureStoreAdapter.getInstance();

export function RepositoryDetailsScreen({ route, navigation }: Props) {
  const { owner, name } = route.params;
  const activeProvider = useProviderStore((state) => state.activeProvider);

  const providers = ProviderFactory.create(activeProvider, storage);
  const { data: repository, isLoading, isError, error, refetch } =
    useRepositoryDetails(providers.repository, { owner, name });
  const { data: readme } = useRepositoryReadme(providers.repository, { owner, name });

  if (isLoading) {
    return <Spinner size="lg" className="flex-1 justify-center" />;
  }

  if (isError || !repository) {
    return <ErrorState message={(error as Error)?.message ?? 'Repository not found'} onRetry={refetch} />;
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-lg gap-lg">
        <View>
          <Text variant="heading">{repository.name}</Text>
          <Text variant="body" color="secondary">
            {repository.fullName}
          </Text>
        </View>

        {repository.description && (
          <Text variant="body">{repository.description}</Text>
        )}

        <View className="flex-row gap-md">
          <Badge label={`⭐ ${repository.stars}`} />
          <Badge label={`🍴 ${repository.forks}`} />
          {repository.language && <Badge label={repository.language} />}
        </View>

        <Card>
          <Text variant="label">Owner</Text>
          <View className="flex-row items-center gap-sm mt-xs">
            <Avatar uri={repository.owner.avatarUrl} name={repository.owner.login} size="sm" />
            <Text variant="body">{repository.owner.login}</Text>
          </View>
        </Card>

        <Button
          variant="secondary"
          onPress={() => navigation.navigate('Issues', { owner, name })}
        >
          View Issues →
        </Button>

        {readme && (
          <Card>
            <Text variant="label" className="mb-sm">README</Text>
            <Text variant="body">{readme}</Text>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}
```

- [ ] **Step 4: Create Issues screen**

```typescript
// src/presentation/screens/issues/issues.screen.tsx
import { View, FlatList, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { useProviderStore } from '../../../infrastructure/hooks';
import { ProviderFactory } from '../../../infrastructure/providers/provider-factory';
import { ExpoSecureStoreAdapter } from '../../../infrastructure/storage/expo-secure-store.adapter';
import { useIssues } from '../../../infrastructure/react-query';
import { Text, Card, Badge, Button, Spinner, EmptyState, ErrorState } from '../../components';
import type { Issue } from '../../../domain/entities';
import type { IssueState } from '../../../domain/value-objects';
import type { MainStackScreenProps } from '../../navigation/types';

type Props = MainStackScreenProps<'Issues'>;

const storage = ExpoSecureStoreAdapter.getInstance();

export function IssuesScreen({ route }: Props) {
  const { owner, name } = route.params;
  const [filter, setFilter] = useState<IssueState | 'all'>('all');
  const activeProvider = useProviderStore((state) => state.activeProvider);

  const providers = ProviderFactory.create(activeProvider, storage);
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useIssues(providers.issue, { owner, name, state: filter });

  const issues = data?.pages.flatMap((page) => page.items) ?? [];

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: Issue }) => (
      <Card className="mb-md">
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text variant="subheading" numberOfLines={1}>
              #{item.number} {item.title}
            </Text>
            <Text variant="body" color="secondary" numberOfLines={2} className="mt-xs">
              {item.body}
            </Text>
          </View>
          <Badge
            label={item.state}
            variant={item.state === 'open' ? 'success' : 'error'}
          />
        </View>
        <View className="flex-row gap-md mt-sm">
          <Badge label={`💬 ${item.commentsCount}`} />
          <Text variant="caption" color="tertiary">
            by {item.author.login}
          </Text>
        </View>
      </Card>
    ),
    []
  );

  if (isError) {
    return <ErrorState message={(error as Error).message} onRetry={refetch} />;
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row p-lg gap-sm">
        {(['all', 'open', 'closed'] as const).map((state) => (
          <Button
            key={state}
            variant={filter === state ? 'primary' : 'secondary'}
            size="sm"
            onPress={() => setFilter(state)}
          >
            {state.charAt(0).toUpperCase() + state.slice(1)}
          </Button>
        ))}
      </View>

      {isLoading ? (
        <Spinner size="lg" className="mt-xxl" />
      ) : issues.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No issues found"
          description="This repository has no issues"
        />
      ) : (
        <FlatList
          data={issues}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerClassName="p-lg"
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingNextPage ? <Spinner className="py-md" /> : null}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
        />
      )}
    </View>
  );
}
```

- [ ] **Step 5: Create DesignSystem screen**

```typescript
// src/presentation/screens/design-system/design-system.screen.tsx
import { ScrollView, View } from 'react-native';
import {
  Button,
  Input,
  Text,
  Card,
  Avatar,
  Badge,
  Spinner,
  Skeleton,
  EmptyState,
  ErrorState,
  Divider,
  Surface,
} from '../../components';

export function DesignSystemScreen() {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-lg gap-xl">
        {/* Typography */}
        <View className="gap-sm">
          <Text variant="heading">Typography</Text>
          <Divider />
          <Text variant="heading">Heading</Text>
          <Text variant="subheading">Subheading</Text>
          <Text variant="body">Body text</Text>
          <Text variant="caption">Caption</Text>
          <Text variant="label">Label</Text>
        </View>

        {/* Colors */}
        <View className="gap-sm">
          <Text variant="heading">Colors</Text>
          <Divider />
          <Text color="primary">Primary text</Text>
          <Text color="secondary">Secondary text</Text>
          <Text color="tertiary">Tertiary text</Text>
          <Text color="error">Error text</Text>
          <Text color="success">Success text</Text>
        </View>

        {/* Buttons */}
        <View className="gap-sm">
          <Text variant="heading">Buttons</Text>
          <Divider />
          <Button onPress={() => {}}>Primary</Button>
          <Button variant="secondary" onPress={() => {}}>Secondary</Button>
          <Button variant="ghost" onPress={() => {}}>Ghost</Button>
          <Button disabled onPress={() => {}}>Disabled</Button>
        </View>

        {/* Input */}
        <View className="gap-sm">
          <Text variant="heading">Input</Text>
          <Divider />
          <Input placeholder="Search..." onChangeText={() => {}} />
          <Input label="With Label" placeholder="Enter value" onChangeText={() => {}} />
          <Input error="This is an error" placeholder="Error state" onChangeText={() => {}} />
        </View>

        {/* Card */}
        <View className="gap-sm">
          <Text variant="heading">Card</Text>
          <Divider />
          <Card>
            <Text variant="body">Card content goes here</Text>
          </Card>
        </View>

        {/* Avatar */}
        <View className="gap-sm">
          <Text variant="heading">Avatar</Text>
          <Divider />
          <View className="flex-row gap-md">
            <Avatar name="John Doe" size="sm" />
            <Avatar name="John Doe" size="md" />
            <Avatar name="John Doe" size="lg" />
            <Avatar name="John Doe" size="xl" />
          </View>
        </View>

        {/* Badge */}
        <View className="gap-sm">
          <Text variant="heading">Badge</Text>
          <Divider />
          <View className="flex-row gap-sm flex-wrap">
            <Badge label="Default" />
            <Badge label="Success" variant="success" />
            <Badge label="Error" variant="error" />
            <Badge label="Warning" variant="warning" />
          </View>
        </View>

        {/* Loading */}
        <View className="gap-sm">
          <Text variant="heading">Loading States</Text>
          <Divider />
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </View>

        {/* Skeleton */}
        <View className="gap-sm">
          <Text variant="heading">Skeleton</Text>
          <Divider />
          <Skeleton height={20} />
          <Skeleton height={20} width="80%" />
          <Skeleton height={20} width="60%" />
        </View>

        {/* Empty State */}
        <View className="gap-sm">
          <Text variant="heading">Empty State</Text>
          <Divider />
          <EmptyState
            icon="📭"
            title="No data"
            description="There's nothing to show here"
          />
        </View>

        {/* Error State */}
        <View className="gap-sm">
          <Text variant="heading">Error State</Text>
          <Divider />
          <ErrorState
            message="Something went wrong while loading data"
            onRetry={() => {}}
          />
        </View>

        {/* Surface */}
        <View className="gap-sm">
          <Text variant="heading">Surface</Text>
          <Divider />
          <Surface className="p-lg">
            <Text variant="body">Surface content</Text>
          </Surface>
        </View>
      </View>
    </ScrollView>
  );
}
```

- [ ] **Step 6: Create Login screen placeholder**

```typescript
// src/presentation/screens/login/login.screen.tsx
import { View } from 'react-native';
import { Text, Button } from '../../components';
import { useAuthStore } from '../../../infrastructure/hooks';

export function LoginScreen() {
  const setUser = useAuthStore((state) => state.setUser);

  const handleLogin = () => {
    // OAuth flow would be implemented here
    setUser({ login: 'demo', avatarUrl: '' });
  };

  return (
    <View className="flex-1 bg-background items-center justify-center p-xxl gap-xl">
      <Text variant="heading">Code Atlas</Text>
      <Text variant="body" color="secondary" className="text-center">
        Browse repositories from GitHub and GitLab
      </Text>
      <Button onPress={handleLogin}>Sign in with GitHub</Button>
      <Button variant="secondary" onPress={handleLogin}>
        Sign in with GitLab
      </Button>
    </View>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add src/presentation/screens/
git commit -m "feat: implement all screens (SourceSelector, Search, Details, Issues, DesignSystem)"
```

---

### Task 27: Create Composition Root and wire App.tsx

**Files:**
- Create: `src/presentation/providers/composition-root.tsx`
- Create: `src/presentation/providers/query-client.provider.tsx`
- Create: `src/presentation/providers/theme.provider.tsx`
- Modify: `App.tsx`

- [ ] **Step 1: Create QueryClient provider**

```typescript
// src/presentation/providers/query-client.provider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRef } from 'react';

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const queryClientRef = useRef(
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: 3,
          staleTime: 5 * 60 * 1000,
          gcTime: 30 * 60 * 1000,
        },
      },
    })
  );

  return (
    <QueryClientProvider client={queryClientRef.current}>
      {children}
    </QueryClientProvider>
  );
}
```

- [ ] **Step 2: Create Theme provider**

```typescript
// src/presentation/providers/theme.provider.tsx
import { useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <NavigationThemeProvider theme={theme}>
      {children}
    </NavigationThemeProvider>
  );
}
```

- [ ] **Step 3: Create Composition Root**

```typescript
// src/presentation/providers/composition-root.tsx
import { QueryProvider } from './query-client.provider';
import { ThemeProvider } from './theme.provider';
import { RootNavigator } from '../navigation/root-navigator';

interface CompositionRootProps {}

export function CompositionRoot({}: CompositionRootProps) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </QueryProvider>
  );
}
```

- [ ] **Step 4: Update App.tsx**

```typescript
// App.tsx
import './global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-gesture-handler';
import { CompositionRoot } from './src/presentation/providers/composition-root';

export default function App() {
  return (
    <SafeAreaProvider>
      <CompositionRoot />
    </SafeAreaProvider>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/presentation/providers/ App.tsx
git commit -m "feat: add Composition Root and wire providers"
```

---

## Phase 7: Testing

### Task 28: Add domain use case tests

**Files:**
- Create: `src/domain/use-cases/repositories/search-repositories.use-case.spec.ts`
- Create: `src/domain/use-cases/issues/get-issues.use-case.spec.ts`
- Create: `src/domain/use-cases/auth/login.use-case.spec.ts`

- [ ] **Step 1: Write SearchRepositoriesUseCase test**

```typescript
// src/domain/use-cases/repositories/search-repositories.use-case.spec.ts
import { SearchRepositoriesUseCase } from './search-repositories.use-case';
import type { RepositoryPort } from '../../ports';
import type { PaginatedResult, SearchParams } from '../../value-objects';
import type { Repository } from '../../entities';

describe('SearchRepositoriesUseCase', () => {
  let useCase: SearchRepositoriesUseCase;
  let mockRepositoryPort: jest.Mocked<RepositoryPort>;

  beforeEach(() => {
    mockRepositoryPort = {
      search: jest.fn(),
      getById: jest.fn(),
      getReadme: jest.fn(),
    };
    useCase = new SearchRepositoriesUseCase(mockRepositoryPort);
  });

  it('should return paginated results', async () => {
    const mockResult: PaginatedResult<Repository> = {
      items: [
        {
          id: '1' as RepositoryId,
          name: 'react',
          fullName: 'facebook/react',
          description: 'A JavaScript library',
          stars: 100000,
          forks: 20000,
          language: 'JavaScript',
          owner: { login: 'facebook', avatarUrl: '', type: 'Organization' },
          updatedAt: new Date(),
          isFavorite: false,
        },
      ],
      pagination: { page: 1, perPage: 20, totalCount: 1 },
    };

    mockRepositoryPort.search.mockResolvedValue(mockResult);

    const result = await useCase.execute({ query: 'react', page: 1, perPage: 20 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe('react');
    expect(mockRepositoryPort.search).toHaveBeenCalledWith({ query: 'react', page: 1, perPage: 20 });
  });

  it('should return empty results for no matches', async () => {
    const mockResult: PaginatedResult<Repository> = {
      items: [],
      pagination: { page: 1, perPage: 20, totalCount: 0 },
    };

    mockRepositoryPort.search.mockResolvedValue(mockResult);

    const result = await useCase.execute({ query: 'nonexistent', page: 1, perPage: 20 });

    expect(result.items).toHaveLength(0);
    expect(result.pagination.totalCount).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npx jest src/domain/use-cases/repositories/search-repositories.use-case.spec.ts --no-coverage
```

Expected: PASS

- [ ] **Step 3: Write GetIssuesUseCase test**

```typescript
// src/domain/use-cases/issues/get-issues.use-case.spec.ts
import { GetIssuesUseCase } from './get-issues.use-case';
import type { IssuePort } from '../../ports';
import type { PaginatedResult, GetIssuesParams } from '../../value-objects';
import type { Issue } from '../../entities';

describe('GetIssuesUseCase', () => {
  let useCase: GetIssuesUseCase;
  let mockIssuePort: jest.Mocked<IssuePort>;

  beforeEach(() => {
    mockIssuePort = {
      getIssues: jest.fn(),
      getComments: jest.fn(),
    };
    useCase = new GetIssuesUseCase(mockIssuePort);
  });

  it('should return issues', async () => {
    const mockResult: PaginatedResult<Issue> = {
      items: [
        {
          id: '1' as IssueId,
          number: 1,
          title: 'Bug report',
          body: 'Something is broken',
          state: 'open',
          author: { login: 'user', avatarUrl: '', type: 'User' },
          labels: [],
          commentsCount: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      pagination: { page: 1, perPage: 20, totalCount: 1 },
    };

    mockIssuePort.getIssues.mockResolvedValue(mockResult);

    const result = await useCase.execute({
      owner: 'facebook',
      name: 'react',
      state: 'all',
      page: 1,
      perPage: 20,
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe('Bug report');
  });
});
```

- [ ] **Step 4: Run tests**

```bash
npx jest src/domain/use-cases/issues/get-issues.use-case.spec.ts --no-coverage
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/domain/use-cases/
git commit -m "test: add domain use case tests"
```

---

### Task 29: Add mapper tests

**Files:**
- Create: `src/infrastructure/mappers/github-repository.mapper.spec.ts`
- Create: `src/infrastructure/mappers/gitlab-repository.mapper.spec.ts`

- [ ] **Step 1: Write GitHub mapper test**

```typescript
// src/infrastructure/mappers/github-repository.mapper.spec.ts
import { GitHubRepositoryMapper } from './github-repository.mapper';
import type { GitHubRepositoryDTO } from '../dtos/github/github-repository.dto';

describe('GitHubRepositoryMapper', () => {
  it('should map GitHub DTO to domain entity', () => {
    const dto: GitHubRepositoryDTO = {
      id: 123,
      name: 'react',
      full_name: 'facebook/react',
      description: 'A JavaScript library for building user interfaces',
      stargazers_count: 100000,
      forks_count: 20000,
      language: 'JavaScript',
      owner: {
        login: 'facebook',
        avatar_url: 'https://example.com/avatar.png',
        type: 'Organization',
      },
      updated_at: '2026-01-01T00:00:00Z',
    };

    const result = GitHubRepositoryMapper.toDomain(dto);

    expect(result.id).toBe('123');
    expect(result.name).toBe('react');
    expect(result.fullName).toBe('facebook/react');
    expect(result.stars).toBe(100000);
    expect(result.forks).toBe(20000);
    expect(result.language).toBe('JavaScript');
    expect(result.owner.login).toBe('facebook');
    expect(result.owner.type).toBe('Organization');
    expect(result.updatedAt).toBeInstanceOf(Date);
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npx jest src/infrastructure/mappers/github-repository.mapper.spec.ts --no-coverage
```

Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/infrastructure/mappers/
git commit -m "test: add mapper tests"
```

---

### Task 30: Add component tests

**Files:**
- Create: `src/presentation/components/button/button.test.tsx`
- Create: `src/presentation/components/text/text.test.tsx`
- Create: `src/presentation/components/card/card.test.tsx`

- [ ] **Step 1: Write Button test**

```typescript
// src/presentation/components/button/button.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from './button';

describe('Button', () => {
  it('renders with label', () => {
    const { getByText } = render(<Button onPress={() => {}}>Press me</Button>);
    expect(getByText('Press me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button onPress={onPress}>Press me</Button>);
    fireEvent.press(getByText('Press me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button disabled onPress={onPress}>Disabled</Button>
    );
    fireEvent.press(getByText('Disabled'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npx jest src/presentation/components/button/button.test.tsx --no-coverage
```

Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/presentation/components/
git commit -m "test: add component tests"
```

---

## Phase 8: Dev Tooling

### Task 31: Configure ESLint, Prettier, Husky, Commitlint

**Files:**
- Modify: `eslint.config.js`
- Modify: `prettier.config.js`
- Create: `.husky/pre-commit`
- Create: `.husky/commit-msg`
- Create: `commitlint.config.js`

- [ ] **Step 1: Update ESLint config**

```javascript
// eslint.config.js
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    rules: {
      'react/display-name': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
]);
```

- [ ] **Step 2: Update Prettier config**

```javascript
// prettier.config.js
module.exports = {
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  tabWidth: 2,
};
```

- [ ] **Step 3: Create commitlint config**

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', 'fix', 'docs', 'style', 'refactor',
        'perf', 'test', 'build', 'ci', 'chore', 'revert',
      ],
    ],
    'subject-case': [0],
    'body-max-line-length': [0],
  },
};
```

- [ ] **Step 4: Create Husky pre-commit hook**

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

- [ ] **Step 5: Create Husky commit-msg hook**

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx --no -- commitlint --edit "$1"
```

- [ ] **Step 6: Create lint-staged config**

```json
// Add to package.json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

- [ ] **Step 7: Initialize Husky**

```bash
npx husky init
```

- [ ] **Step 8: Make hooks executable**

```bash
chmod +x .husky/pre-commit .husky/commit-msg
```

- [ ] **Step 9: Commit**

```bash
git add .husky/ commitlint.config.js eslint.config.js prettier.config.js package.json
git commit -m "chore: configure ESLint, Prettier, Husky, Commitlint"
```

---

### Task 32: Add README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create comprehensive README**

```markdown
# Code Atlas

A React Native/Expo application for browsing GitHub and GitLab repositories with runtime provider switching.

## Architecture

This project follows **Clean Architecture** with **Hexagonal (Ports & Adapters)** principles.

### Layers

- **Domain** — Pure TypeScript entities, value objects, repository ports, and use cases
- **Application** — Services orchestrating use cases
- **Infrastructure** — Concrete adapters (GitHub/GitLab API, storage, auth)
- **Presentation** — Screens, components, hooks, navigation
- **Composition Root** — Dependency injection wiring

### Key Principles

- Domain layer has ZERO external dependencies (runs in Node.js)
- UI never knows about GitHub/GitLab implementations
- Provider swap happens at a single point (ProviderFactory)
- DTOs never leak to domain layer

## Tech Stack

- Expo SDK 56
- React Native 0.85
- TypeScript 6 (Strict Mode)
- NativeWind (TailwindCSS for React Native)
- React Navigation 7
- React Query (TanStack Query)
- Zustand
- Axios
- Expo SecureStore

## Project Structure

```
src/
├── domain/          # Entities, value objects, ports, use cases
├── application/     # Services
├── infrastructure/  # Adapters, HTTP client, storage, mappers
├── presentation/    # Screens, components, navigation
└── shared/          # Design tokens, theme, types
```

## Provider Switching

The app supports runtime switching between GitHub and GitLab:

1. User selects provider on SourceSelector screen
2. Zustand updates active provider state
3. ProviderFactory creates new adapter instances
4. React Query hooks receive new adapters
5. All queries automatically refetch
6. Zero changes in UI code

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- path/to/test.spec.ts
```

## Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npx tsc --noEmit
```

## Trade-offs

| Decision | Why |
|----------|-----|
| Zustand + React Query split | Zustand for UI state, React Query for server state |
| Factory Pattern for providers | Single swap point, no if/else in UI |
| Branded types for IDs | Type safety prevents ID confusion |
| NativeWind exclusively | Consistent styling, dark mode support |
| Composition Root pattern | Dependencies wired at entry point |

## License

MIT
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add comprehensive README"
```

---

## Summary

**Total Tasks:** 32
**Total Files Created:** ~100+
**Total Commits:** ~30

Each task is self-contained with complete code, exact file paths, and test verification steps.
