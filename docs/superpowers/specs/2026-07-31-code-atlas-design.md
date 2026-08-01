# Code Atlas — Design Specification

**Date:** 2026-07-31
**Status:** Approved
**Author:** Staff Software Engineer

---

## 1. Overview

Code Atlas is a React Native/Expo mobile application for browsing GitHub and GitLab repositories. It supports runtime provider switching, OAuth authentication, and offline-friendly UX patterns.

**Core Requirements:**

- Browse and search repositories from GitHub/GitLab
- View repository details with README rendering
- View issues with pagination
- OAuth authentication with secure token storage
- Runtime provider switching (no UI changes)
- Design System Showcase screen
- Full test coverage (domain, mappers, components)

---

## 2. Architecture

### 2.1 Pattern: Clean Architecture + Hexagonal (Ports & Adapters)

Dependencies flow inward. Outer layers depend on inner layers, never the reverse.

```
┌─────────────────────────────────────────────────┐
│                 PRESENTATION                    │
│  Screens, Components, Hooks, Navigation         │
├─────────────────────────────────────────────────┤
│                 APPLICATION                      │
│  Services, Use Cases, DTOs, Mappers             │
├─────────────────────────────────────────────────┤
│                  DOMAIN                          │
│  Entities, Value Objects, Repository Ports,     │
│  Use Case Interfaces, Provider Ports            │
│  (ZERO external dependencies - pure TS)         │
├─────────────────────────────────────────────────┤
│                INFRASTRUCTURE                   │
│  GitHub/GitLab API Adapters, HTTP Client,       │
│  Secure Storage, Auth, React Query Hooks        │
├─────────────────────────────────────────────────┤
│              COMPOSITION ROOT                   │
│  Dependency injection wiring at app entry       │
└─────────────────────────────────────────────────┘
```

### 2.2 Layer Rules

| Layer            | Can Import          | Cannot Import                         |
| ---------------- | ------------------- | ------------------------------------- |
| Domain           | Nothing (pure TS)   | React, Axios, Expo, React Query       |
| Application      | Domain only         | React, Axios, Expo, React Query       |
| Infrastructure   | Domain, Application | React (except hooks)                  |
| Presentation     | Application, Domain | Axios, Infrastructure implementations |
| Composition Root | Everything          | Nothing (wires dependencies)          |

### 2.3 State Management Split

- **Zustand** → UI state (active provider, theme, auth token)
- **React Query** → Server state (repositories, issues, search, pagination)

---

## 3. Domain Layer

Pure TypeScript entities, repository ports, and use cases.

### 3.1 Entities

```typescript
interface Repository {
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

interface Issue {
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

interface Owner {
  readonly login: string;
  readonly avatarUrl: string;
  readonly type: 'User' | 'Organization';
}

interface Label {
  readonly name: string;
  readonly color: string;
}

interface User {
  readonly login: string;
  readonly avatarUrl: string;
}
```

### 3.2 Value Objects

```typescript
type RepositoryId = string & { readonly __brand: 'RepositoryId' };
type IssueId = string & { readonly __brand: 'IssueId' };
type IssueState = 'open' | 'closed';
type ProviderType = 'github' | 'gitlab';

interface Pagination {
  readonly page: number;
  readonly perPage: number;
  readonly totalCount: number;
}

interface PaginatedResult<T> {
  readonly items: ReadonlyArray<T>;
  readonly pagination: Pagination;
}
```

### 3.3 Repository Ports (Contracts)

```typescript
interface RepositoryPort {
  search(params: SearchParams): Promise<PaginatedResult<Repository>>;
  getById(owner: string, name: string): Promise<Repository>;
  getReadme(owner: string, name: string): Promise<string>;
}

interface IssuePort {
  getIssues(params: GetIssuesParams): Promise<PaginatedResult<Issue>>;
  getComments(params: GetCommentsParams): Promise<PaginatedResult<Comment>>;
}

interface AuthPort {
  login(): Promise<User>;
  logout(): Promise<void>;
  getToken(): Promise<string | null>;
  isAuthenticated(): Promise<boolean>;
}

interface StoragePort {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}
```

### 3.4 Use Cases

- `SearchRepositoriesUseCase` — search with pagination
- `GetRepositoryDetailsUseCase` — single repo details
- `GetRepositoryReadmeUseCase` — README markdown
- `GetIssuesUseCase` — issues with state filter + pagination
- `GetIssueCommentsUseCase` — comments for an issue
- `LoginUseCase` — OAuth flow
- `LogoutUseCase` — clear token
- `CheckAuthStatusUseCase` — verify authentication

### 3.5 Domain Errors

```typescript
class DomainError extends Error {
  constructor(message: string, code: string) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
  }
}

class RepositoryNotFoundError extends DomainError {
  /* ... */
}
class AuthenticationRequiredError extends DomainError {
  /* ... */
}
class ProviderUnavailableError extends DomainError {
  /* ... */
}
```

---

## 4. Infrastructure Layer

### 4.1 Provider Pattern

Each provider (GitHub/GitLab) is an adapter implementing domain ports.

**ProviderFactory** is the single swap point:

```typescript
class ProviderFactory {
  static create(providerType: ProviderType) {
    switch (providerType) {
      case 'github':
        return {
          repository: new GitHubRepositoryAdapter(...),
          issue: new GitHubIssueAdapter(...),
          auth: new GitHubAuthAdapter(...),
        };
      case 'gitlab':
        return {
          repository: new GitLabRepositoryAdapter(...),
          issue: new GitLabIssueAdapter(...),
          auth: new GitLabAuthAdapter(...),
        };
    }
  }
}
```

**Swap Flow:**

1. User selects provider on SourceSelector screen
2. Zustand updates `activeProvider` state
3. ProviderFactory creates new adapter instances
4. React Query hooks receive new adapters via Composition Root
5. All queries automatically refetch with new provider
6. Zero changes in UI code

### 4.2 HTTP Client (Axios)

- Configured base instances per provider
- Interceptors: auth token injection, error normalization, retry logic
- Timeout: 10 seconds
- Retry: 3 attempts with exponential backoff

### 4.3 Mappers

DTOs never leak to domain. Each provider has its own mapper:

```typescript
class GitHubRepositoryMapper {
  static toDomain(dto: GitHubRepositoryDTO): Repository {
    return {
      id: createRepositoryId(String(dto.id)),
      name: dto.name,
      fullName: dto.full_name,
      description: dto.description,
      stars: dto.stargazers_count,
      forks: dto.forks_count,
      language: dto.language,
      owner: GitHubOwnerMapper.toDomain(dto.owner),
      updatedAt: new Date(dto.updated_at),
      isFavorite: false,
    };
  }
}
```

### 4.4 React Query

- **Infinite Queries** for repository search and issues
- **Query Keys** centralized in `query-keys.ts` factory
- **Stale Time:** 5 minutes
- **Cache Time:** 30 minutes
- **Retry:** 3 attempts with exponential backoff
- **Placeholder Data** for instant UI feedback
- **Background Refetch** on window focus
- **Pull-to-Refresh** via `refetch()`

### 4.5 Secure Storage

Expo SecureStore for auth tokens:

- `auth_token` — GitHub/GitLab OAuth token
- `provider_type` — Active provider preference

---

## 5. Presentation Layer

### 5.1 Screens

| Screen            | Description             | Key Features                                       |
| ----------------- | ----------------------- | -------------------------------------------------- |
| SourceSelector    | Choose GitHub/GitLab    | Provider cards, auth status, logout                |
| RepositorySearch  | Search repositories     | Infinite scroll, debounced search, pull-to-refresh |
| RepositoryDetails | View repo details       | Stats, README, language, owner                     |
| Issues            | View issues             | State filter, pagination, comments                 |
| DesignSystem      | Showcase all components | All DS components displayed                        |

### 5.2 UX Patterns

- **Loading:** Skeleton placeholders during data fetch
- **Empty State:** "No repositories found" with icon + message
- **Error State:** Friendly error message + retry button
- **Offline:** Cached data shown, retry prompt when back online
- **Infinite Scroll:** `onEndReached` triggers next page
- **Pull-to-Refresh:** Swipe down to refetch
- **Debounced Search:** 300ms delay on search input

### 5.3 Navigation

```
RootNavigator
├── [Not Authenticated] → AuthStack → Login
└── [Authenticated] → MainStack
    ├── TabNavigator
    │   ├── Tab 1: SourceSelector
    │   ├── Tab 2: RepositorySearch
    │   └── Tab 3: DesignSystem
    └── Stack Screens (pushed)
        ├── RepositoryDetails
        └── Issues
```

---

## 6. Design System

### 6.1 Tokens

- **Colors:** light/dark palette (background, surface, text, primary, error, success, border)
- **Spacing:** 4px base scale (xs=4, sm=8, md=12, lg=16, xl=24, xxl=32)
- **Typography:** font sizes, weights, line heights
- **Radius:** sm=4, md=8, lg=12, full=9999
- **Sizes:** component sizes (sm, md, lg)

### 6.2 Components

All use NativeWind `className`, all accept `testID`, all are typed.

- `Button` — primary, secondary, ghost variants
- `Input` — with label, error state, icon
- `Text` — heading, body, caption, label
- `Card` — surface wrapper
- `Avatar` — image with fallback initials
- `Badge` — status indicator
- `Spinner` — loading indicator
- `Skeleton` — placeholder for loading
- `EmptyState` — icon + title + description + action
- `ErrorState` — error icon + message + retry
- `Divider` — horizontal separator
- `Surface` — themed background wrapper

---

## 7. Testing Strategy

### 7.1 Priority

1. Domain use cases (pure logic)
2. Mappers (pure functions)
3. Adapters (API + parsing)
4. Components (rendering + interaction)
5. Screens (full flow)

### 7.2 Approach

| Layer      | Method      | Mocking               |
| ---------- | ----------- | --------------------- |
| Domain     | Unit tests  | Mock ports            |
| Mappers    | Unit tests  | None (pure functions) |
| Adapters   | Unit tests  | Mock Axios            |
| Components | RNTL render | None                  |
| Screens    | RNTL render | Mock hooks            |

### 7.3 What We Don't Test

- Snapshots (brittle)
- Implementation details
- Third-party internals

---

## 8. Dependencies

### 8.1 Runtime

```json
{
  "@tanstack/react-query": "^5.x",
  "axios": "^1.x",
  "expo-secure-store": "~56.x",
  "expo-auth-session": "~6.x",
  "expo-crypto": "~14.x",
  "zustand": "^4.x"
}
```

### 8.2 Dev

```json
{
  "@testing-library/react-native": "^13.x",
  "jest": "^29.x",
  "@types/jest": "^29.x"
}
```

---

## 9a. Revision — 2026-08-01 UI/UX & Correctness Audit

**Status:** Applied. All 32 tasks from the implementation plan had shipped and been marked complete, but a post-hoc audit against this spec (triggered by user request to verify colors/layout/screens/functionality and add tab icons) found the design system's color layer was non-functional and several UX/architecture requirements from this spec were unmet. Fixed directly on top of the existing implementation rather than re-planning from scratch.

### Root-cause bug: color tokens never actually applied

`tailwind.config.js` defined every color as a nested `{ light, dark }` object (e.g. `primary: { light: '#007AFF', dark: '#0A84FF' }`). Tailwind only generates flat utility classes from that shape as `bg-primary-light` / `bg-primary-dark` — but all 15 component/screen files were written using flat classes (`bg-primary`, `text-text-secondary`, `border-border`, ...) per §6.2 of this spec. None of those classes existed, so buttons, cards, badges, inputs, and text rendered with no color at all (default RN black/transparent), and dark mode never had any wiring to switch anything. **Fix:** rebuilt the token layer as CSS custom properties (`global.css`, `:root` + `@media (prefers-color-scheme: dark)`) consumed via Tailwind's `rgb(var(--x) / <alpha-value>)` pattern (`darkMode: 'media'`), so every existing flat class now resolves to the correct light/dark value — zero changes needed across the 15 consumer files.

Two downstream symptoms of the same root cause, fixed alongside it:

- `Text` applied no color class when `color` was omitted (most body text in the app) — invisible against a dark background once dark mode actually started working. Now defaults to the `text` token.
- `theme.provider.tsx` returned React Navigation's stock `DefaultTheme`/`DarkTheme` instead of deriving from the app's own tokens, so header/tab-bar chrome visually clashed with the (now-correct) screen colors. Now built from `shared/theme` per color scheme.

### Missing tab icons (user-reported)

`tab-navigator.tsx` had zero `tabBarIcon` — `@expo/vector-icons` was a declared dependency, unused anywhere in `src/`. Added `Ionicons` per tab (filled/outline for active/inactive) plus themed active/inactive tint colors and `tabBarAccessibilityLabel` on each tab.

### Spec-vs-implementation gaps found and fixed

| Gap                                                                                                                                                                                                                          | Spec reference                      | Fix                                                                                                                                                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Search fired a query on every keystroke, no debounce                                                                                                                                                                         | §5.2 "Debounced Search: 300ms"      | Added 300ms debounce in `repository-search.screen.tsx`                                                                                                                                                                                                                                                                    |
| Search results were not pressable — no route from Search → Details existed in the UI despite the stack screen existing                                                                                                       | §5.3 navigation flow                | Wrapped result rows in `Pressable`, navigates to `RepositoryDetails`                                                                                                                                                                                                                                                      |
| Login screen fabricated a fake user directly into the Zustand store, bypassing `LoginUseCase`/`AuthPort` entirely — the one screen where the UI silently violated "UI consumes only use cases" (top-level architecture rule) | Architecture rules, §5.1            | Wired through `LoginUseCase(authPort)` via `ProviderFactory`; added an honestly-labeled "Continue as guest (public repos only)" option since GitHub/GitLab search doesn't require auth and the real OAuth adapters intentionally `throw` until a provider app's client credentials are configured (see Known Limitations) |
| SourceSelector was missing auth status + logout, both explicitly required                                                                                                                                                    | §5.1 SourceSelector row             | Added avatar/login + "Sign out" button                                                                                                                                                                                                                                                                                    |
| README rendered as raw markdown source (`#`, `**`, `-` visible to the user)                                                                                                                                                  | §5.1 "View repo details ... README" | Added a small dependency-free `MarkdownText` component (headings, bold, bullets) — not full CommonMark, scoped to what READMEs typically need                                                                                                                                                                             |
| `Input` never passed an accessible name to the underlying `TextInput`, and used a hardcoded hex placeholder color that didn't adapt to dark mode                                                                             | UX/accessibility (implicit)         | `accessibilityLabel` now derived from `label`/`placeholder`; placeholder + input text now use theme tokens                                                                                                                                                                                                                |
| `Spinner` had no color, rendering RN's default gray instead of the brand color used everywhere else                                                                                                                          | Design system consistency           | Defaults to the `primary` token                                                                                                                                                                                                                                                                                           |
| `Badge` declared an unused `color` prop                                                                                                                                                                                      | Dead code                           | Removed                                                                                                                                                                                                                                                                                                                   |
| 4 pre-existing TypeScript/ESLint errors unrelated to the above (two test files importing branded ID types from the wrong module, a possibly-undefined retry counter, an unexported `ButtonProps` type)                       | N/A                                 | Fixed; `tsc --noEmit` and `eslint` both clean on all touched files; full-project lint debt reduced from 13/15 to 9/14 (errors/warnings) — remainder is pre-existing `array-type` style nits and a `skeleton.tsx` `react-hooks/refs` warning outside this audit's scope                                                    |

### Known limitations (documented, not silently dropped)

- **Real OAuth is still not implemented.** `GitHubAuthAdapter.login()` / `GitLabAuthAdapter.login()` correctly `throw` rather than fake success — implementing it for real requires registering OAuth apps with GitHub/GitLab and, for GitHub specifically, a token-exchange step that cannot be done safely from a public mobile client without a backend proxy (GitHub OAuth apps require a client secret). This is a product/infra decision, not something to paper over in a UI pass.
- **Offline handling (§5.2) is unimplemented.** No network-state library (e.g. `@react-native-community/netinfo`) is installed; none of the three data screens detect connectivity. Left undone rather than half-wired without the ability to verify on-device in this environment — flagged here as the next task, not silently skipped.

---

## 9b. Trade-offs

| Decision                               | Why                                                                                                                                                                                               |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Zustand + React Query split            | Zustand for UI state, React Query for server state — clean separation                                                                                                                             |
| Factory Pattern for providers          | Single swap point, no if/else scattered in UI                                                                                                                                                     |
| Branded types for IDs                  | Type safety prevents mixing IDs from different entities                                                                                                                                           |
| No snapshot tests                      | Brittle, low value, hard to maintain                                                                                                                                                              |
| NativeWind exclusively                 | Consistent styling, dark mode support, no StyleSheet                                                                                                                                              |
| Barrel exports                         | Cleaner imports, easier refactoring                                                                                                                                                               |
| Composition Root pattern               | Dependencies wired at entry, not scattered                                                                                                                                                        |
| CSS-variable color tokens (2026-08-01) | Nested `{light,dark}` Tailwind colors don't generate the flat classes the app actually uses — `rgb(var(--x) / <alpha-value>)` + media-query dark mode fixes it without touching 15 consumer files |

---

## 10. File Cleanup

### Files to Delete

- `components/BackButton.tsx`
- `components/EditScreenInfo.tsx`
- `components/HeaderButton.tsx`
- `components/ScreenContent.tsx`
- `components/TabBarIcon.tsx`
- `screens/modal.tsx`
- `screens/one.tsx`
- `screens/two.tsx`
- `store/store.ts`
- `navigation/` (entire directory — replaced)

### Files to Create

All files under `src/` as specified in Section 3-6.

---

## 11. Commit Convention

- **Language:** English only
- **Format:** Conventional Commits (`type: subject`)
- **No AI signatures:** Commits must NOT contain "Co-authored-by", "Generated by", or any Claude/AI attribution
- **Style:** Imperative mood, lowercase, no period at end

### Commit Sequence

```
chore: bootstrap expo project with clean architecture
feat: add design tokens (colors, spacing, typography, radius)
feat: implement design system components
feat: add domain layer (entities, value objects, ports)
feat: add domain use cases
feat: add infrastructure adapters (GitHub)
feat: add infrastructure adapters (GitLab)
feat: add provider factory pattern
feat: add React Query hooks
feat: add HTTP client with interceptors
feat: add secure storage adapter
feat: add OAuth authentication flow
feat: add navigation structure
feat: implement SourceSelector screen
feat: implement RepositorySearch screen
feat: implement RepositoryDetails screen
feat: implement Issues screen
feat: implement DesignSystem showcase screen
feat: add Composition Root dependency injection
test: add domain use case tests
test: add mapper tests
test: add adapter tests
test: add component tests
test: add screen tests
chore: add ESLint, Prettier, Husky, Commitlint
docs: add comprehensive README
```
