# Especificação de Produto — Weather App

## Overview

### Visão do produto

O Weather App é uma aplicação web de consulta rápida de condições meteorológicas. Usuários podem buscar uma cidade, visualizar o clima atual e consultar a previsão diária dos próximos cinco dias, com temperaturas em Celsius ou Fahrenheit.

A experiência deve ser simples, rápida e legível, com prioridade para smartphones e suporte funcional a tablets e desktops. O produto será disponibilizado em pt-BR, sem exigir cadastro ou autenticação.

### Objetivos

- Permitir que uma pessoa encontre uma cidade e entenda sua condição climática em uma única sessão curta.
- Apresentar clima atual e previsão de cinco dias de forma comparável e fácil de ler.
- Reduzir confusão em buscas por cidades com nomes iguais por meio de contexto regional.
- Oferecer escolha explícita entre Celsius e Fahrenheit.
- Manter uma experiência compreensível quando a rede ou a fonte de dados estiver indisponível.

### Público e personas

- **Pessoa em movimento:** precisa consultar o clima rapidamente antes de sair, deslocar-se ou viajar, normalmente pelo celular.
- **Usuário cotidiano:** acompanha a temperatura e os próximos dias para planejar a rotina, em celular ou desktop.
- **Viajante ou turista:** pesquisa uma cidade de destino, inclusive em conexão instável, e precisa distinguir corretamente a localidade encontrada.

### Escopo do MVP

O MVP cobre busca manual por cidade, seleção de localidade, clima atual, previsão diária de cinco dias, alternância de unidade e tratamento explícito de carregamento, erro e ausência de dados. A fonte de dados prevista é a Open-Meteo, sem exigência de chave de API.

### Decisões de produto

- A busca aceita texto livre, mas não usa geolocalização, favoritos ou histórico persistente.
- A previsão é diária e consiste no dia local atual mais os quatro dias seguintes.
- A unidade inicial é Celsius. A preferência vale enquanto a página estiver aberta e não é persistida entre sessões.
- A interface e as mensagens são exclusivamente pt-BR no MVP; datas e números usam `Intl` com locale `pt-BR`.
- A aplicação pode usar cache em memória por sessão. Não há armazenamento em servidor nem exigência de funcionamento offline.
- A aplicação deve exibir atribuição da Open-Meteo conforme os termos vigentes do serviço, sem bloquear o fluxo principal.

### Contrato mínimo de dados

- Geocodificação: cada resultado deve fornecer identificador estável, nome da cidade, latitude, longitude e país; estado ou região e fuso horário devem ser usados quando disponíveis.
- Previsão: a consulta deve solicitar fuso horário local, temperatura atual, sensação térmica, umidade, código de condição atual e séries diárias de data, mínima, máxima e código de condição.
- A camada de serviço deve validar tipos, cardinalidade, datas ISO e valores finitos antes de entregar dados à interface. Payload ausente, malformado ou incompatível é erro de resposta, não estado de sucesso parcial silencioso.
- Códigos meteorológicos devem ser convertidos para descrições textuais pt-BR e permanecer acompanhados de texto acessível; a interface não depende somente de ícones.

### Regras transversais de comportamento

- Uma requisição recebe um identificador lógico formado por tipo da consulta, texto normalizado ou coordenadas, unidade da fonte e parâmetros da previsão.
- A resposta só pode atualizar a tela se ainda corresponder à requisição ativa mais recente. Consultas obsoletas devem ser canceladas quando possível ou ignoradas quando concluídas.
- O cache de clima usa localidade, fuso horário e janela solicitada como chave, tem validade máxima de 30 minutos e nunca substitui uma resposta mais nova bem-sucedida.
- Em falha de rede ou timeout, dados de clima em cache dentro da validade podem ser exibidos com o estado “Dados armazenados”, data/hora da atualização e idade. Resultados de geocodificação não devem ser usados como clima em cache.
- Cada operação deve ter no máximo uma execução ativa por vez. O limite de duas novas tentativas manuais é por operação de clima que falhou; uma nova busca de cidade inicia uma nova operação e não herda esse contador.

## Functional Requirements

### FR-001 — Buscar cidade

O sistema deve permitir que o usuário pesquise uma cidade pelo nome e apresente resultados relevantes para seleção.

Os resultados devem aceitar nomes com acentos e diferenças de maiúsculas e minúsculas, ignorar espaços excedentes e ser ordenados pela maior correspondência textual, com contexto regional para desempate. A lista deve exibir no máximo 10 resultados.

**Critérios de aceite do requisito:**

- **AC-001.1:** Dado que o usuário informa um nome de cidade válido e envia a busca, o sistema apresenta uma lista de resultados correspondentes ou informa que não encontrou resultados.
- **AC-001.2:** Cada resultado apresenta contexto suficiente para diferenciar localidades, incluindo, quando disponível, cidade, estado ou região e país.
- **AC-001.3:** Quando existem duas ou mais localidades com o mesmo nome, o sistema mantém os resultados separados e permite a seleção explícita de uma delas.
- **AC-001.4:** Quando a consulta está vazia ou contém apenas espaços, o sistema não realiza uma busca e apresenta uma orientação clara para informar uma cidade.
- **AC-001.5:** Quando a entrada é inválida ou não há resultados, o sistema comunica o problema em pt-BR sem apresentar dados de uma cidade diferente.
- **AC-001.6:** A busca por uma cidade com acentos, letras maiúsculas ou espaços excedentes retorna os mesmos resultados da forma normalizada do nome.
- **AC-001.7:** A lista de resultados exibe no máximo 10 opções, ordenadas pela correspondência com a consulta e diferenciadas por cidade, região e país quando disponíveis.

### FR-002 — Selecionar localidade e consultar dados

O sistema deve permitir que o usuário selecione um resultado de busca e consulte os dados meteorológicos correspondentes à localidade escolhida.

**Critérios de aceite do requisito:**

- **AC-002.1:** Ao selecionar um resultado, o sistema identifica visualmente a cidade escolhida antes ou junto da exibição dos dados meteorológicos.
- **AC-002.2:** Os dados exibidos pertencem à localidade selecionada e não à primeira opção da lista por seleção implícita.
- **AC-002.3:** Durante a consulta dos dados meteorológicos, o sistema informa que o carregamento está em andamento e evita apresentar os dados como completos antes da resposta.
- **AC-002.4:** Se a consulta não puder ser concluída, o sistema informa que os dados não estão disponíveis e oferece uma ação de tentar novamente quando a recuperação for possível.
- **AC-002.5:** Se uma nova busca for enviada antes da conclusão da anterior, somente os resultados da busca mais recente podem atualizar a interface.

### FR-003 — Exibir clima atual

Para a localidade selecionada, o sistema deve apresentar as condições climáticas atuais, incluindo no mínimo temperatura e condição geral do tempo.

A data e o horário devem ser interpretados no fuso horário retornado para a localidade. Temperatura atual e condição geral são obrigatórias; sensação térmica e umidade são complementares.

**Critérios de aceite do requisito:**

- **AC-003.1:** Com dados válidos, a tela exibe a temperatura atual com valor numérico e unidade visível.
- **AC-003.2:** Com dados válidos, a tela exibe uma descrição ou representação compreensível da condição geral do tempo.
- **AC-003.3:** Quando disponíveis, sensação térmica e umidade são exibidas como informações complementares identificadas.
- **AC-003.4:** Quando um dado complementar não estiver disponível, a interface não inventa um valor nem quebra a exibição dos demais dados válidos.
- **AC-003.5:** A cidade e a unidade atualmente usada permanecem identificáveis na área de clima atual.
- **AC-003.6:** A data e o horário exibidos correspondem ao fuso horário da localidade selecionada e são apresentados em formato pt-BR.

### FR-004 — Exibir previsão de cinco dias

O sistema deve disponibilizar uma previsão diária para cinco dias, definida como o dia atual mais os quatro dias seguintes.

Cada período deve informar data, temperatura mínima, temperatura máxima e condição geral. As datas devem seguir o fuso horário da localidade e ser exibidas em formato pt-BR.

**Critérios de aceite do requisito:**

- **AC-004.1:** Com dados válidos, a interface exibe exatamente cinco períodos diários consecutivos, começando no dia atual.
- **AC-004.2:** Cada período informa uma data ou dia da semana e apresenta dados suficientes para comparação rápida da previsão.
- **AC-004.3:** Cada período apresenta temperatura com a unidade atualmente selecionada e uma condição geral do tempo, quando esses dados estiverem disponíveis.
- **AC-004.4:** Os cinco períodos são visualmente distinguíveis e podem ser compreendidos sem depender apenas de cor, ícone ou posição.
- **AC-004.5:** Se a fonte fornecer menos de cinco dias ou dados incompatíveis, o sistema informa que a previsão está incompleta em vez de preencher períodos com dados inventados.
- **AC-004.6:** Cada período válido exibe temperatura mínima, temperatura máxima e condição geral; se um período não possuir esses dados essenciais, ele é identificado como indisponível.
- **AC-004.7:** A previsão não exibe datas duplicadas, fora de ordem ou pertencentes a um fuso diferente do da localidade selecionada.

### FR-005 — Alternar unidade de temperatura

O sistema deve permitir a alternância entre Celsius e Fahrenheit e refletir a escolha em todos os valores de temperatura exibidos.

A conversão deve usar a fórmula padrão entre as escalas e arredondar os valores para o número inteiro mais próximo. A unidade deve ser aplicada à temperatura atual, mínima, máxima e sensação térmica quando disponíveis.

**Critérios de aceite do requisito:**

- **AC-005.1:** O usuário consegue escolher Celsius ou Fahrenheit a partir de um controle claramente identificável.
- **AC-005.2:** Celsius é a unidade inicial quando não existe uma preferência previamente definida na sessão.
- **AC-005.3:** Ao trocar a unidade, o clima atual e todos os cinco períodos da previsão passam a exibir a unidade escolhida sem exigir nova busca da cidade.
- **AC-005.4:** A unidade ativa fica visualmente evidente e é indicada junto aos valores ou no controle de unidade.
- **AC-005.5:** A conversão mantém os valores coerentes entre Celsius e Fahrenheit e não altera a localidade ou os demais dados meteorológicos.
- **AC-005.6:** A troca de unidade converte todos os campos de temperatura visíveis, aplica arredondamento consistente e não modifica datas, condições ou umidade.

### FR-006 — Comunicar estados da aplicação

O sistema deve tratar e comunicar de forma clara os estados de carregamento, sucesso, vazio e erro nas buscas e consultas meteorológicas.

Cada operação de rede deve atingir timeout após 10 segundos. Após uma falha de uma operação de clima, o usuário pode iniciar até duas novas tentativas manuais; uma tentativa não deve duplicar chamadas enquanto a anterior estiver em andamento. Uma nova busca de cidade inicia uma nova operação e não deve ser bloqueada pelo limite de retry da operação anterior.

**Critérios de aceite do requisito:**

- **AC-006.1:** Antes da primeira busca, a interface apresenta um estado inicial compreensível, sem sugerir que existem dados carregados.
- **AC-006.2:** Durante uma busca ou consulta, a interface apresenta um indicador ou mensagem de carregamento e evita ações duplicadas que possam gerar confusão.
- **AC-006.3:** Para uma busca sem resultados, a interface apresenta uma mensagem orientativa e mantém o usuário apto a fazer nova busca.
- **AC-006.4:** Para falha de rede, timeout, falha da fonte ou resposta inválida, a interface apresenta uma mensagem clara, sem expor detalhes técnicos indevidos.
- **AC-006.5:** Depois de um erro recuperável, o usuário consegue tentar novamente sem recarregar obrigatoriamente a página.
- **AC-006.6:** Se uma consulta ultrapassar 10 segundos, a interface encerra o carregamento, informa que a consulta demorou além do limite e disponibiliza nova tentativa.
- **AC-006.7:** Após uma falha, a interface permite no máximo duas novas tentativas manuais e não inicia chamadas duplicadas enquanto uma tentativa estiver em andamento.
- **AC-006.8:** Ao exceder o limite de tentativas de clima, a interface mantém a busca disponível e orienta o usuário a pesquisar novamente ou retornar mais tarde; nenhum retry automático é realizado.
- **AC-006.9:** Se houver cache de clima válido após falha, a interface pode exibi-lo somente com indicação explícita de que é armazenado, sua data/hora de atualização e sua idade; cache expirado não é exibido como dado atual.

### FR-007 — Garantir navegação e leitura acessíveis

A interface deve permitir que as ações e informações principais sejam utilizadas por teclado e compreendidas por tecnologias assistivas.

O MVP deve atender às recomendações WCAG 2.2 nível AA aplicáveis à interface, incluindo contraste mínimo de 4,5:1 para texto normal e foco visível.

**Critérios de aceite do requisito:**

- **AC-007.1:** O campo de busca, o envio da busca, os resultados selecionáveis, o controle de unidade e a ação de tentar novamente podem ser alcançados e acionados por teclado.
- **AC-007.2:** Os controles possuem nomes acessíveis e os estados de carregamento e erro são comunicados de forma identificável por tecnologias assistivas.
- **AC-007.3:** A informação meteorológica não depende exclusivamente de cor ou de ícones sem texto para ser compreendida.
- **AC-007.4:** O contraste de texto normal atende no mínimo 4,5:1, os controles têm foco visível e todos os fluxos principais são operáveis sem mouse.

## User Stories

- **US-001:** Como Pessoa em movimento / profissional correndo contra o tempo, quero buscar uma cidade rapidamente para entender as condições do tempo antes de sair. **Requisito relacionado:** FR-001 — Buscar cidade.
- **US-002:** Como Usuário ocasional / viajante ou turista, quero diferenciar cidades com o mesmo nome para consultar a previsão do destino correto. **Requisito relacionado:** FR-001 — Buscar cidade.
- **US-003:** Como Usuário cotidiano / planejador de rotina, quero visualizar o clima atual da cidade selecionada para decidir roupas, deslocamentos e atividades do dia. **Requisito relacionado:** FR-002 — Selecionar localidade e consultar dados; FR-003 — Exibir clima atual.
- **US-004:** Como Usuário cotidiano / planejador de rotina, quero consultar a previsão dos próximos cinco dias para planejar compromissos e comparar as condições de cada dia. **Requisito relacionado:** FR-004 — Exibir previsão de cinco dias.
- **US-005:** Como Usuário ocasional / viajante ou turista, quero alternar entre Celsius e Fahrenheit para interpretar a temperatura de acordo com minha preferência. **Requisito relacionado:** FR-005 — Alternar unidade de temperatura.
- **US-006:** Como Usuário ocasional / viajante ou turista, quero receber mensagens claras quando a rede ou a fonte de dados falhar para saber como continuar a consulta. **Requisito relacionado:** FR-006 — Comunicar estados da aplicação.
- **US-007:** Como Usuário cotidiano / planejador de rotina, quero navegar pelos controles e compreender os dados meteorológicos por teclado ou tecnologia assistiva para consultar a previsão com autonomia. **Requisito relacionado:** FR-007 — Garantir navegação e leitura acessíveis.

## Acceptance Criteria

A entrega atende ao MVP quando todos os critérios abaixo forem verificáveis em uma execução funcional do produto:

- **AC-OV-001:** Uma pessoa consegue pesquisar uma cidade válida, selecionar uma localidade e visualizar o clima atual e a previsão de cinco dias.
- **AC-OV-002:** Uma busca por cidade ambígua apresenta contexto regional e exige uma seleção explícita antes de carregar os dados.
- **AC-OV-003:** Uma busca vazia, inválida ou sem resultados produz feedback em pt-BR e permite nova tentativa.
- **AC-OV-004:** A tela de clima atual mostra, no mínimo, cidade selecionada, temperatura, unidade e condição geral do tempo.
- **AC-OV-005:** A previsão apresenta o dia atual e os quatro dias seguintes, com cada dia distinguível e comparável.
- **AC-OV-006:** A troca de Celsius para Fahrenheit e de volta para Celsius atualiza todos os valores de temperatura visíveis sem nova busca.
- **AC-OV-007:** Carregamento, erro de rede, timeout, resposta inválida e ausência de dados possuem estados compreensíveis e não deixam a interface em estado ambíguo.
- **AC-OV-008:** Os fluxos principais podem ser concluídos por teclado e os elementos essenciais possuem nomes acessíveis.
- **AC-OV-009:** A interface continua legível e utilizável nos viewports de 320 px, 768 px e 1280 px de largura, sem exigir rolagem horizontal para acessar informações, controles essenciais ou os cinco períodos.
- **AC-OV-010:** Quando dados em cache forem exibidos após falha da fonte, a interface informa que os dados são armazenados e mostra sua idade, desde que tenham no máximo 30 minutos.
- **AC-OV-011:** Uma resposta atrasada de uma busca ou consulta anterior não altera os resultados, localidade ou clima associados à operação mais recente.
- **AC-OV-012:** Payloads inválidos, datas duplicadas ou dados essenciais ausentes produzem estado de erro ou incompleto identificável, sem valores inventados e sem falha não tratada da interface.

## Non-Functional Requirements

### NFR-001 — Usabilidade

- A busca e a leitura do resultado devem exigir poucos passos e não depender de conhecimento prévio do produto.
- A hierarquia visual deve priorizar cidade, clima atual, unidade e previsão de cinco dias.
- Mensagens, rótulos e instruções da interface devem estar em pt-BR e usar linguagem direta.

### NFR-002 — Responsividade

- O produto deve funcionar em smartphones, tablets e desktops.
- Em telas pequenas, texto, controles e informações meteorológicas devem permanecer legíveis, acionáveis e sem sobreposição.
- A previsão deve continuar comparável sem exigir rolagem horizontal.

### NFR-003 — Performance percebida

- A interface deve fornecer feedback imediato ao iniciar uma busca ou consulta.
- A aplicação deve evitar chamadas repetidas desnecessárias para a mesma solicitação durante uma sessão.
- O estado de carregamento deve aparecer em até 200 ms após o início de uma busca ou consulta.
- Em condições normais de rede, a primeira informação útil deve aparecer em até 3 segundos no percentil 95.
- O tempo de resposta e as falhas de integração devem ser mensuráveis pela equipe para orientar melhorias futuras. A duração deve ser medida do início da operação até sucesso, erro ou timeout, separando geocodificação e previsão.
- O orçamento de interface para o fluxo de busca é: resposta de geocodificação em até 2 segundos e primeira renderização útil do clima em até 3 segundos no percentil 95, em condições normais de rede. O timeout de 10 segundos prevalece quando a fonte não responde.

### NFR-004 — Confiabilidade e resiliência

- Falhas de rede, timeout, indisponibilidade da fonte e respostas incompletas não devem quebrar a interface inteira.
- O usuário deve sempre receber um estado compreensível e, quando aplicável, uma forma de tentar novamente.
- Dados incompletos devem ser identificados; o produto não deve apresentar valores inventados ou misturar dados de localidades diferentes.
- Quando houver dados recentes em cache, a aplicação pode exibi-los durante uma falha, mas deve indicar que são dados armazenados e informar sua idade.

### NFR-005 — Acessibilidade

- A navegação principal deve funcionar por teclado.
- Elementos interativos devem ter semântica e nomes acessíveis.
- A interface deve atender às recomendações WCAG 2.2 nível AA aplicáveis, incluindo contraste mínimo de 4,5:1 para texto normal e foco visível.
- Informações essenciais devem estar disponíveis em texto, sem depender apenas de cor, forma ou ícone.

### NFR-006 — Segurança e privacidade

- A aplicação não deve exigir cadastro, autenticação ou coleta de dados pessoais no MVP.
- Comunicações com serviços externos devem usar transporte seguro quando suportado pelo ambiente.
- Mensagens de erro não devem expor credenciais, detalhes internos ou dados sensíveis.

### NFR-007 — Manutenibilidade e observabilidade

- A solução deve manter responsabilidades de apresentação, consulta de dados e regras de transformação separadas o suficiente para permitir evolução segura.
- Erros de consulta, falhas da fonte e métricas relevantes de desempenho devem ser identificáveis pela equipe responsável, respeitando a ausência de coleta de dados pessoais definida para o MVP.
- A observabilidade deve registrar apenas eventos agregados de busca, erro, timeout e duração, sem registrar credenciais, payloads completos, texto de busca bruto, coordenadas precisas ou dados que identifiquem o usuário; os registros devem ser mantidos por no máximo 30 dias.
- Os eventos mínimos são `geocoding_started`, `geocoding_succeeded`, `geocoding_empty`, `weather_succeeded`, `request_failed`, `request_timeout` e `cache_served`, com duração, tipo de operação, status e código de erro sanitizado quando aplicável.
- A separação entre serviços, transformação de dados e UI deve permitir testes unitários das regras de normalização, conversão de unidade, validação de payload e seleção da resposta mais recente sem depender da rede.

## Edge Cases

- **Cidade inexistente:** a aplicação deve informar em pt-BR que a cidade não foi encontrada, não carregar dados de outra localidade e manter o campo disponível para nova busca.
- **Input vazio:** a aplicação não deve realizar chamada à API para uma consulta vazia ou composta apenas por espaços; deve orientar o usuário a informar uma cidade válida e permitir nova tentativa.
- **Caracteres especiais:** a aplicação deve aceitar acentos e caracteres normalmente usados em nomes de cidades, normalizar espaços desnecessários e rejeitar entradas inválidas sem quebrar a interface.
- Cidade com nomes repetidos em diferentes estados, regiões ou países.
- Busca que retorna muitos resultados ou nenhum resultado.
- Usuário seleciona um resultado enquanto a busca ainda está carregando.
- Usuário tenta iniciar nova busca enquanto a anterior está em andamento.
- **Falha de API:** a aplicação deve exibir um estado de erro amigável, sem detalhes técnicos indevidos, preservar a possibilidade de nova busca e oferecer a ação de tentar novamente quando aplicável.
- **Timeout:** a aplicação deve encerrar a espera após um limite configurado, informar que a consulta demorou mais que o esperado e permitir nova tentativa sem exigir recarregamento da página.
- Perda de conexão antes da busca, durante a geocodificação ou durante a consulta meteorológica.
- **Geocoding sem resultados:** a aplicação deve exibir uma mensagem específica de ausência de resultados, não iniciar a consulta meteorológica e permitir que o usuário refine ou substitua a busca.
- **Resposta parcial:** a aplicação deve exibir somente os dados válidos, identificar as informações indisponíveis e nunca inventar valores. Temperatura atual, condição geral do tempo, localidade selecionada e os cinco períodos da previsão são dados essenciais; se algum deles faltar, a aplicação deve marcar o conteúdo como incompleto ou indisponível e permitir nova tentativa.
- Se faltar apenas um campo complementar, como umidade ou sensação térmica, os demais dados válidos continuam visíveis.
- Se faltar temperatura atual ou condição geral, o clima atual deve ser marcado como indisponível.
- Se faltar temperatura mínima, máxima ou condição geral de um período, somente esse período deve ser marcado como indisponível; os demais períodos válidos continuam visíveis.
- Resposta com menos de cinco dias, períodos duplicados ou datas fora de ordem.
- Falha ao interpretar unidade ou valores meteorológicos fora de uma faixa plausível.
- Alternância de unidade durante o carregamento ou após uma falha.
- Uso em orientação retrato e paisagem em telas pequenas.
- Navegação apenas por teclado e uso com leitor de tela.
- Repetição da mesma consulta na sessão, inclusive após uma falha temporária.
- Consulta meteorológica além de 10 segundos e duas novas tentativas manuais após falha.
- Exibição de dados em cache deve informar a idade e não pode ocorrer depois de 30 minutos da atualização original.
- A interface deve ser validada em viewports de 320 px, 768 px e 1280 px de largura, sem rolagem horizontal para acessar os controles essenciais ou os cinco períodos.

## Assumptions

- A fonte principal do MVP será a Open-Meteo e fornecerá dados de geocodificação, clima atual e previsão diária sem chave de API.
- “Previsão de cinco dias” significa o dia atual mais os quatro dias seguintes.
- Celsius será a unidade padrão inicial; a persistência da preferência entre sessões ainda não foi definida.
- O idioma inicial da interface será pt-BR.
- A busca manual por cidade é suficiente para o MVP; geolocalização automática não é necessária para a primeira versão.
- O produto será uma aplicação web sem backend próprio obrigatório e sem persistência de dados em servidor.
- O usuário pode utilizar o produto sem cadastro, autenticação ou perfil.
- Cache temporário durante a sessão pode ser usado para reduzir chamadas repetidas, com validade máxima de 30 minutos. Dados em cache devem exibir sua idade e ser descartados após a validade.
- A aplicação será principalmente online, mas deve comunicar de forma útil a indisponibilidade da rede ou da fonte externa.
- A prioridade de validação será o uso em smartphones, sem excluir tablets e desktops.

## Risks

| Risco | Probabilidade | Impacto | Mitigação |
| --- | --- | --- | --- |
| Indisponibilidade, lentidão ou mudança de contrato da fonte externa | Alta | Alto | Validar respostas, tratar timeout e falhas, oferecer retry e monitorar erros de integração. |
| Seleção incorreta em cidades ambíguas | Média | Alto | Mostrar cidade, região e país nos resultados e exigir escolha explícita. |
| Dados meteorológicos incompletos ou inconsistentes | Média | Alto | Validar campos essenciais, distinguir ausência de dados e evitar valores inventados. |
| Interface sobrecarregada em telas pequenas | Média | Alto | Priorizar clima atual, manter hierarquia clara e validar em diferentes larguras de tela. |
| Confusão entre Celsius e Fahrenheit | Média | Médio | Exibir unidade ativa junto aos valores e atualizar toda a interface de forma consistente. |
| Rede instável durante uma consulta | Alta | Médio | Mostrar estados de carregamento e erro, permitir retry e reduzir chamadas repetidas. |
| Falhas de acessibilidade não percebidas em validação visual | Média | Alto | Testar teclado, semântica, nomes acessíveis, contraste e compreensão sem cor ou ícone. |
| Expansão do escopo com favoritos, histórico ou geolocalização | Alta | Médio | Manter essas capacidades fora do MVP e registrá-las como decisões futuras. |
| Critérios de sucesso pouco objetivos | Média | Médio | Acompanhar os critérios de aceite e definir métricas de desempenho e sucesso após responder as perguntas abertas. |

## Out of Scope

- Cadastro, autenticação, perfis e sincronização de preferências em servidor.
- Geolocalização automática ou solicitação de permissão de localização.
- Favoritos, histórico persistente de cidades e notificações meteorológicas.
- Previsão horária ou detalhamento além da previsão diária de cinco dias.
- Alertas severos, radar, mapas, imagens de satélite ou dados meteorológicos especializados.
- Integração com calendários, viagens, roupas, recomendações personalizadas ou automações.
- Suporte multilíngue e localização completa para outros países nesta versão.
- Funcionamento offline garantido com sincronização posterior.
- Administração, edição manual ou correção dos dados fornecidos pela fonte externa.
- Backend próprio, armazenamento de dados pessoais ou analytics identificável do usuário.

## Open Questions

Não há decisões bloqueadoras para o MVP. Os itens abaixo são decisões futuras e não devem ampliar o escopo da implementação atual:

1. Persistir a unidade entre sessões.
2. Suportar outros idiomas, países ou formatos regionais.
3. Definir tratamento específico para rate limiting além da mensagem genérica de indisponibilidade e da política de retry atual.
4. Definir métricas de produto de longo prazo, como recorrência, satisfação e retenção.
