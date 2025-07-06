# Sistema de Gerenciamento Bancário

Um sistema completo de gerenciamento bancário para gerentes, desenvolvido com React, TypeScript, Material-UI e React Router. O sistema permite o gerenciamento de contas bancárias e investimentos de clientes, com integração à Financial Modeling Prep API para cotações de ações estadunidenses em tempo real.

## 📋 Características

### Funcionalidades Principais
- **Gestão de Contas Bancárias**: Criar, editar, visualizar e excluir contas bancárias
- **Gestão de Investimentos**: Gerenciar carteiras de investimentos dos clientes com ações estadunidenses
- **Cotações em Tempo Real**: Integração com Financial Modeling Prep API para cotações de ações estadunidenses
- **Dashboard Analítico**: Visão geral dos dados financeiros com gráficos e métricas
- **Responsive Design**: Interface adaptável para desktop, tablet e mobile
- **Sistema de Cache**: Cache inteligente para otimizar requisições à API

### Tecnologias Utilizadas
- **Frontend**: React 19, TypeScript, Material-UI v7
- **Roteamento**: React Router v7 com SSR/Hydration
- **Estilização**: Material-UI + Emotion (tema claro personalizado)
- **Validação**: Validação nativa de formulários com feedback em tempo real
- **Armazenamento**: localStorage para persistência local
- **HTTP Client**: Axios para requisições à API
- **API Externa**: Financial Modeling Prep para cotações de ações estadunidenses

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone https://github.com/kevincoe/mvp-frontend-avancado.git

# Navegue para o diretório
cd frontend-gerente-bancario

# Instale as dependências
npm install
```

### Execução em Desenvolvimento
```bash
# Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### Build para Produção
```bash
# Gere o build de produção
npm run build

# Execute a aplicação em produção
npm start
```

## 📁 Estrutura do Projeto

```
frontend-gerente-bancario/
├── .dockerignore
├── .env
├── .gitignore
├── Dockerfile
├── package.json
├── react-router.config.ts
├── README.md
├── tsconfig.json
├── vite.config.ts
├── .react-router/
│   └── types/
│       ├── +future.ts
│       ├── +routes.ts
│       ├── +server-build.d.ts
│       └── app/
├── app/
│   ├── app.css
│   ├── root.tsx
│   ├── routes.ts
│   ├── theme.tsx
│   ├── components/              # Componentes reutilizáveis
│   │   ├── ConfirmDialog.tsx
│   │   ├── CustomButton.tsx
│   │   ├── ErrorAlert.tsx
│   │   ├── Header.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── SearchField.tsx
│   ├── routes/                  # Páginas/rotas da aplicação
│   │   ├── 404.tsx             # Página de erro 404
│   │   ├── home.tsx            # Dashboard principal
│   │   ├── accounts.tsx        # Lista de contas
│   │   ├── accounts.new.tsx    # Nova conta
│   │   ├── accounts.edit.tsx   # Editar conta
│   │   ├── accounts.detail.tsx # Detalhes da conta
│   │   ├── investments.tsx     # Lista de investimentos
│   │   ├── investments.new.tsx # Novo investimento
│   │   ├── investments.edit.tsx # Editar investimento
│   │   └── investments.detail.tsx # Detalhes do investimento
│   ├── services/               # Serviços e APIs
│   │   ├── api.ts             # Configuração geral da API
│   │   ├── finance.ts         # Serviço da Financial Modeling Prep API
│   │   └── storage.ts         # Gerenciamento do localStorage
│   ├── types/                  # Definições de tipos TypeScript
│   │   └── index.ts
│   ├── utils/                  # Utilitários
│   │   └── formatters.ts      # Formatadores e validadores
│   └── welcome/               # Páginas de boas-vindas
└── public/                    # Arquivos públicos estáticos
    └── favicon.ico
```

## 🔧 API Externa

### Financial Modeling Prep API
- **Descrição**: API profissional para dados financeiros em tempo real
- **Licença**: Gratuita com limitações de requisições
- **Cadastro**: Requer API key gratuita
- **Site**: https://financialmodelingprep.com/
- **Endpoints utilizados**:
  - `GET /quote/{symbol}` - Cotação de ações estadunidenses
  - `GET /fx/USDBRL` - Cotação do dólar
  - `GET /search` - Busca de símbolos

### Limitações da API
- Suporte apenas para ações estadunidenses (NASDAQ, NYSE)
- Não suporta ações brasileiras (B3)
- Limite de 250 requisições por dia na versão gratuita
- Dados com delay de 15 minutos na versão gratuita
- Sistema de cache de 30 segundos para otimizar requisições

## 📱 Componentes Reutilizáveis

1. **Header**: Cabeçalho com logo e navegação
2. **LoadingSpinner**: Indicador de carregamento
3. **ErrorAlert**: Alertas de erro, sucesso e informações
4. **ConfirmDialog**: Modal de confirmação para ações críticas
5. **SearchField**: Campo de busca reutilizável
6. **CustomButton**: Botão personalizado com animações

## 🎨 Features de Usabilidade

- **Feedback Visual**: Indicadores de carregamento, sucesso e erro
- **Mensagens Condicionais**: "Nenhum item encontrado", "Erro ao carregar"
- **Layout Responsivo**: Funciona em todos os dispositivos
- **Navegação Intuitiva**: Navegação clara entre páginas
- **Validação de Formulários**: Feedback em tempo real
- **Busca Manual**: Busca de ações estadunidenses por símbolo

## 🚀 Como Usar

### Gestão de Contas
1. Acesse "Contas" no menu
2. Clique em "Nova Conta" para criar uma conta bancária
3. Preencha os dados do cliente e informações da conta
4. Visualize, edite ou exclua contas existentes

### Gestão de Investimentos
1. Acesse "Investimentos" no menu
2. Clique em "Novo Investimento"
3. Selecione uma conta existente
4. Digite o símbolo da ação estadunidense (ex: AAPL, MSFT, GOOGL)
5. Clique em "Buscar" para obter a cotação atual
6. Ajuste a quantidade e salve o investimento

### Símbolos Suportados
- **AAPL** - Apple Inc.
- **MSFT** - Microsoft Corporation
- **GOOGL** - Alphabet Inc.
- **AMZN** - Amazon.com Inc.
- **TSLA** - Tesla Inc.
- **NVDA** - NVIDIA Corporation
- **META** - Meta Platforms Inc.
- **E muitos outros símbolos da NASDAQ e NYSE**

## ⚠️ Limitações Conhecidas

1. **Apenas Ações estadunidenses**: A API atual suporta apenas ações estadunidenses (NASDAQ, NYSE)
2. **Não Suporta B3**: Ações brasileiras não são suportadas
3. **Limite de API**: Versão gratuita possui limite de 250 requisições diárias
4. **Delay de Dados**: Dados com delay de 15 minutos na versão gratuita

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Autor
Kevin Mailho Coe

---

Desenvolvido como parte do MVP de Frontend Avançado da PUC-Rio.

**Nota**: Este sistema foi desenvolvido para fins educacionais e demonstra a integração com APIs externas, gerenciamento de estado, componentização e boas práticas de desenvolvimento React/TypeScript.