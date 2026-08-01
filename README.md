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

| Decision                      | Why                                                |
| ----------------------------- | -------------------------------------------------- |
| Zustand + React Query split   | Zustand for UI state, React Query for server state |
| Factory Pattern for providers | Single swap point, no if/else in UI                |
| Branded types for IDs         | Type safety prevents ID confusion                  |
| NativeWind exclusively        | Consistent styling, dark mode support              |
| Composition Root pattern      | Dependencies wired at entry point                  |

## License

MIT
