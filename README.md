# Code Atlas

Aplicação React Native/Expo para navegar repositórios do GitHub e GitLab, com troca de provedor em tempo de execução.

## Instalação e execução

```bash
npm install
npx expo prebuild      # gera ios/ e android/ (obrigatório — ver Módulos nativos abaixo)
npm run ios            # ou: npm run android
```

`npm start` (Expo Go) funciona para tudo, exceto renderização de README, que exige o dev client buildado via `run:ios`/`run:android` (ver [Módulos nativos](#módulos-nativos)).

## Arquitetura

Este projeto segue **Clean Architecture** com princípios de **Hexagonal (Ports & Adapters)**.

### Camadas

- **Domain** — Entidades, value objects, ports (interfaces de repositório) e use cases em TypeScript puro
- **Infrastructure** — Adapters concretos (API do GitHub/GitLab, mappers, hooks de React Query)
- **Presentation** — Telas, componentes, hooks, navegação
- **Composition Root** — Fiação de injeção de dependência

### Princípios-chave

- A camada de domínio tem ZERO dependências externas (roda em Node.js puro — sem React, sem Axios, sem React Query)
- A UI nunca conhece as implementações de GitHub/GitLab — as telas chamam as interfaces `ProviderPort`/`IssuePort`, nunca `axios` ou os adapters concretos diretamente
- A troca de provedor acontece em um único ponto (`ProviderFactory`) — sem `if (provider === 'github')` espalhado por telas ou hooks
- DTOs nunca vazam além da camada de infraestrutura — cada provedor tem seu próprio DTO + mapper traduzindo para o shape de domínio compartilhado `Repository`/`Issue`

### Por que Clean Architecture (trade-off)

Os próprios critérios de avaliação do teste dão peso **Alta** para "Arquitetura & Desacoplamento" e "Múltiplas Fontes de Dados", e ambos tratam explicitamente de inversão de dependência, não de escolher um layout de pastas específico — o próprio PDF diz isso ("Não existe uma estrutura de pastas obrigatória"). Clean Architecture foi escolhida porque entrega inversão de dependência "de graça": o domínio define `RepositoryPort`/`IssuePort` como contratos, e os adapters GitHub/GitLab os implementam — o domínio nunca importa Axios, e uma tela nunca importa uma classe de adapter concreta. O custo é mais arquivos/indireção do que uma pasta `services/` plana exigiria; para um app deste tamanho isso é um trade-off real, justificado aqui porque "troca de fonte sem mudar a UI" é o requisito de maior peso no teste.

### Por que Hexagonal (Ports & Adapters)

Clean Architecture define as camadas e a direção das dependências; Hexagonal é o padrão concreto usado pra materializar isso no código — cada ponto de contato do domínio com o mundo externo (GitHub, GitLab, storage) vira um **port** (interface definida pelo domínio: `RepositoryPort`, `IssuePort`) implementado por um **adapter** na camada de infraestrutura. A escolha resolve diretamente o requisito de maior peso do teste, "Múltiplas Fontes de Dados":

- O domínio declara o contrato (`search(query): Promise<Repository[]>`) sem saber se quem implementa é GitHub ou GitLab — a dependência aponta de fora pra dentro, nunca o contrário
- Adicionar uma terceira fonte (ex.: Bitbucket) significa escrever um novo adapter que implementa os ports existentes — zero mudança no domínio, nos use cases ou nas telas
- Os adapters ficam isolados o bastante pra testar o domínio inteiro com mocks simples dos ports, sem subir um cliente HTTP real ou depender do formato de resposta de nenhuma API

O custo é a indireção: toda operação passa por uma interface antes de chegar na implementação, o que exige mais saltos entre arquivos pra seguir o fluxo de uma chamada. Pra um app com duas fontes de dados que precisam ser intercambiáveis em runtime, esse é exatamente o problema que Hexagonal resolve — o trade-off compensa aqui, mesmo sendo overkill pra um CRUD de fonte única.

## Stack tecnológica

- Expo SDK 56, React Native 0.85, TypeScript 6 (modo strict, sem `any`)
- NativeWind (Tailwind para React Native) — design tokens via CSS variables, dark/light mode manual + do sistema
- React Navigation 7
- TanStack Query (React Query) — cache, infinite queries, pull-to-refresh
- Zustand — estado apenas de UI: `activeProvider` e a preferência de tema (`light`/`dark`/`system`, persistida — ver abaixo). Query de busca, filtro de issue etc. são estado local do componente, não estado global
- `@react-native-async-storage/async-storage` — persiste a preferência de tema entre reinícios do app (via middleware `persist` do zustand)
- Axios — cliente HTTP com interceptors de request/response
- `@gorhom/bottom-sheet` — seletor de provedor, acessível tanto pela aba Sources quanto por um atalho na tela de Busca
- `react-native-toast-message` — notificações de erro/aviso não bloqueantes (ver [Padrões de UX](#padrões-de-ux))
- `react-native-enriched-markdown` — renderização nativa CommonMark + GFM para READMEs de repositório (exige New Architecture + dev client, ver [Módulos nativos](#módulos-nativos))
- Jest + React Native Testing Library
- Reactotron — inspetor de rede/estado, apenas em dev (ver [Debug](#debug))

## Estrutura do projeto

```
src/
├── domain/          # Entidades, value objects, ports, use cases — zero imports externos
├── infrastructure/  # Adapters GitHub/GitLab, DTOs, mappers, cliente HTTP, hooks de React Query
├── presentation/     # Telas, componentes do design system, navegação
└── shared/           # Design tokens, tema
```

## Troca de fonte de dados (GitHub/GitLab)

O app suporta troca em tempo real entre GitHub e GitLab com **zero mudanças na UI**:

1. O usuário escolhe um provedor na aba Sources, ou abre o mesmo seletor como bottom sheet a partir da tela de Busca (`ProviderSwitchSheet`) — a troca não fica limitada ao startup do app nem a uma única tela
2. O Zustand atualiza `activeProvider`; um toast confirma a troca
3. Cada tela chama `ProviderFactory.create(activeProvider)` — o único ponto onde um tipo de provedor resolve para adapters concretos
4. Os hooks de React Query recebem as novas instâncias de `RepositoryPort`/`IssuePort`. Toda query key inclui o provedor ativo (`['repositories', provider, 'search', query]` etc.), então trocar de provedor invalida o cache do provedor anterior e força um refetch real, em vez de reaproveitar silenciosamente resultados do GitHub em cache sob a aba do GitLab
5. GitHub e GitLab retornam JSON estruturalmente diferente (nomes de campo diferentes, paginação diferente — array + headers no GitLab vs. corpo `{items, total_count}` no GitHub) — isso é totalmente absorvido pelo DTO + mapper de cada provedor. O shape de domínio `Repository`/`Issue` é idêntico independentemente da fonte.

## Padrões de UX

- **Loading**: `Spinner` no primeiro carregamento, `Skeleton` disponível no design system (ainda não conectado a um estado de loading real — ver abaixo)
- **Estado vazio**: `EmptyState` quando uma busca/lista de issues resolve com zero itens
- **Erros — bloqueante vs. não bloqueante**: `ErrorState` (tela cheia, com retry) só aparece quando a query não tem _nenhum_ dado em cache pra cair de volta. Uma falha de refetch/pull-to-refresh com resultados já na tela não os apaga — vira um **toast** em vez disso, então o usuário mantém o que já tinha enquanto uma nova tentativa em background pode ter sucesso silenciosamente
- **Pull-to-refresh** e **infinite scroll** nas telas de Busca e Issues
- **Busca com debounce de 300ms**, fechar teclado ao tocar fora, `keyboardShouldPersistTaps="handled"` para que o primeiro toque em um resultado com o teclado aberto já registre

## Variáveis de ambiente (opcional)

Nenhuma das duas APIs exige autenticação para recursos públicos. Um token só aumenta o limite de requisições (GitHub: 60/hora anônimo vs. 5000 autenticado).

```bash
cp .env.example .env
# depois preencha EXPO_PUBLIC_GITHUB_TOKEN / EXPO_PUBLIC_GITLAB_TOKEN se tiver
```

`.env` está no gitignore — nunca commitar tokens reais.

Ver [Instalação e execução](#instalação-e-execução) no topo para o setup completo.

## Testes

```bash
npm test                              # roda todos os testes
npm test -- --watch                   # modo watch
npm test -- path/to/test.spec.ts      # arquivo único
```

Use cases de domínio, mappers, componentes do design system e as quatro telas (`SourceSelector`, `RepositorySearch`, `RepositoryDetails`, `Issues` — hooks de React Query/Zustand mockados, navegação verificada via um stub de `navigation.navigate`) estão cobertos. Testes de snapshot foram deliberadamente evitados (frágeis, baixo sinal).

Fazer um teste de tela sequer rodar exigiu corrigir a infraestrutura de Jest quebrada, não só escrever o teste:

- `react-native-enriched-markdown` (nativo puro, ESM) e `@gorhom/bottom-sheet` (que arrasta `react-native-reanimated`/`react-native-worklets`, cuja parte nativa nunca inicializa sob Jest nessa combinação de versões) são puxados transitivamente por qualquer tela que importe o barrel de componentes compartilhados — nenhum dos dois tinha binding de teste, e agora resolvem para `<View>`/`<Text>` simples em `src/test-mocks/` via `moduleNameMapper`.
- O `transformIgnorePatterns` do `jest.config.js` tinha um bug de regex — `react-native` no allowlist exigia uma `/` final literal, então só casava `node_modules/react-native/` exato e silenciosamente falhava em transformar `react-native-gesture-handler`, `react-native-reanimated` etc. (pacotes que o padrão default do jest-expo já cobria corretamente antes desse projeto sobrescrever a config).
- `jest.setup.js` existia mas nunca tinha sido ligado ao `setupFiles` do `jest.config.js` — um arquivo morto. Agora carrega `react-native-gesture-handler/jestSetup` e o mock oficial de `react-native-safe-area-context/jest/mock`.
- Corrigir isso expôs uma regressão no `tsc`: `jest.setup.js` não estava no `exclude` do `tsconfig.json` (só `jest.config.js` estava), então ao exigir o mock de safe-area-context o `tsc` seguia para o `.tsx` fonte real desse pacote (`customConditions: ["react-native"]` resolve pra lá, não pro `.d.ts` compilado) e quebrava em `process.env.NODE_ENV` — propriedade que o tipo global `process` estreitado do `env.d.ts` não declara. Adicionado `jest.setup.js` ao `exclude` do `tsconfig.json`.

`@testing-library/react-native@14` exige o pacote `test-renderer` como peer dependency real, que nunca tinha sido instalado — o setup original redirecionava pro `react-test-renderer` legado via `moduleNameMapper`, com um mock manual escrito à mão aparentemente pra suprir a lacuna. Só que `moduleNameMapper` tem prioridade sobre mocks manuais em `__mocks__`, então esse mock nunca foi de fato usado, e o redirect simples não implementa dispatch de evento real. Resultado: `fireEvent.press`/`fireEvent.changeText` rodavam sem erro e silenciosamente não faziam nada — o que mascarava dois testes que chamavam `.props.onPress()`/`.props.onChangeText()` diretamente em vez de disparar um evento real, passando pelo motivo errado. Instalado o `test-renderer` de verdade, removidos o mapper/mock, e corrigidos os dois testes para usar `fireEvent` contra o host node real.

## Qualidade de código

```bash
npm run lint         # ESLint + Prettier check
npm run format        # ESLint --fix + Prettier --write
npx tsc --noEmit      # checagem de tipos
```

## Debug

[Reactotron](https://github.com/infinitered/reactotron) está conectado apenas em builds de desenvolvimento (`src/infrastructure/debug/reactotron.ts`, protegido por `__DEV__`, importado uma vez em `App.tsx`). Abra o app desktop do Reactotron antes de iniciar o Metro pra ver cada request/response HTTP ao vivo — o status/corpo exato que o app recebeu, muito mais útil pra diagnosticar problemas de API do que ler a `.message` de um erro capturado na tela.

## Módulos nativos

`react-native-enriched-markdown` (renderização de README) exige a New Architecture do React Native e traz código nativo real — **não** roda no Expo Go. Este projeto já tem `newArchEnabled=true` (Android) e as pastas `ios/`/`android/` já pré-buildadas, então:

```bash
npx expo prebuild   # rode de novo após puxar mudanças que mexam em deps nativas
npx expo run:ios     # ou: npx expo run:android
```

Só `npm start` (Expo Go) vai falhar ao renderizar READMEs — buildar um dev client via `run:ios`/`run:android` pelo menos uma vez.

## Trade-offs

| Decisão                                          | Por quê                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Split Zustand + React Query                      | Zustand pra estado apenas de UI (`activeProvider`, preferência de tema persistida), React Query pra estado de servidor — sem sobreposição                                                                                                                                                  |
| Zustand `persist` + AsyncStorage pro tema        | O `colorScheme` do próprio NativeWind não tem persistência; um componente `ThemeSync` aplica a preferência persistida ao NativeWind no mount, pra sobreviver a um reinício do app em vez de resetar pro sistema                                                                            |
| Factory Pattern pros provedores                  | Um único ponto de troca, sem `if`/`else` espalhado pelas telas                                                                                                                                                                                                                             |
| Branded types pros IDs de repositório/issue      | Segurança de tipos evita misturar acidentalmente um ID de uma entidade com outra                                                                                                                                                                                                           |
| Renderer de markdown nativo em vez de um puro-JS | `react-native-enriched-markdown` entrega CommonMark + GFM real (tabelas, task lists) nativamente; custa compatibilidade com Expo Go (exige dev client) — vale a pena já que READMEs usam ambos com frequência                                                                              |
| Sem testes de snapshot                           | Frágeis, baixo valor, difíceis de manter — assertions sobre comportamento em vez disso                                                                                                                                                                                                     |
| NativeWind + CSS variables                       | Design tokens como CSS custom properties (`rgb(var(--x) / <alpha-value>)`) pra que light/dark seja uma troca de seletor, não lógica por componente                                                                                                                                         |
| Sem login OAuth manual                           | Não exigido pelo briefing do teste (só um token opcional em `.env` é) — um gate de login bloquearia os avaliadores de chegar nas telas de fato avaliadas, sem nenhum ganho de requisito                                                                                                    |
| Sem integração offline/NetInfo                   | Exigiria uma nova dependência nativa que eu não conseguiria verificar em um dispositivo real neste ambiente — deixado de fora em vez de meio-feito                                                                                                                                         |
| Links de README restritos a http(s)              | Markdown de README é conteúdo não confiável, vindo de qualquer dono de repositório — um link não é garantidamente http(s) (`javascript:`, custom app schemes, `intent:` no Android). `onLinkPress` rejeita qualquer coisa fora de um allowlist http(s) e checa `canOpenURL` antes de abrir |

## Uso de IA (declaração conforme solicitado no teste)

Este projeto foi construído com assistência intensiva de IA (Claude), em quatro fases:

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
- **`fireEvent` silenciosamente quebrado**: ver seção [Testes](#testes) — bug de configuração de teste que fazia `fireEvent.press`/`fireEvent.changeText` rodarem sem erro e sem disparar nada, mascarando dois testes que na prática não testavam interação real.
- **Interceptor de retry morto e ordem errada de interceptors**, **paginação do GitLab assumindo shape errado de resposta**, **campo `watchers` ausente**: ver commits `fix: correct GitHub/GitLab API integration`.
- **Markdown do README**: trocado o parser manual (só títulos/negrito/listas) por [`react-native-enriched-markdown`](https://github.com/software-mansion/react-native-enriched-markdown) — renderização nativa CommonMark + GFM (tabelas, task lists), sem WebView. Exige New Architecture (já habilitada no projeto) e não roda no Expo Go — precisa de `expo prebuild` + dev client.

**Fase 4 — infraestrutura de teste de tela.** O item "testes de tela" ficou pendente por um bom tempo em [O que eu faria diferente](#o-que-eu-faria-diferente-com-mais-tempo) porque não era só escrever o teste — a configuração de Jest do projeto não sustentava renderizar uma tela real:

- `react-native-enriched-markdown` (nativo puro, ESM) e `@gorhom/bottom-sheet` (que arrasta `react-native-reanimated`/`react-native-worklets`, cuja parte nativa nunca inicializa sob Jest nessa combinação de versões) são puxados transitivamente por qualquer tela que importe o barrel de componentes — nenhum dos dois tem binding utilizável em teste. Resolvido com stubs próprios (`src/test-mocks/`) via `moduleNameMapper`.
- `transformIgnorePatterns` do `jest.config.js` tinha um bug de regex: exigia `/` logo após cada nome de pacote no allowlist, então só casava `node_modules/react-native/` exato — silenciosamente parava de transformar `react-native-gesture-handler`, `react-native-reanimated` etc. (pacotes que o padrão default do `jest-expo` já cobria corretamente antes desse projeto sobrescrever a config).
- `jest.setup.js` existia mas nunca tinha sido ligado ao `setupFiles` do `jest.config.js` — arquivo morto. Corrigido, agora carrega `react-native-gesture-handler/jestSetup` e o mock oficial de `react-native-safe-area-context`.
- Isso expôs uma regressão no `tsc`: `jest.setup.js` não estava no `exclude` do `tsconfig.json` (só `jest.config.js` estava), então ao carregar o mock de safe-area-context o `tsc` seguia para o `.tsx` fonte real do pacote (`customConditions: ["react-native"]` resolve para lá, não para o `.d.ts` compilado) e quebrava em `process.env.NODE_ENV` — propriedade que o `env.d.ts` do projeto (que estreita o tipo global de `process`) não declara. Corrigido adicionando `jest.setup.js` ao `exclude`.

Com a infra corrigida, as 3 telas restantes (`RepositoryDetails`, `Issues`, `SourceSelector`) seguiram o mesmo padrão sem atrito adicional — nenhum novo bug de configuração apareceu.

Ver detalhes completos em [Testes](#testes).

**O que foi revisado/rejeitado da IA:** todo o código gerado na Fase 1 foi lido, testado (`tsc`, `eslint`, `jest`) e comparado linha a linha contra o PDF real antes de qualquer correção ser aplicada — nenhuma mudança foi aceita sem entender por que o comportamento anterior estava errado. Boa parte dos bugs das Fases 2 e 3 só apareceram porque o código da Fase 1 nunca tinha sido de fato exercitado contra as APIs reais nem testado com interações reais.

## O que eu faria diferente com mais tempo

- OAuth real para GitLab é factível sem backend (Authorization Code + PKCE, aplicação pública sem client secret); para GitHub exigiria um backend mínimo só para trocar `code` por `token` (OAuth Apps clássicos do GitHub não suportam PKCE puro) — não implementado por não ser exigido pelo PDF, mas seria o próximo passo natural caso autenticação real fosse necessária.
- Suporte offline (§7 do PDF) com `@react-native-community/netinfo` — mostrar dados em cache com indicador de "sem conexão" e nova tentativa automática ao reconectar.

## Licença

MIT
