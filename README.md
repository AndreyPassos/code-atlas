# Code Atlas

A React Native/Expo application for browsing GitHub and GitLab repositories with runtime provider switching.

## Quickstart

```bash
npm install
npx expo prebuild      # generates ios/ and android/ (required — see Native modules below)
npm run ios            # or: npm run android
```

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
- NativeWind (Tailwind for React Native) — CSS-variable-driven design tokens, manual + system light/dark mode
- React Navigation 7
- TanStack Query (React Query) — cache, infinite queries, pull-to-refresh
- Zustand — UI-only state: `activeProvider` and the theme preference (`light`/`dark`/`system`, persisted — see below). Search query, issue filter, etc. are local component state, not global
- `@react-native-async-storage/async-storage` — persists the theme preference across app restarts (via zustand's `persist` middleware)
- Axios — HTTP client with request/response interceptors
- `@gorhom/bottom-sheet` — provider switcher, reachable from both the Sources tab and a shortcut on the Search screen
- `react-native-toast-message` — non-blocking error/warning notifications (see [UX patterns](#ux-patterns))
- `react-native-enriched-markdown` — native CommonMark + GFM rendering for repository READMEs (requires New Architecture + a dev client, see [Native modules](#native-modules))
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

1. User picks a provider on the Sources tab, or opens the same picker as a bottom sheet from the Search screen (`ProviderSwitchSheet`) — switching isn't limited to app startup or a single screen
2. Zustand updates `activeProvider`; a toast confirms the switch
3. Each screen calls `ProviderFactory.create(activeProvider)` — the single point where a provider type resolves to concrete adapters
4. React Query hooks receive the new `RepositoryPort`/`IssuePort` instances. Every query key includes the active provider (`['repositories', provider, 'search', query]`, etc.), so switching invalidates the previous provider's cache and forces a real refetch instead of silently reusing GitHub's cached results under GitLab's tab
5. GitHub and GitLab return structurally different JSON (different field names, different pagination — array + headers for GitLab vs. `{items, total_count}` body for GitHub) — this is fully absorbed by each provider's DTO + mapper. The domain `Repository`/`Issue` shape is identical regardless of source.

## UX patterns

- **Loading**: `Spinner` on first load, `Skeleton` available in the design system (not currently wired into a real loading state — see below)
- **Empty state**: `EmptyState` when a search/issues list resolves with zero items
- **Errors — blocking vs. non-blocking**: `ErrorState` (full-screen, with retry) only when a query has _no_ cached data to fall back on. A refetch/pull-to-refresh failure with results already on screen doesn't wipe them — it surfaces as a **toast** instead, so the user keeps what they had while a background retry can succeed silently
- **Pull-to-refresh** and **infinite scroll** on Search and Issues
- **300ms debounced search**, dismiss-keyboard-on-background-tap, `keyboardShouldPersistTaps="handled"` so a first tap on a result while the keyboard is open still registers

## Environment variables (optional)

Neither API requires authentication for public resources. A token only raises the rate limit (GitHub: 60/hour anonymous vs 5000 authenticated).

```bash
cp .env.example .env
# then fill in EXPO_PUBLIC_GITHUB_TOKEN / EXPO_PUBLIC_GITLAB_TOKEN if you have them
```

`.env` is gitignored — never commit real tokens.

See [Quickstart](#quickstart) at the top for the full setup — `npm start` (Expo Go) works for everything except README rendering, which needs the dev client built via `run:ios`/`run:android` (see [Native modules](#native-modules)).

## Testing

```bash
npm test                              # run all tests
npm test -- --watch                   # watch mode
npm test -- path/to/test.spec.ts      # single file
```

Domain use cases, mappers, design system components, and one screen (`RepositorySearchScreen`, with `useSearchRepositories`/`useProviderStore` mocked) are covered. Snapshot tests were deliberately avoided (brittle, low signal).

Getting a screen test running at all required fixing broken Jest infra, not just writing the test:

- `react-native-enriched-markdown` (native-only, ESM) and `@gorhom/bottom-sheet` (pulls in `react-native-reanimated`/`react-native-worklets`, whose native part never initializes under Jest for this version combo) get pulled in transitively by any screen importing the shared components barrel — both have no test binding, and now resolve to plain `<View>`/`<Text>` stubs in `src/test-mocks/` via `moduleNameMapper`.
- `jest.config.js`'s `transformIgnorePatterns` had a regex bug — `react-native` in the allowlist required a literal trailing `/`, so it only ever matched `node_modules/react-native/` exactly and silently failed to transform `react-native-gesture-handler`, `react-native-reanimated`, etc. (packages jest-expo's own default pattern already handled correctly before this project's config overrode it).
- `jest.setup.js` existed but was never wired into `jest.config.js`'s `setupFiles` — a dead file. Now wires up `react-native-gesture-handler/jestSetup` and the official `react-native-safe-area-context/jest/mock`.
- Fixing that surfaced a `tsc` regression: `jest.setup.js` wasn't in `tsconfig.json`'s `exclude` (only `jest.config.js` was), so once it required the safe-area-context mock, `tsc` walked into that package's real `.tsx` source (`customConditions: ["react-native"]` resolves there, not the compiled `.d.ts`) and failed on `process.env.NODE_ENV` — a property `env.d.ts`'s narrowed global `process` type doesn't declare. Added `jest.setup.js` to `tsconfig.json`'s `exclude`.

`@testing-library/react-native@14` requires the `test-renderer` package as a real peer dependency, which had never been installed — the original setup instead redirected it to the legacy `react-test-renderer` via `moduleNameMapper`, with a hand-written manual mock apparently meant to bridge the gap. `moduleNameMapper` takes priority over manual `__mocks__`, though, so that mock was never actually used, and the plain redirect doesn't implement real event dispatch. Net effect: `fireEvent.press`/`fireEvent.changeText` ran without error but silently did nothing — which had masked two tests calling `.props.onPress()`/`.props.onChangeText()` directly instead of firing a real event, passing for the wrong reason. Installed `test-renderer` for real, removed the mapper/mock, fixed both tests to use `fireEvent` against the actual host node.

## Code quality

```bash
npm run lint         # ESLint + Prettier check
npm run format        # ESLint --fix + Prettier --write
npx tsc --noEmit      # type check
```

## Debugging

[Reactotron](https://github.com/infinitered/reactotron) is wired in for development builds only (`src/infrastructure/debug/reactotron.ts`, gated by `__DEV__`, imported once from `App.tsx`). Open the Reactotron desktop app before starting Metro to see every HTTP request/response live — the exact status/body the app received, which is far more useful for diagnosing API issues than reading a caught error's `.message` on screen.

## Native modules

`react-native-enriched-markdown` (README rendering) requires the React Native New Architecture and ships real native code — it does **not** run in Expo Go. This project already has `newArchEnabled=true` (Android) and prebuilt `ios/`/`android/` folders, so:

```bash
npx expo prebuild   # re-run after pulling changes that touch native deps
npx expo run:ios     # or: npx expo run:android
```

`npm start` alone (Expo Go) will fail to render READMEs — build a dev client via `run:ios`/`run:android` at least once.

## Trade-offs

| Decision                                    | Why                                                                                                                                                                                                                                                            |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Zustand + React Query split                 | Zustand for UI-only state (`activeProvider`, persisted theme preference), React Query for server state — no overlap                                                                                                                                            |
| Zustand `persist` + AsyncStorage for theme  | NativeWind's own colorScheme has no persistence; a `ThemeSync` component applies the persisted preference to NativeWind on mount so it survives an app restart instead of resetting to system                                                                  |
| Factory Pattern for providers               | Single swap point, no `if`/`else` scattered across screens                                                                                                                                                                                                     |
| Branded types for repository/issue IDs      | Type safety prevents accidentally mixing an ID from one entity with another                                                                                                                                                                                    |
| Native markdown renderer over a pure-JS one | `react-native-enriched-markdown` gives real CommonMark + GFM (tables, task lists) natively; costs Expo Go compatibility (needs a dev client) — worth it since READMEs commonly use both                                                                        |
| No snapshot tests                           | Brittle, low value, hard to maintain — assertions on behavior instead                                                                                                                                                                                          |
| NativeWind + CSS variables                  | Design tokens as CSS custom properties (`rgb(var(--x) / <alpha-value>)`) so light/dark is one selector switch, not per-component logic                                                                                                                         |
| No manual OAuth login                       | Not required by the test brief (only an optional `.env` token is) — a login gate would have blocked reviewers from reaching the actual graded screens for no requirement gain                                                                                  |
| No offline/NetInfo integration              | Would need a new native dependency I couldn't verify on a real device in this environment — left undone rather than half-wired                                                                                                                                 |
| README links restricted to http(s)          | README markdown is untrusted content from any repo owner — a link isn't guaranteed to be http(s) (`javascript:`, custom app schemes, `intent:` on Android). `onLinkPress` rejects anything outside an http(s) allowlist and checks `canOpenURL` before opening |

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

**Fase 3 — polimento e correção de bugs adicionais**, encontrados ao adicionar bottom sheet (troca de fonte), toast (avisos/erros) e ao revisar boas práticas de React/testes:

- **Cache não isolado por fonte**: nenhuma query key incluía o provider ativo (`['repositories', 'search', query]` era igual pra GitHub e GitLab) — trocar de fonte reaproveitava o cache da fonte anterior em vez de buscar de novo. Corrigido incluindo o provider em toda key.
- **Violações de rules-of-hooks**: `Skeleton` e `QueryProvider` liam `useRef(...).current` durante o render (proibido pelas regras de hooks do React — só devia ler/escrever refs em efeitos/handlers); trocado por `useState(() => valor)[0]` (lazy init seguro). `Skeleton` também nunca parava a animação em loop no unmount.
- **`ActivityIndicator` com tamanho ignorado**: o `size` numérico do RN `ActivityIndicator` é amplamente ignorado pelas views nativas — os 3 tamanhos do `Spinner` (sm/md/lg) renderizavam visualmente idênticos. Corrigido com `transform: scale`.
- **`fireEvent` silenciosamente quebrado**: ver seção [Testing](#testing) — bug de configuração de teste que fazia `fireEvent.press`/`fireEvent.changeText` rodarem sem erro e sem disparar nada, mascarando dois testes que na prática não testavam interação real.
- **Interceptor de retry morto e ordem errada de interceptors**, **paginação do GitLab assumindo shape errado de resposta**, **campo `watchers` ausente**: ver commits `fix: correct GitHub/GitLab API integration`.
- **Markdown do README**: trocado o parser manual (só títulos/negrito/listas) por [`react-native-enriched-markdown`](https://github.com/software-mansion/react-native-enriched-markdown) — renderização nativa CommonMark + GFM (tabelas, task lists), sem WebView. Exige New Architecture (já habilitada no projeto) e não roda no Expo Go — precisa de `expo prebuild` + dev client.

**Fase 4 — infraestrutura de teste de tela.** O item "testes de tela" ficou pendente por um bom tempo em [O que eu faria diferente](#o-que-eu-faria-diferente-com-mais-tempo) porque não era só escrever o teste — a configuração de Jest do projeto não sustentava renderizar uma tela real:

- `react-native-enriched-markdown` (nativo puro, ESM) e `@gorhom/bottom-sheet` (que arrasta `react-native-reanimated`/`react-native-worklets`, cuja parte nativa nunca inicializa sob Jest nessa combinação de versões) são puxados transitivamente por qualquer tela que importe o barrel de componentes — nenhum dos dois tem binding utilizável em teste. Resolvido com stubs próprios (`src/test-mocks/`) via `moduleNameMapper`.
- `transformIgnorePatterns` do `jest.config.js` tinha um bug de regex: exigia `/` logo após cada nome de pacote no allowlist, então só casava `node_modules/react-native/` exato — silenciosamente parava de transformar `react-native-gesture-handler`, `react-native-reanimated` etc. (pacotes que o padrão default do `jest-expo` já cobria corretamente antes desse projeto sobrescrever a config).
- `jest.setup.js` existia mas nunca tinha sido ligado ao `setupFiles` do `jest.config.js` — arquivo morto. Corrigido, agora carrega `react-native-gesture-handler/jestSetup` e o mock oficial de `react-native-safe-area-context`.
- Isso expôs uma regressão no `tsc`: `jest.setup.js` não estava no `exclude` do `tsconfig.json` (só `jest.config.js` estava), então ao carregar o mock de safe-area-context o `tsc` seguia para o `.tsx` fonte real do pacote (`customConditions: ["react-native"]` resolve para lá, não para o `.d.ts` compilado) e quebrava em `process.env.NODE_ENV` — propriedade que o `env.d.ts` do projeto (que estreita o tipo global de `process`) não declara. Corrigido adicionando `jest.setup.js` ao `exclude`.

Ver detalhes completos em [Testing](#testing).

**O que foi revisado/rejeitado da IA:** todo o código gerado na Fase 1 foi lido, testado (`tsc`, `eslint`, `jest`) e comparado linha a linha contra o PDF real antes de qualquer correção ser aplicada — nenhuma mudança foi aceita sem entender por que o comportamento anterior estava errado. Boa parte dos bugs das Fases 2 e 3 só apareceram porque o código da Fase 1 nunca tinha sido de fato exercitado contra as APIs reais nem testado com interações reais.

## O que eu faria diferente com mais tempo

- OAuth real para GitLab é factível sem backend (Authorization Code + PKCE, aplicação pública sem client secret); para GitHub exigiria um backend mínimo só para trocar `code` por `token` (OAuth Apps clássicos do GitHub não suportam PKCE puro) — não implementado por não ser exigido pelo PDF, mas seria o próximo passo natural caso autenticação real fosse necessária.
- Suporte offline (§7 do PDF) com `@react-native-community/netinfo` — mostrar dados em cache com indicador de "sem conexão" e nova tentativa automática ao reconectar.
- Mais testes de tela cobrindo os fluxos restantes (Issues, Repository Details, Source Selector) seguindo o mesmo padrão estabelecido no `RepositorySearchScreen` — ver [Testing](#testing).

## License

MIT
