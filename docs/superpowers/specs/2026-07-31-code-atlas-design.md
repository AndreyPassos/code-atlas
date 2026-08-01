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

| Layer | Can Import | Cannot Import |
|-------|-----------|---------------|
| Domain | Nothing (pure TS) | React, Axios, Expo, React Query |
| Application | Domain only | React, Axios, Expo, React Query |
| Infrastructure | Domain, Application | React (except hooks) |
| Presentation | Application, Domain | Axios, Infrastructure implementations |
| Composition Root | Everything | Nothing (wires dependencies) |

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

class RepositoryNotFoundError extends DomainError { /* ... */ }
class AuthenticationRequiredError extends DomainError { /* ... */ }
class ProviderUnavailableError extends DomainError { /* ... */ }
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

| Screen | Description | Key Features |
|--------|-------------|--------------|
| SourceSelector | Choose GitHub/GitLab | Provider cards, auth status, logout |
| RepositorySearch | Search repositories | Infinite scroll, debounced search, pull-to-refresh |
| RepositoryDetails | View repo details | Stats, README, language, owner |
| Issues | View issues | State filter, pagination, comments |
| DesignSystem | Showcase all components | All DS components displayed |

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

| Layer | Method | Mocking |
|-------|--------|---------|
| Domain | Unit tests | Mock ports |
| Mappers | Unit tests | None (pure functions) |
| Adapters | Unit tests | Mock Axios |
| Components | RNTL render | None |
| Screens | RNTL render | Mock hooks |

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

## 9. Trade-offs

| Decision | Why |
|----------|-----|
| Zustand + React Query split | Zustand for UI state, React Query for server state — clean separation |
| Factory Pattern for providers | Single swap point, no if/else scattered in UI |
| Branded types for IDs | Type safety prevents mixing IDs from different entities |
| No snapshot tests | Brittle, low value, hard to maintain |
| NativeWind exclusively | Consistent styling, dark mode support, no StyleSheet |
| Barrel exports | Cleaner imports, easier refactoring |
| Composition Root pattern | Dependencies wired at entry, not scattered |

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
