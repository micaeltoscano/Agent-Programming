# 🍣 Visão Geral do Projeto: Tartan CRUD

## 1. O Que é o Projeto Tartan?
O projeto **Tartan** surge da necessidade de um restaurante de culinária Japonesa e Chinesa localizado em João Pessoa (PB) de digitalizar e orquestrar inteiramente sua operação. A ideia é construir uma plataforma que atenda desde a captação do cliente até a entrega do pedido finalizado pelo motoboy.

Ele não é apenas um "Cardápio Digital", mas sim um sistema integrado (ERP/PDV/Delivery) que controla os pedidos de forma síncrona com o nível de estoque, despacha tarefas para as praças de operação (Cozinha e Motoboys) e apresenta relatórios financeiros para os administradores.

## 2. A Arquitetura Proposta

### 2.1 Backend (NestJS + TypeScript)
Um monolito moderno escolhido pela sua estrutura opinativa e facilidade de manutenção. 
- **TypeORM**: Mapeamento objeto-relacional para se comunicar com o PostgreSQL.
- **RESTful API**: Concentrará as rotas para catálogo, fechamento de pedidos, histórico e gestão de estoques (baixa de insumos mediante ficha técnica).
- **Segurança**: Autenticação com JWT.
- **Real-Time**: Utilização do módulo `@nestjs/websockets` para injetar notificações no ecossistema operacional (cozinha e entrega).

### 2.2 Frontend (React + Vite)
Interface de Usuário em "Single Page Application", otimizada para rapidez de navegação e reatividade.
- **Context API**: Reterá os dados de perfil (Token, Carrinho) para evitar sobrecarga de consultas ou perdas de progresso.
- **Recharts**: Fornecerá um painel visual agradável para os administradores, traduzindo as rotas `/dashboard/` do backend.
- **Socket.io-client**: Conector que fará a mágica do sistema pulsar em tempo real.

### 2.3 Banco de Dados (PostgreSQL)
Um banco relacional forte e robusto. Utilizaremos o TypeORM Migrations para gerenciar as mudanças no ciclo de vida do projeto, saindo do perigoso `synchronize: true` desde cedo.

### 2.4 Atendente de Inteligência Artificial (Ollama)
O Tartan contará com um LLM isolado, rodando localmente e orquestrado automaticamente via Docker (`docker-compose.yml`), servindo como "garçom virtual". Além de tirar dúvidas, esse agente será capaz de orquestrar adições autônomas no carrinho do cliente por meio de comandos ocultos (`[ADD:ID]`). A imagem do Docker fará o *pull* automático do modelo `llama3.2` sem necessidade de intervenção manual.

## 3. O Fluxo de Vida do Pedido
O sistema será pautado numa Máquina de Estados rígida que protegerá os processos do restaurante:
1. **PENDENTE**: Carrinho abandonado ou esperando pagamento.
2. **CONFIRMADO**: Pagamento aceito, estoque deduzido e aguardando visualização pela equipe.
3. **EM_PRODUCAO**: Cozinha dá o "aceite" e inicia os pratos.
4. **PRONTO**: Cozinha sinaliza que os pacotes estão no balcão.
5. **A_CAMINHO**: Motoboy apanha o pacote e inicia o roteiro de entrega.
6. **ENTREGUE**: Finalização do processo.
7. *(Alternativa)* **CANCELADO**: Caso o administrador interrompa o processo mediante devoluções (Estornos de Estoque serão calculados no Back-end).

## 4. O Caminho Adiante
O Plano Implementador (`plano_implementador.md`) divide toda a arquitetura supracitada em **Três Ciclos (Fundações, Operacionalização e Avançado)** para priorização das entregas. Nossa missão inicia no Ciclo 01!
