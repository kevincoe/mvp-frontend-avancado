# Sistema de Gerenciamento Bancário

Um sistema completo de gerenciamento bancário para gerentes, desenvolvido com React, TypeScript, Material-UI e React Router. O sistema permite o gerenciamento de contas bancárias e investimentos de clientes, com integração à Financial Modeling Prep API para cotações de ações americanas em tempo real.

## 📋 Características

### Funcionalidades Principais
- **Gestão de Contas Bancárias**: Criar, editar, visualizar e excluir contas bancárias
- **Gestão de Investimentos**: Gerenciar carteiras de investimentos dos clientes com ações americanas
- **Cotações em Tempo Real**: Integração com Financial Modeling Prep API para cotações de ações americanas
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
- **API Externa**: Financial Modeling Prep para cotações de ações americanas

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

## 📁Estrutura do Projeto

```
frontend-gerente-bancario/
├── app/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── Header.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorAlert.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── ...
│   ├── routes/             # Páginas/rotas da aplicação
│   │   ├── home.tsx        # Dashboard principal
│   │   ├── accounts.tsx    # Gestão de contas
│   │   ├── investments.tsx # Gestão de investimentos
│   │   └── ...
│   ├── services/           # Serviços e APIs
│   │   ├── api.ts
│   │   ├── storage.ts
│   │   └── finance.ts
│   ├── types/              # Definições de tipos TypeScript
│   │   └── index.ts
│   ├── utils/              # Utilitários
│   │   └── formatters.ts
│   └── root.tsx            # Root da aplicação
├── public/                 # Arquivos públicos
└── ...
```

## 🔧 APIs Utilizadas

### Financial Modeling Prep API
- **Descrição**: API profissional para dados financeiros em tempo real
- **Licença**: Gratuita com limitações de requisições
- **Cadastro**: Requer API key gratuita
- **Site**: https://financialmodelingprep.com/
- **Endpoints utilizados**:
  - Cotação de Ações: `https://financialmodelingprep.com/api/v3/quote/{symbol}`
  - Cotação do Dólar: `https://financialmodelingprep.com/api/v3/fx/USDBRL`
  - Busca de Ações: `https://financialmodelingprep.com/api/v3/search`

### Funcionalidades da API
- **Cotações em Tempo Real**: Preços atualizados de ações americanas
- **Busca de Símbolos**: Busca por símbolos de ações americanas
- **Dados de Câmbio**: Cotação USD/BRL
- **Cache Inteligente**: Sistema de cache de 30 segundos para otimizar requisições
- **Tratamento de Erros**: Logs detalhados e mensagens de erro amigáveis

### Limitações
- Suporte apenas para ações americanas (NASDAQ, NYSE)
- Não suporta ações brasileiras (B3)
- Limite de 150 requisições por dia na versão gratuita
- Dados com delay de 15 minutos na versão gratuita

## 📱 Componentes Reutilizáveis

1. **Header**: Cabeçalho com logo e navegação simplificada
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
- **Sistema de Cache**: Evita requisições desnecessárias à API
- **Busca Manual**: Busca de ações americanas por símbolo (AAPL, MSFT, etc.)

## 🔄 Funcionalidades Implementadas

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
4. Digite o símbolo da ação americana (ex: AAPL, MSFT, GOOGL)
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

1. **Apenas Ações Americanas**: A API atual suporta apenas ações americanas (NASDAQ, NYSE)
2. **Não Suporta B3**: Ações brasileiras não são suportadas
3. **Limite de API**: Versão gratuita possui limite de 150 requisições diárias
4. **Delay de Dados**: Dados com delay de 15 minutos na versão gratuita
5. **Cache de 30s**: Sistema de cache evita requisições excessivas

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

---

**Nota**: Este sistema foi desenvolvido para fins educacionais e demonstra a integração com APIs externas, gerenciamento de estado, componentização e boas práticas de desenvolvimento React/TypeScript.
