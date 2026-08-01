# Code Atlas

A React Native/Expo application for browsing GitHub and GitLab repositories with runtime provider switching.

## Architecture

This project follows **Clean Architecture** with **Hexagonal (Ports & Adapters)** principles.

### Layers

- **Domain** — Pure TypeScript entities, value objects, repository ports, and use cases
- **Infrastructure** — Concrete adapters (GitHub/GitLab API, mappers, React Query hooks)
- **Presentation** — Screens, components, hooks, navigation
- **Composition Root** — Dependency injection wiring

### Key principles

- Domain layer has ZERO external dependencies (runs in Node.js — no React, no Axios, no React Query)
- UI never knows about GitHub/GitLab implementations — screens call `ProviderPort`/`IssuePort` interfaces, never `axios` or the concrete adapters directly
- Provider swap happens at a single point (`ProviderFactory`) — no `if (provider === 'github')` scattered across screens or hooks
- DTOs never leak past infrastructure — each provider has its own DTO + mapper translating to the shared domain `Repository`/`Issue` shape

### Why Clean Architecture (trade-off)

The test's own grading criteria weight "Arquitetura & Desacoplamento" and "Múltiplas Fontes de Dados" as **Alta**, and both are explicitly about dependency inversion, not about picking a specific folder layout — the PDF says so directly ("Não existe uma estrutura de pastas obrigatória"). Clean Architecture was chosen because it gives dependency inversion "for free": the domain defines `RepositoryPort`/`IssuePort` as contracts, and GitHub/GitLab adapters implement them — the domain never imports Axios, and a screen never imports a concrete adapter class. The cost is more files/indirection than a flat `services/` folder would need; for an app this size that's a real trade-off, justified here because provider-switching-without-UI-changes is the single highest-weighted requirement in the test.

## Tech Stack

- Expo SDK 56, React Native 0.85, TypeScript 6 (strict mode, no `any`)
- NativeWind (Tailwind for React Native) — CSS-variable-driven design tokens, light/dark mode
- React Navigation 7
- TanStack Query (React Query) — cache, infinite queries, pull-to-refresh
- Zustand — UI-only state (active provider, search query)
- Axios — HTTP client with request/response interceptors
- Jest + React Native Testing Library
- Reactotron — dev-only network/state inspector (see [Debugging](#debugging))

## Project structure

```
src/
├── domain/          # Entities, value objects, ports, use cases — zero external imports
├── infrastructure/  # GitHub/GitLab adapters, DTOs, mappers, HTTP client, React Query hooks
├── presentation/     # Screens, design system components, navigation
└── shared/           # Design tokens, theme
```

## Provider switching

The app supports runtime switching between GitHub and GitLab with **zero UI changes**:

1. User taps a provider on the Sources tab (or the "Trocar" shortcut shown on the Search screen — switching isn't limited to app startup)
2. Zustand updates `activeProvider`
3. Each screen calls `ProviderFactory.create(activeProvider)` — the single point where a provider type resolves to concrete adapters
4. React Query hooks receive the new `RepositoryPort`/`IssuePort` instances and automatically refetch under a query key that includes the provider
5. GitHub and GitLab return structurally different JSON (different field names, different pagination — array + headers for GitLab vs. `{items, total_count}` body for GitHub) — this is fully absorbed by each provider's DTO + mapper. The domain `Repository`/`Issue` shape is identical regardless of source.

## Environment variables (optional)

Neither API requires authentication for public resources. A token only raises the rate limit (GitHub: 60/hour anonymous vs 5000 authenticated).

```bash
cp .env.example .env
# then fill in EXPO_PUBLIC_GITHUB_TOKEN / EXPO_PUBLIC_GITLAB_TOKEN if you have them
```

`.env` is gitignored — never commit real tokens.

## Getting started

```bash
npm install
npm start        # or: npm run ios / npm run android
```

## Testing

```bash
npm test                              # run all tests
npm test -- --watch                   # watch mode
npm test -- path/to/test.spec.ts      # single file
```

Domain use cases, mappers, and design system components are covered. Snapshot tests were deliberately avoided (brittle, low signal).

## Code quality

```bash
npm run lint         # ESLint + Prettier check
npm run format        # ESLint --fix + Prettier --write
npx tsc --noEmit      # type check
```

## Debugging

[Reactotron](https://github.com/infinitered/reactotron) is wired in for development builds only (`src/infrastructure/debug/reactotron.ts`, gated by `__DEV__`, imported once from `App.tsx`). Open the Reactotron desktop app before starting Metro to see every HTTP request/response live — the exact status/body the app received, which is far more useful for diagnosing API issues than reading a caught error's `.message` on screen.

## Trade-offs

| Decision                               | Why                                                                                                                                                                           |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Zustand + React Query split            | Zustand for UI-only state (active provider, search query), React Query for server state — no overlap                                                                          |
| Factory Pattern for providers          | Single swap point, no `if`/`else` scattered across screens                                                                                                                    |
| Branded types for repository/issue IDs | Type safety prevents accidentally mixing an ID from one entity with another                                                                                                   |
| No snapshot tests                      | Brittle, low value, hard to maintain — assertions on behavior instead                                                                                                         |
| NativeWind + CSS variables             | Design tokens as CSS custom properties (`rgb(var(--x) / <alpha-value>)`) so light/dark is one selector switch, not per-component logic                                        |
| No manual OAuth login                  | Not required by the test brief (only an optional `.env` token is) — a login gate would have blocked reviewers from reaching the actual graded screens for no requirement gain |
| No offline/NetInfo integration         | Would need a new native dependency I couldn't verify on a real device in this environment — left undone rather than half-wired                                                |

## Uso de IA (declaração conforme solicitado no teste)

Este projeto foi construído com assistência intensiva de IA (Claude), em duas fases:

**Fase 1 — implementação inicial.** Um prompt genérico e extenso (não derivado do PDF real deste teste) foi usado para gerar a base do projeto: estrutura de camadas, design tokens, componentes do design system, entidades/use cases de domínio, adapters GitHub/GitLab, navegação e testes. Esse prompt incluía requisitos que **não estavam no PDF real** — notavelmente um fluxo de autenticação OAuth completo — que foi implementado como stub incompleto (`throw new Error('OAuth flow not implemented yet')`) mas ainda assim guardava toda a navegação atrás de uma tela de login.

**Fase 2 — auditoria e correção contra o PDF real.** Depois de anexar o PDF do teste técnico, foi feita uma auditoria linha a linha comparando o que existia contra o que o PDF de fato pedia. Isso revelou vários problemas reais, todos corrigidos nesta fase:

- **Bug crítico de cores**: os tokens de cor no `tailwind.config.js` estavam definidos como objetos aninhados `{light, dark}`, que o Tailwind não converte nas classes planas (`bg-primary`, `text-text-secondary`) usadas em 15+ arquivos — o sistema de cores inteiro não funcionava (sem estilo, sem dark mode). Corrigido reescrevendo os tokens como variáveis CSS.
- **Bug de paginação do GitLab**: o adapter assumia um body `{data: [...], total: ...}`; a API real do GitLab retorna um array puro com paginação nos headers (`X-Total`). Isso quebraria a busca no GitLab em produção — nunca foi de fato testado contra a API real.
- **Interceptor de retry morto**: aguardava um delay e rejeitava de qualquer forma, nunca reenviava a requisição — "retry" não fazia nada. Corrigido para reemitir a requisição via a mesma instância do Axios.
- **Ordem errada de interceptors**: o interceptor de erro (que transforma o erro em mensagem amigável) rodava _antes_ do de retry, então o retry nunca via o `AxiosError` real — corrigido invertendo a ordem de registro.
- **Violação de arquitetura**: a tela de login manipulava o estado de autenticação diretamente, sem passar pelo `LoginUseCase`/`AuthPort` — violando a própria regra "UI consome apenas casos de uso" que o teste pede.
- **Gap funcional**: os resultados de busca não eram clicáveis — não existia navegação de Busca → Detalhes na UI, apesar da tela de detalhes existir.
- Campo `watchers` ausente na entidade `Repository` (exigido explicitamente pelo PDF §4.3), texto de UI inteiramente em inglês (o PDF é em português), ausência de ícones nas abas, paleta de cores genérica em vez de referenciar a identidade visual do próprio PDF, entre outros itens menores.
- **Decisão de escopo**: removida completamente a tela de login/OAuth e toda a camada de domínio de autenticação (`AuthPort`, `LoginUseCase`, `LogoutUseCase`, adapters de auth, `StoragePort`/SecureStore) — nada disso é exigido pelo PDF, e o gate de login impedia o app de abrir direto na tela que o PDF define como inicial (Source Selector).

**O que foi revisado/rejeitado da IA:** todo o código gerado na Fase 1 foi lido, testado (`tsc`, `eslint`, `jest`) e comparado linha a linha contra o PDF real antes de qualquer correção ser aplicada — nenhuma mudança foi aceita sem entender por que o comportamento anterior estava errado.

## O que eu faria diferente com mais tempo

- OAuth real para GitLab é factível sem backend (Authorization Code + PKCE, aplicação pública sem client secret); para GitHub exigiria um backend mínimo só para trocar `code` por `token` (OAuth Apps clássicos do GitHub não suportam PKCE puro) — não implementado por não ser exigido pelo PDF, mas seria o próximo passo natural caso autenticação real fosse necessária.
- Suporte offline (§7 do PDF) com `@react-native-community/netinfo` — mostrar dados em cache com indicador de "sem conexão" e nova tentativa automática ao reconectar.
- Testes de tela (screen-level, com mock dos hooks) além dos testes de domínio/mapper/componente já existentes.
- Renderização de markdown mais completa para o README do repositório (a implementação atual é um parser mínimo sem dependência externa — cobre títulos, negrito e listas, não é CommonMark completo).

## License

MIT
