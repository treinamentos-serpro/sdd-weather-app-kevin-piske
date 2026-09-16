# Tarefas de Implementação — Weather App

Fonte: `plans/weather-app-plan.md`.

O backlog segue a ordem: tipos → funções puras → services → hook → componentes → integração → testes → hardening. Cada tarefa é uma unidade testável e declara suas dependências diretas.

## Entrega 1 — Tipos e contratos

### T-01 — Criar contratos do domínio meteorológico

- **Descrição:** Definir `Unit`, `City`, `CurrentWeather`, `ForecastDay`, `WeatherData`, `PublicError` e `OperationState`.
- **Critérios de aceite:** `WeatherData` possui exatamente cinco posições de forecast; temperaturas internas são Celsius; estados e erros são tipados; o arquivo não depende de React ou services.
- **Requisitos relacionados:** FR-003, FR-004, FR-005, FR-006, NFR-007, AC-OV-012.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Tipo:** Data

## Entrega 2 — Funções puras

### T-02 — Normalizar texto de busca

- **Descrição:** Remover espaços excedentes e normalizar caixa e acentos.
- **Critérios de aceite:** Consultas equivalentes produzem a mesma forma normalizada; entrada vazia é detectada; caracteres válidos são preservados.
- **Requisitos relacionados:** FR-001, AC-001.4, AC-001.6.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/normalization.ts`.
- **Tipo:** Data

### T-03 — Ordenar e limitar cidades

- **Descrição:** Implementar ranking por correspondência, contexto regional, remoção de duplicatas e limite de dez.
- **Critérios de aceite:** A ordenação é determinística; cidades homônimas permanecem separadas; no máximo dez resultados são retornados.
- **Requisitos relacionados:** FR-001, AC-001.2, AC-001.3, AC-001.7.
- **Dependências:** T-01, T-02.
- **Arquivos prováveis:** `src/lib/normalization.ts`.
- **Tipo:** Data

### T-04 — Implementar conversão de temperatura

- **Descrição:** Converter Celsius para a unidade ativa e arredondar valores.
- **Critérios de aceite:** `C -> C` preserva o valor; `F = C * 9 / 5 + 32`; arredondamento é consistente; valores inválidos são rejeitados.
- **Requisitos relacionados:** FR-005, AC-005.3, AC-005.5, AC-005.6.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/weather.ts`.
- **Tipo:** Data

### T-05 — Mapear códigos WMO e formatar dados

- **Descrição:** Mapear códigos WMO para descrições pt-BR e formatar datas/números com `Intl`.
- **Critérios de aceite:** Códigos conhecidos têm texto; desconhecidos resultam em condição indisponível; datas e números usam locale `pt-BR`.
- **Requisitos relacionados:** FR-003, FR-004, NFR-001, AC-003.2, AC-004.2, AC-004.4.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/weather.ts`, `src/lib/formatting.ts`.
- **Tipo:** Data

### T-06 — Validar séries e datas do forecast

- **Descrição:** Validar números, faixas, datas ISO, timezone, cardinalidade, duplicidade e ordem dos cinco dias.
- **Critérios de aceite:** Cinco dias válidos são aceitos; séries curtas, duplicadas ou fora de ordem são rejeitadas; campos complementares ausentes não invalidam dados independentes.
- **Requisitos relacionados:** FR-004, NFR-007, AC-004.5, AC-004.6, AC-004.7, AC-OV-012.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/weather.ts`.
- **Tipo:** Data

## Entrega 3 — Services e acesso a dados

### T-07 — Implementar cliente HTTP Open-Meteo

- **Descrição:** Encapsular `fetch`, `AbortController`, timeout de dez segundos, parsing JSON e verificação HTTP.
- **Critérios de aceite:** O cliente diferencia sucesso, rede, HTTP, timeout, abort e JSON inválido; encerra em dez segundos; não expõe payload bruto.
- **Requisitos relacionados:** FR-006, NFR-003, NFR-004, NFR-006, AC-006.4, AC-006.6, AC-OV-007.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/services/openMeteoClient.ts`.
- **Tipo:** Data

### T-08 — Implementar service de geocoding

- **Descrição:** Consultar geocoding e converter a resposta validada para `City[]` ordenado.
- **Critérios de aceite:** Usa `name`, `count=10`, `language=pt` e `format=json`; valida campos obrigatórios e coordenadas; preserva região/timezone; resposta sem resultados retorna lista vazia.
- **Requisitos relacionados:** FR-001, AC-001.1, AC-001.2, AC-001.5, AC-001.7.
- **Dependências:** T-02, T-03, T-07.
- **Arquivos prováveis:** `src/services/geocodingService.ts`.
- **Tipo:** Data

### T-09 — Implementar service de forecast

- **Descrição:** Consultar forecast e mapear a resposta validada para `WeatherData`.
- **Critérios de aceite:** Usa coordenadas selecionadas, `current`, `daily`, `timezone=auto`, `forecast_days=5` e Celsius; mapeia campos para o modelo; registra `fetchedAt`; identifica dados incompletos.
- **Requisitos relacionados:** FR-002, FR-003, FR-004, AC-002.2, AC-003.1, AC-003.2, AC-004.1, AC-004.5, AC-004.7, AC-OV-012.
- **Dependências:** T-04, T-05, T-06, T-07.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Tipo:** Data

### T-10 — Implementar cache de forecast

- **Descrição:** Criar cache em memória por localidade, timezone e janela, com validade de trinta minutos.
- **Critérios de aceite:** Cache válido é lido; cache expirado não é servido; resposta nova substitui a anterior; entrada informa `fetchedAt` e idade; geocoding não é cacheado como weather.
- **Requisitos relacionados:** FR-006, NFR-004, AC-006.9, AC-OV-010.
- **Dependências:** T-01, T-09.
- **Arquivos prováveis:** `src/services/weatherCache.ts`.
- **Tipo:** Data

## Entrega 4 — Hook e orquestração

### T-11 — Implementar busca e seleção no hook

- **Descrição:** Criar `useWeather` para busca, estados de geocoding, seleção explícita e `operationId`.
- **Critérios de aceite:** Input vazio não chama service; busca válida publica loading e resultados; lista vazia publica empty; nenhuma cidade é escolhida implicitamente; resposta obsoleta é ignorada.
- **Requisitos relacionados:** FR-001, FR-002, FR-006, AC-001.4, AC-001.5, AC-002.1, AC-002.5, AC-006.2, AC-006.3, AC-OV-003, AC-OV-011.
- **Dependências:** T-02, T-08.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** Data

### T-12 — Integrar forecast e estados no hook

- **Descrição:** Integrar seleção de cidade, consulta weather, estados success/error/incomplete/cached, cancelamento e retry.
- **Critérios de aceite:** A seleção consulta somente a cidade escolhida; há no máximo uma operação ativa; timeout encerra loading; retry permite no máximo duas novas tentativas; cache válido pode ser servido após falha.
- **Requisitos relacionados:** FR-002, FR-006, NFR-004, AC-002.2, AC-002.4, AC-006.5, AC-006.6, AC-006.7, AC-006.8, AC-006.9, AC-OV-007, AC-OV-010, AC-OV-011.
- **Dependências:** T-09, T-10, T-11.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** Data

### T-13 — Integrar unidade no estado de apresentação

- **Descrição:** Adicionar unidade inicial Celsius e expor valores derivados sem alterar `WeatherData`.
- **Critérios de aceite:** Alternar unidade converte temperatura atual, sensação, mínimas e máximas; datas, condições, umidade e localização não mudam; a troca não dispara novo request.
- **Requisitos relacionados:** FR-005, AC-005.2, AC-005.3, AC-005.4, AC-005.5, AC-005.6, AC-OV-006.
- **Dependências:** T-04, T-12.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`, `src/lib/weather.ts`.
- **Tipo:** Data

## Entrega 5 — Componentes de UI

### T-14 — Criar composição inicial e estilos da UI

- **Descrição:** Preparar `App.tsx`, `main.tsx`, estilos globais e base mobile-first.
- **Critérios de aceite:** A aplicação inicializa; há áreas reservadas para busca, resultados, clima, forecast e atribuição; foco é visível; não há rolagem horizontal em 320 px.
- **Requisitos relacionados:** NFR-001, NFR-002, NFR-005, AC-OV-009.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/App.tsx`, `src/main.tsx`, `src/styles/index.css`, `tailwind.config.js`.
- **Tipo:** UI

### T-15 — Implementar formulário de busca

- **Descrição:** Criar campo, label, botão, envio por Enter e validação local.
- **Critérios de aceite:** Campo tem nome acessível; Enter e botão enviam; input vazio mostra orientação sem chamada; foco é visível; mensagens estão em pt-BR.
- **Requisitos relacionados:** FR-001, FR-007, AC-001.4, AC-006.3, AC-007.1, AC-007.2, AC-OV-003, AC-OV-008.
- **Dependências:** T-11, T-14.
- **Arquivos prováveis:** `src/components/SearchForm.tsx`.
- **Tipo:** UI

### T-16 — Implementar lista de resultados

- **Descrição:** Renderizar cidades selecionáveis com nome, região e país.
- **Critérios de aceite:** No máximo dez opções aparecem; cada opção é acionável por teclado e tem nome acessível; cidades homônimas são distinguíveis; seleção chama o hook.
- **Requisitos relacionados:** FR-001, FR-002, FR-007, AC-001.2, AC-001.3, AC-001.7, AC-002.1, AC-002.2, AC-007.1, AC-OV-002.
- **Dependências:** T-15.
- **Arquivos prováveis:** `src/components/LocationResults.tsx`.
- **Tipo:** UI

### T-17 — Implementar estados inicial, loading, vazio e erro

- **Descrição:** Criar componentes isolados para estados de operação e ação de retry.
- **Critérios de aceite:** Cada estado possui mensagem pt-BR; loading/erro usam live region; retry é acionável por teclado; estado inicial não sugere dados carregados.
- **Requisitos relacionados:** FR-006, FR-007, AC-006.1, AC-006.2, AC-006.4, AC-006.5, AC-007.1, AC-007.2, AC-OV-007, AC-OV-008.
- **Dependências:** T-12, T-14.
- **Arquivos prováveis:** `src/components/states/InitialState.tsx`, `src/components/states/LoadingState.tsx`, `src/components/states/EmptyState.tsx`, `src/components/states/ErrorState.tsx`.
- **Tipo:** UI

### T-18 — Implementar clima atual e controle de unidade

- **Descrição:** Renderizar cidade, temperatura, condição, complementares opcionais e controle Celsius/Fahrenheit.
- **Critérios de aceite:** Temperatura e condição aparecem em texto; sensação/umidade ausentes não inventam valores; unidade ativa é evidente; troca não faz request; labels e foco são acessíveis.
- **Requisitos relacionados:** FR-003, FR-005, FR-007, AC-003.1, AC-003.2, AC-003.3, AC-003.4, AC-003.5, AC-005.3, AC-005.4, AC-005.6, AC-007.3, AC-OV-004, AC-OV-006.
- **Dependências:** T-13, T-14.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`, `src/components/UnitToggle.tsx`.
- **Tipo:** UI

### T-19 — Implementar previsão diária

- **Descrição:** Renderizar os cinco dias com datas, mínimas, máximas, condições e indisponibilidades.
- **Critérios de aceite:** Exatamente cinco posições são distinguíveis; períodos válidos exibem os dados necessários; incompletos são identificados; informação não depende apenas de cor/ícone.
- **Requisitos relacionados:** FR-004, FR-007, AC-004.1, AC-004.2, AC-004.3, AC-004.4, AC-004.6, AC-007.3, AC-OV-005.
- **Dependências:** T-05, T-06, T-13, T-14.
- **Arquivos prováveis:** `src/components/ForecastList.tsx`.
- **Tipo:** UI

### T-20 — Implementar estados cached/incomplete e atribuição

- **Descrição:** Renderizar cache com idade, conteúdo incompleto, retry e atribuição Open-Meteo.
- **Critérios de aceite:** Cache mostra atualização e idade; conteúdo incompleto identifica indisponíveis; retry respeita limite; atribuição fica visível; nenhum componente acessa API diretamente.
- **Requisitos relacionados:** FR-006, NFR-007, AC-006.7, AC-006.8, AC-006.9, AC-OV-007, AC-OV-010.
- **Dependências:** T-17, T-19.
- **Arquivos prováveis:** `src/components/states/CachedState.tsx`, `src/components/states/IncompleteState.tsx`, `src/components/WeatherAttribution.tsx`.
- **Tipo:** UI

### T-21 — Conectar componentes ao App

- **Descrição:** Compor o hook e todos os componentes em `App.tsx`, respeitando as dependências de camadas.
- **Critérios de aceite:** `App.tsx` usa o hook como fonte de estado; componentes recebem dados/handlers por props; nenhum componente importa `openMeteoClient`; o fluxo de UI renderiza todos os estados definidos.
- **Requisitos relacionados:** NFR-007, AC-OV-001, AC-OV-007.
- **Dependências:** T-15, T-16, T-17, T-18, T-19, T-20.
- **Arquivos prováveis:** `src/App.tsx`.
- **Tipo:** UI

## Entrega 6 — Integração

### T-22 — Configurar fixtures e interceptação E2E

- **Descrição:** Preparar Playwright para interceptar geocoding e forecast com fixtures determinísticas.
- **Critérios de aceite:** Requests das duas APIs são interceptados; fixtures incluem cidade, forecast válido e respostas vazias; os testes não dependem da Open-Meteo real.
- **Requisitos relacionados:** NFR-004, NFR-007.
- **Dependências:** T-08, T-09, T-21.
- **Arquivos prováveis:** `tests/e2e/fixtures/`, `playwright.config.ts`.
- **Tipo:** Test

### T-23 — Integrar fluxo feliz de busca e forecast

- **Descrição:** Validar a integração funcional da busca, seleção explícita, clima atual e cinco dias.
- **Critérios de aceite:** Usuário pesquisa, seleciona uma cidade e visualiza dados da cidade correta; a tela exibe clima atual e exatamente cinco períodos; nenhuma cidade é selecionada implicitamente.
- **Requisitos relacionados:** FR-001, FR-002, FR-003, FR-004, AC-OV-001, AC-OV-002, AC-OV-004, AC-OV-005.
- **Dependências:** T-22.
- **Arquivos prováveis:** `tests/e2e/weather-app.spec.ts`.
- **Tipo:** Test

### T-24 — Integrar cenários de unidade e atribuição

- **Descrição:** Validar a troca de Celsius/Fahrenheit e a presença da atribuição no fluxo integrado.
- **Critérios de aceite:** Celsius é inicial; todos os valores de temperatura mudam ao alternar unidade; nenhuma nova chamada de forecast ocorre; atribuição Open-Meteo permanece visível.
- **Requisitos relacionados:** FR-005, AC-005.2, AC-005.3, AC-005.4, AC-005.6, AC-OV-006.
- **Dependências:** T-23.
- **Arquivos prováveis:** `tests/e2e/weather-app.spec.ts`.
- **Tipo:** Test

## Entrega 7 — Testes

### T-25 — Testar conversão de unidade com Vitest

- **Descrição:** Testar exclusivamente a conversão Celsius/Fahrenheit e o arredondamento da função pura.
- **Critérios de aceite:** Casos cobrem Celsius sem alteração, Fahrenheit pela fórmula padrão, valores negativos, arredondamento e valores inválidos; nenhum teste dispara `fetch`; `pnpm test` passa.
- **Requisitos relacionados:** FR-005, AC-005.3, AC-005.5, AC-005.6, AC-OV-006.
- **Dependências:** T-04.
- **Arquivos prováveis:** `tests/lib/weather-conversion.test.ts`.
- **Tipo:** Test

### T-26 — Testar cliente HTTP com fetch mockado

- **Descrição:** Cobrir transporte, erros técnicos, timeout e abort sem envolver services de domínio.
- **Critérios de aceite:** Mocks cobrem sucesso, HTTP, rede, timeout, abort e JSON inválido; timeout ocorre em dez segundos simulados; erros públicos não expõem payload; `pnpm test` passa.
- **Requisitos relacionados:** FR-006, NFR-003, NFR-004, AC-006.4, AC-006.6, AC-OV-007.
- **Dependências:** T-07.
- **Arquivos prováveis:** `tests/services/openMeteoClient.test.ts`.
- **Tipo:** Test

### T-27 — Testar services com mock de fetch

- **Descrição:** Cobrir geocoding e forecast usando `fetch` mockado e fixtures separadas, sem rede real.
- **Critérios de aceite:** O mock verifica URL e parâmetros; geocoding cobre vazio, homônimos, campos inválidos e mais de dez resultados; forecast cobre sucesso, campos ausentes, séries curtas, datas inválidas e timezone inválido; nenhum payload inválido chega ao modelo.
- **Requisitos relacionados:** FR-001, FR-003, FR-004, NFR-007, AC-001.5, AC-001.7, AC-003.4, AC-004.5, AC-004.7, AC-OV-012.
- **Dependências:** T-08, T-09.
- **Arquivos prováveis:** `tests/services/geocodingService.test.ts`, `tests/services/weatherService.test.ts`, `tests/fixtures/`.
- **Tipo:** Test

### T-28 — Testar o hook e a máquina de estados

- **Descrição:** Testar `useWeather` com services falsos e respostas controladas.
- **Critérios de aceite:** Cobertura inclui idle, loading, success, empty, error, incomplete e cached; verifica retry máximo, cache, nova busca, concorrência, resposta obsoleta e unidade sem novo request.
- **Requisitos relacionados:** FR-002, FR-005, FR-006, NFR-007, AC-002.5, AC-005.3, AC-006.1, AC-006.2, AC-006.7, AC-006.9, AC-OV-006, AC-OV-007, AC-OV-011, AC-OV-012.
- **Dependências:** T-10, T-11, T-12, T-13.
- **Arquivos prováveis:** `tests/hooks/useWeather.test.ts`.
- **Tipo:** Test

### T-29 — Testar componentes nos estados principais

- **Descrição:** Testar componentes com Testing Library nos estados `loading`, `error`, `empty` e `success`, incluindo acessibilidade básica.
- **Critérios de aceite:** Existem casos explícitos para `loading`, `error`, `empty` e `success`; roles, labels, live regions, foco, teclado e textos pt-BR são verificados; os testes não dependem da rede; `pnpm test` passa.
- **Requisitos relacionados:** FR-006, FR-007, NFR-005, AC-006.1, AC-006.2, AC-006.3, AC-006.4, AC-006.9, AC-007.1, AC-007.2, AC-007.3, AC-007.4, AC-OV-007, AC-OV-008.
- **Dependências:** T-15, T-16, T-17, T-18, T-19, T-20, T-21.
- **Arquivos prováveis:** `tests/components/`.
- **Tipo:** Test

### T-30 — Testar resiliência E2E

- **Descrição:** Testar entrada vazia, sem resultados, erro, timeout, retry, cache e resposta atrasada.
- **Critérios de aceite:** Mensagens correspondem aos estados; retry para após duas novas tentativas; cache válido mostra idade; resposta atrasada não sobrescreve a operação atual; nova busca permanece disponível.
- **Requisitos relacionados:** FR-001, FR-002, FR-006, NFR-004, AC-001.4, AC-001.5, AC-002.5, AC-006.3, AC-006.4, AC-006.5, AC-006.6, AC-006.7, AC-006.8, AC-006.9, AC-OV-003, AC-OV-007, AC-OV-010, AC-OV-011, AC-OV-012.
- **Dependências:** T-23, T-22.
- **Arquivos prováveis:** `tests/e2e/weather-resilience.spec.ts`, `tests/e2e/fixtures/`.
- **Tipo:** Test

### T-31 — Testar fluxo principal e viewport mobile com Playwright

- **Descrição:** Executar o fluxo E2E principal e repetir a validação nos viewports mobile, tablet e desktop.
- **Critérios de aceite:** Usuário pesquisa, seleciona uma cidade e visualiza clima atual e cinco dias; o fluxo roda em 320, 768 e 1280 px; não há rolagem horizontal; controles permanecem legíveis; busca, seleção e unidade funcionam por teclado; foco é visível.
- **Requisitos relacionados:** FR-005, FR-006, FR-007, NFR-002, NFR-005, AC-007.1, AC-007.4, AC-OV-008, AC-OV-009.
- **Dependências:** T-23, T-24, T-30.
- **Arquivos prováveis:** `tests/e2e/responsive-accessibility.spec.ts`.
- **Tipo:** Test

## Entrega 8 — Hardening e entrega

### T-32 — Adicionar telemetria sanitizada

- **Descrição:** Expor interface injetável para eventos agregados de busca, erro, timeout, duração e cache.
- **Critérios de aceite:** Eventos possuem operação, status, duração e erro sanitizado; não registram busca bruta, coordenadas precisas, payloads ou PII; mensagens públicas não vazam detalhes internos.
- **Requisitos relacionados:** NFR-003, NFR-006, NFR-007.
- **Dependências:** T-12, T-21.
- **Arquivos prováveis:** `src/services/telemetry.ts`, `src/hooks/useWeather.ts`.
- **Tipo:** Infra

### T-33 — Testar telemetria e hardening

- **Descrição:** Verificar sanitização, timeout, abort, concorrência e limites de retry/cache.
- **Critérios de aceite:** Eventos proibidos não são emitidos; timeout/abort não deixam loading preso; respostas obsoletas são ignoradas; retry e cache respeitam os limites; testes passam sem rede.
- **Requisitos relacionados:** NFR-004, NFR-006, NFR-007, AC-006.6, AC-006.7, AC-006.9, AC-OV-007, AC-OV-011, AC-OV-012.
- **Dependências:** T-30, T-32.
- **Arquivos prováveis:** `tests/services/telemetry.test.ts`, `tests/hooks/useWeather.test.ts`.
- **Tipo:** Test

### T-34 — Executar validação final

- **Descrição:** Executar lint, build, testes unitários e E2E após todas as entregas.
- **Critérios de aceite:** `pnpm lint`, `pnpm build`, `pnpm test` e `pnpm test:e2e` passam; não há erros TypeScript; critérios funcionais, acessibilidade e viewport estão verificados.
- **Requisitos relacionados:** FR-001 a FR-007, NFR-001 a NFR-007, AC-OV-001 a AC-OV-012.
- **Dependências:** T-25, T-26, T-27, T-28, T-29, T-30, T-31, T-33.
- **Arquivos prováveis:** `package.json`, `biome.json` e arquivos apontados pelos comandos.
- **Tipo:** Test

## Matriz de rastreabilidade funcional

| Requisito da spec | Tarefas de implementação | Tarefas de teste/validação | Cobertura |
| --- | --- | --- | --- |
| **FR-001 — Buscar cidade** | T-02, T-03, T-08, T-11, T-15, T-16 | T-23, T-25, T-27, T-29, T-30 | Coberto |
| **FR-002 — Selecionar localidade e consultar dados** | T-09, T-11, T-12, T-16, T-21 | T-23, T-28, T-30 | Coberto |
| **FR-003 — Exibir clima atual** | T-05, T-09, T-12, T-18, T-21 | T-23, T-27, T-29 | Coberto |
| **FR-004 — Exibir previsão de cinco dias** | T-05, T-06, T-09, T-19, T-21 | T-23, T-27, T-29, T-31 | Coberto |
| **FR-005 — Alternar unidade de temperatura** | T-04, T-13, T-18, T-21 | T-24, T-25, T-28, T-31 | Coberto |
| **FR-006 — Comunicar estados da aplicação** | T-07, T-10, T-12, T-17, T-20, T-21 | T-26, T-28, T-29, T-30, T-33 | Coberto |
| **FR-007 — Navegação e leitura acessíveis** | T-05, T-15, T-16, T-17, T-18, T-19, T-21 | T-29, T-31, T-34 | Coberto |

### Requisitos ainda sem tarefa correspondente

Não há requisito funcional `FR-001` a `FR-007` sem tarefa correspondente. Todos possuem pelo menos uma tarefa de implementação e uma tarefa de teste ou validação.

Os seguintes detalhes de critérios de aceite devem permanecer explícitos durante a implementação, embora estejam cobertos indiretamente pelas tarefas indicadas:

- `AC-003.6`: T-09 e T-18 devem verificar que data e hora usam o timezone da cidade e são formatadas em `pt-BR`.
- `AC-007.4`: T-03, T-29 e T-31 devem incluir a verificação do contraste mínimo de 4,5:1, além do foco visível.
- `AC-006.2`: T-12, T-17 e T-29 devem verificar que o loading aparece em até 200 ms e impede ações duplicadas.