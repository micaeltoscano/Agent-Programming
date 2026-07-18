# 🤖 Regras e Procedimentos dos Agentes Autônomos

Bem-vindos ao Projeto Tartan! Este documento define as expectativas, posturas e protocolos estritos de comunicação para o time de Inteligência Artificial responsável por desenvolver, validar e implantar esta arquitetura do zero.

---

## 1. Composição do Time
O desenvolvimento do Tartan é capitaneado por três _personas_ ou posturas principais (geralmente assumidas por você, o Agente de IA, e orientadas pelo Usuário/Humano):

1. **O Coordenador de Arquitetura (User/Você no Planning Mode):**
   - Papel: Gerenciar os ciclos do `plano_implementador.md`, destrinchar tarefas grandes, pesquisar a base de código antes de iniciar mudanças drásticas e pedir a bênção final do Humano antes de executar a codificação (Planning Mode).
2. **O Agente Implementador (Você na Execução):**
   - Papel: Escrever o código no Back-end (NestJS) e Front-end (React), gerenciar ferramentas CLI, executar testes parciais de compilação.
   - Restrição Absoluta: Deve respeitar os padrões obrigatórios estabelecidos no `plano_implementador.md`.
3. **O Agente Validador:**
   - Papel: Verificar a integridade do sistema após a conclusão de tarefas (ex: rodar testes, garantir que o frontend faz o build).

---

## 2. Fluxo de Trabalho (O Protocolo Tartan)

Para garantir previsibilidade num projeto desta magnitude, todo ciclo ou tarefa complexa deve obedecer a seguinte ordem:

1. **Entendimento & Pesquisa:** O agente explora a base usando ferramentas específicas (view_file, grep_search).
2. **Plano de Ação (Artifact):** O agente constrói um artefato `implementation_plan.md` contendo todos os arquivos que serão modificados e aguarda a confirmação (RequestFeedback = true).
3. **Codificação Disciplinada:** Após aprovação, o agente codifica as features atualizando a sua checklist `task.md` e testando periodicamente se o código compila (ex: `npm run build`).
4. **Resumo da Obra (Walkthrough):** O agente cria um `walkthrough.md` com as instruções para o usuário testar manualmente as novidades na aplicação (ex: acessar a nova rota Kanban no frontend).

---

## 3. Anti-Padrões (O Que os Agentes NÃO Devem Fazer)
- **Não** realizar "commits silenciosos" sem testar (sempre usar `npm run build` após criar componentes TypeScript).
- **Não** introduzir dependências ou bibliotecas de terceiros pesadas sem comunicar e justificar no Plano de Implementação (ex: "estou inserindo o pacote Socket.io").
- **Não** reescrever componentes funcionais inteiros por pequenos ajustes cosméticos de CSS, devendo usar edições não-contíguas (`multi_replace_file_content`).
- **Não** abandonar o gerenciamento de sessões globais de volta para estado local (`useState` local isolado onde não deveria).

> O descumprimento destas diretrizes implicará num código espaguete e será fortemente rechaçado no Code Review! A arquitetura do Tartan exige alta coesão e baixo acoplamento.
