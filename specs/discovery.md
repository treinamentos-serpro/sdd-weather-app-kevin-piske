# Discovery — Aplicação de Previsão do Tempo

## Contexto

A empresa solicitou o desenvolvimento de uma aplicação de previsão do tempo com foco em simplicidade, velocidade e usabilidade em dispositivos móveis. O propósito principal do produto é permitir que usuários consultem rapidamente as condições climáticas de uma cidade, compreendam o clima atual e tenham visão da previsão para os próximos dias.

O contexto de uso sugere uma solução leve e direta, acessível sem exigência de cadastro ou autenticação. Como a intenção é atender um público amplo, a interface deve ser intuitiva, com baixa curva de aprendizado e fácil leitura em telas pequenas.

O briefing define as funcionalidades centrais do produto:

- busca por cidades;
- visualização do clima atual;
- consulta da previsão de 5 dias;
- alternância entre Celsius e Fahrenheit;
- boa experiência em dispositivos móveis.

## Requisitos Funcionais

1. Busca por cidade
   - O usuário deve conseguir pesquisar uma cidade pelo nome.
   - O sistema deve localizar a cidade desejada e apresentar resultados relevantes.
   - Quando houver múltiplas cidades com o mesmo nome, a aplicação deve permitir que o usuário escolha corretamente a localidade desejada.
   - O sistema deve tratar buscas vazias, entradas inválidas e ausência de resultados com feedback claro.

2. Visualização do clima atual
   - A aplicação deve apresentar as condições climáticas do momento para a cidade selecionada.
   - O usuário deve ver, no mínimo, informações como temperatura e condição geral do tempo.
   - Quando disponíveis na fonte de dados, o sistema pode complementar a visualização com sensação térmica e umidade.

3. Previsão de 5 dias
   - O produto deve disponibilizar a previsão para os próximos 5 dias.
   - A interface deve permitir leitura rápida das informações por dia.
   - A previsão deve ser organizada de forma clara para facilitar a comparação entre os dias.

4. Alternância entre Celsius e Fahrenheit
   - O usuário deve poder trocar facilmente a unidade de temperatura entre Celsius e Fahrenheit.
   - A alteração deve refletir imediatamente em toda a interface.
   - O comportamento deve ser consistente e visualmente evidente.

5. Estados da aplicação
   - A interface deve tratar estados de carregamento, erro e ausência de dados.
   - O usuário deve receber mensagens claras em cada uma dessas situações.

## Requisitos Não-Funcionais

1. Usabilidade
   - A interface deve ser simples, clara e intuitiva.
   - O processo de busca e leitura das informações deve exigir poucos passos.

2. Responsividade
   - A aplicação deve funcionar adequadamente em diferentes tamanhos de tela, com prioridade para dispositivos móveis.
   - Textos, botões e cards devem manter boa legibilidade em telas menores.
   - A experiência deve ser adequada para smartphones e tablets, preservando acessibilidade e clareza visual.

3. Performance
   - O carregamento dos dados deve acontecer em tempo aceitável.
   - A experiência do usuário deve ser fluida, sem atrasos perceptíveis nas ações principais.
   - A aplicação deve minimizar o tempo de resposta da busca e reduzir a percepção de latência.

4. Confiabilidade
   - A aplicação deve lidar com erros de rede, falhas de API e respostas incompletas.
   - O usuário deve receber feedback claro quando os dados não puderem ser carregados.
   - A aplicação deve manter uma experiência consistente em cenários de falha parcial.

5. Acessibilidade
   - A interface deve considerar navegação por teclado e uso de elementos semânticos.
   - Contraste, tamanho de texto e organização visual devem favorecer leitura e uso inclusivo.
   - A interface deve permitir compreensão clara de informações climáticas por usuários com diferentes necessidades.

6. Disponibilidade
   - O sistema deve continuar oferecendo uma experiência útil mesmo quando a API externa falhar temporariamente.
   - A aplicação deve apresentar mensagens claras e limites de recuperação, como retry ou estado de indisponibilidade.

7. Segurança
   - A aplicação deve seguir práticas básicas de segurança para evitar vazamentos de dados e uso indevido de integrações externas.
   - Qualquer comunicação com serviços externos deve ocorrer de forma segura e controlada.

8. Observabilidade e monitoramento
   - O sistema deve registrar erros, falhas de integração e métricas de desempenho para apoiar manutenção e melhoria.
   - A equipe deve conseguir identificar causas de instabilidade com rapidez.

9. Cache e otimização de rede
   - Dados de clima podem ser armazenados temporariamente para reduzir chamadas repetidas e melhorar a experiência do usuário.
   - A aplicação deve equilibrar atualização de dados com eficiência de rede e tempo de resposta.

10. Manutenibilidade
   - O código deve ser organizado por responsabilidades, com separação de UI, serviços e regras de negócio.
   - A estrutura deve facilitar futuras evoluções sem grandes refatorações.

## Riscos

1. Dependência de API externa
   - A qualidade da aplicação depende diretamente da disponibilidade e do contrato da API meteorológica.
   - Mudanças na API, latência excessiva ou falhas de serviço podem afetar a funcionalidade principal.

2. Ambiguidade de localização
   - Cidades com nomes repetidos podem causar confusão na busca e selecionar o local errado.
   - A ausência de contexto regional pode prejudicar a precisão da busca.

3. Desafio de usabilidade em mobile
   - Em telas menores, a combinação de busca, clima atual e previsão de 5 dias pode gerar interface sobrecarregada.
   - A organização visual precisa ser cuidadosa para preservar legibilidade.

4. Consistência de unidades de temperatura
   - A troca entre Celsius e Fahrenheit deve ser clara e consistente para evitar interpretação equivocada.
   - Se a conversão não for evidente, o usuário pode se confundir sobre a escala atual.

5. Falta de contexto de negócio completo
   - O briefing não detalha público-alvo, regiões prioritárias, idioma nem requisitos específicos de geolocalização.
   - Esses pontos podem influenciar a arquitetura e a experiência final do produto.

## Perguntas em Aberto

1. A busca por cidade deve considerar apenas o nome da cidade ou também estado, país, coordenadas e contexto regional?
   - Impacto de seguir sem resposta: a busca pode retornar cidades incorretas ou pouco úteis, especialmente em localidades com nomes repetidos.

2. O app deve permitir geolocalização automática da posição do usuário, ou a busca manual é suficiente para o escopo inicial?
   - Impacto de seguir sem resposta: a experiência pode ser pouco prática para usuários em movimento e a arquitetura pode exigir recursos que não foram planejados.

3. O que exatamente deve ser exibido como “clima atual” — temperatura, sensação térmica, umidade, vento, condição do céu e precipitação?
   - Impacto de seguir sem resposta: a interface pode não atender às necessidades reais do usuário e a apresentação dos dados pode ser incompleta ou confusa.

4. A previsão de 5 dias deve ser diária, horária ou ambas?
   - Impacto de seguir sem resposta: a estrutura da tela e os critérios de aceitação podem divergir da expectativa do usuário.

5. A unidade de temperatura deve persistir entre sessões ou apenas durante a sessão atual?
   - Impacto de seguir sem resposta: a experiência pode parecer inconsistente e o usuário pode perder preferências de uso.

6. O produto precisa suportar múltiplos idiomas e formatos regionais de data/unidade?
   - Impacto de seguir sem resposta: a aplicação pode ficar limitada ao mercado local e reduzir alcance e usabilidade global.

7. O app deve funcionar somente online ou também em cenários sem conexão?
   - Impacto de seguir sem resposta: a aplicação pode tornar-se pouco útil em trânsito, viagens ou áreas com rede instável.

8. Quais regiões e países precisam ser cobertos prioritariamente pela validação da busca e dos dados climáticos?
   - Impacto de seguir sem resposta: testes podem ser realizados em poucos contextos, ocultando problemas de qualidade e cobertura de dados.

9. O sistema deve apoiar a escolha de cidade por favoritos, histórico recente ou geolocalização automática?
   - Impacto de seguir sem resposta: a funcionalidade pode ficar genérica e pouco conveniente para uso recorrente.

10. Como a aplicação deve se comportar quando a API externa falha, demora muito ou retorna dados incompletos?
   - Impacto de seguir sem resposta: a app pode falhar em momentos críticos, frustrando o usuário e gerando pouca confiança.

11. Existem requisitos específicos de acessibilidade, como contraste mínimo, suporte a leitores de tela e navegação por teclado?
   - Impacto de seguir sem resposta: o produto pode ser funcional, mas pouco inclusivo e incompatível com boas práticas de UX.

12. Há critérios de desempenho definidos, como tempo máximo de carregamento ou taxa de sucesso de busca?
   - Impacto de seguir sem resposta: o time pode entregar uma solução lenta ou pouco confiável sem perceber a lacuna.

13. O app precisa de cadastro, autenticação ou coleta de dados do usuário como localização e histórico de busca?
   - Impacto de seguir sem resposta: podem surgir riscos de privacidade, conformidade e necessidade de decisões de segurança que ainda não foram avaliadas.

14. O produto será usado apenas por usuários finais ou também por pessoas em mobilidade e em contexto de consulta rápida?
   - Impacto de seguir sem resposta: a interface pode ser desenhada para um cenário de uso errado.

15. O que define sucesso para o produto: tempo de resposta, retenção, engajamento, taxa de busca bem-sucedida, ou outra métrica?
   - Impacto de seguir sem resposta: a equipe não terá critérios objetivos para validar a entrega e a utilidade do app.

## Riscos Técnicos e de Produto

| Risco | Probabilidade | Impacto | Estratégia de mitigação |
| --- | --- | --- | --- |
| Dependência de API externa instável | Alta | Alto | Implementar fallback de erro, tratar timeouts, validar contratos de resposta e considerar cache de dados recentes. |
| Busca por cidade ambígua | Média | Alto | Exibir resultados com contexto regional (cidade, estado, país) e permitir seleção explícita do usuário. |
| Dados meteorológicos inconsistentes ou incompletos | Média | Alto | Validar payloads, tratar campos ausentes com mensagens claras e mostrar estados de erro sem quebrar a experiência. |
| Lentidão na experiência mobile | Média | Alto | Otimizar carregamento, reduzir chamadas desnecessárias, usar cache e priorizar informações essenciais na tela inicial. |
| Falha de disponibilidade em cenários de rede fraca | Alta | Médio | Exibir mensagens de falha amigáveis, manter UI resiliente e reduzir dependência de rede em ações repetidas. |
| Interface pouco clara em celulares | Média | Médio | Validar layout com testes em mobile, priorizar legibilidade, reduzir densidade visual e padronizar hierarquia da informação. |
| Confusão entre Celsius e Fahrenheit | Média | Médio | Tornar a unidade sempre visível, manter a conversão consistente e garantir feedback explícito na mudança de escala. |
| Desalinhamento entre expectativa do usuário e escopo do produto | Média | Alto | Definir critérios de sucesso, validar com usuários e reduzir excesso de funcionalidades em MVP. |
| Ausência de critérios de acessibilidade | Média | Alto | Definir diretrizes de contraste, navegação por teclado, labels semânticas e testes com padrões básicos de a11y. |
| Escopo que cresce além do MVP | Alta | Médio | Manter foco no MVP, registrar requisitos extras como backlog e separar funcionalidades futuras por prioridade. |

## Personas

### 1. Pessoa em movimento / profissional correndo contra o tempo
- Objetivo principal: consultar rapidamente o clima de uma cidade antes de sair de casa, ir ao trabalho ou viajar.
- Contexto de uso: mobile, em curta sessão, com foco em velocidade e clareza na informação.
- Métrica de sucesso: concluir a busca e entender a condição climática em menos de 10 segundos, sem precisar navegar em vários elementos.

### 2. Usuário cotidiano / planejador de rotina
- Objetivo principal: verificar a temperatura e a previsão dos próximos dias para planejar roupas, deslocamentos e compromissos.
- Contexto de uso: mobile e desktop, em uso frequente e de consulta recorrente.
- Métrica de sucesso: confirmar a previsão diária com facilidade e conseguir comparar a previsão de 5 dias sem esforço, com alto nível de confiança na informação.

### 3. Usuário ocasional / viajante ou turista
- Objetivo principal: saber como estará o clima em outra cidade ou destino antes de ir.
- Contexto de uso: mobile em viagem, muitas vezes em conexão instável e com necessidade de leitura simples.
- Métrica de sucesso: localizar uma cidade corretamente, visualizar o clima atual e interpretar a previsão do dia com clareza mesmo em pouco tempo e em ambiente de uso móvel.

## Decisões

1. Fonte de dados: Open-Meteo (sem API key)
   - Justificativa: reduz a barreira de entrada do projeto, evita custo de integração e está alinhado com a exigência de usar uma fonte pública e simples para o MVP.
   - Resolve: elimina a incerteza sobre a fonte de dados e reduz riscos de dependência de serviço pago ou complexidade de autenticação.

2. “5 dias” = hoje + 4 dias
   - Justificativa: o termo “5 dias” no contexto de previsão climática costuma ser interpretado como a janela de 5 dias úteis de dados, começando no dia atual. Essa definição deixa a regra explícita para design e implementação.
   - Resolve: elimina ambiguidade sobre o escopo temporal da previsão e define a regra de exibição da próxima janela de previsão.

3. Unidade padrão: Celsius
   - Justificativa: Celsius é a unidade mais comum para usuários no contexto de uso do Brasil e é a escolha mais natural para a experiência inicial do produto.
   - Resolve: define a unidade inicial da interface e reduz a dúvida sobre a convenção default em caso de primeira visita ou uso sem interação do usuário.

4. Sem autenticação e sem persistência de servidor
   - Justificativa: a aplicação é de consulta direta e sem necessidade de histórico ou perfil do usuário na primeira versão; isso reduz complexidade de desenvolvimento, operação e manutenção.
   - Resolve: responde diretamente às perguntas sobre cadastro, autenticação e armazenamento de dados no servidor, mantendo o MVP enxuto e focado em uso imediato.

5. Idioma da UI: pt-BR
   - Justificativa: o projeto e a audiência presumida são brasileiros, e a linguagem da interface precisa estar alinhada com o contexto de uso e com a experiência local.
   - Resolve: fecha a incerteza sobre idioma da interface e evita decisões divergentes em textos, rótulos e mensagens de erro.

## Suposições

1. A solução será uma aplicação web simples, sem necessidade de backend próprio para a fase inicial.
2. A fonte principal de dados será uma API pública de clima, compatível com o escopo do projeto.
3. O foco principal será em uso mobile, com experiência funcional em desktop, mas sem exigência de otimização completa para todos os tamanhos de tela.
4. A busca por cidade será suficiente para atender ao escopo inicial do produto.
5. O usuário busca informações rápidas, legíveis e diretamente úteis para o dia a dia.
6. A troca de unidade entre Celsius e Fahrenheit será tratada exclusivamente na interface, sem necessidade de persistência obrigatória.
7. O produto priorizará clareza, velocidade e simplicidade em vez de funcionalidades avançadas.
8. O uso do app será principalmente de consulta e leitura de informações, sem necessidade de autenticação ou perfis personalizados na primeira versão.
9. A API de clima disponibiliza dados suficientes para clima atual e previsão de 5 dias, mesmo em cenários de latência ou resposta incompleta.
10. O app será validado prioritariamente por testes de usabilidade em telas móveis e por funcionamento geral em cenários de busca e leitura de clima.
