# Sistema de Gerenciamento Bancário

Um sistema completo de gerenciamento bancário para gerentes, desenvolvido com React, TypeScript, Material-UI e React Router. O sistema permite o gerenciamento de contas bancárias e investimentos de clientes, com integração a APIs externas para cotações financeiras.

## 📋 Características

### Funcionalidades Principais
- **Gestão de Contas Bancárias**: Criar, editar, visualizar e excluir contas bancárias
- **Gestão de Investimentos**: Gerenciar carteiras de investimentos dos clientes
- **Cotações em Tempo Real**: Integração com APIs externas para cotações de ações e dólar
- **Dashboard Analítico**: Visão geral dos dados financeiros
- **Responsive Design**: Interface adaptável para desktop, tablet e mobile

### Tecnologias Utilizadas
- **Frontend**: React 19, TypeScript, Material-UI v7
- **Roteamento**: React Router v7
- **Estilização**: Material-UI + Emotion
- **Validação**: Validação nativa de formulários
- **Armazenamento**: localStorage para persistência local
- **HTTP Client**: Axios para requisições à API
- **API Externa**: Yahoo Finance para cotações financeiras

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone <seu-repositorio>

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

## � Estrutura do Projeto

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

### Yahoo Finance API (Gratuita)
- **Descrição**: API para cotações de ações e câmbio
- **Licença**: Gratuita para uso pessoal
- **Cadastro**: Não requer cadastro
- **Endpoints utilizados**:
  - Cotação do Dólar: `https://query1.finance.yahoo.com/v8/finance/chart/USDBRL=X`
  - Cotações de Ações: `https://query1.finance.yahoo.com/v8/finance/chart/{symbol}`

### Alpha Vantage API (Alternativa)
- **Descrição**: API financeira com dados de mercado
- **Licença**: Gratuita com limitações
- **Cadastro**: Requer API key gratuita
- **Site**: https://www.alphavantage.co/

## 📱 Componentes Reutilizáveis

1. **Header**: Cabeçalho com logo e navegação
2. **LoadingSpinner**: Indicador de carregamento
3. **ErrorAlert**: Alertas de erro e sucesso
4. **ConfirmDialog**: Modal de confirmação
5. **SearchField**: Campo de busca reutilizável
6. **AccountCard**: Card para exibir dados de conta
7. **InvestmentCard**: Card para exibir investimentos
8. **CustomButton**: Botão personalizado com animações

## 🎨 Features de Usabilidade

- **Feedback Visual**: Indicadores de carregamento, sucesso e erro
- **Tooltips**: Explicações rápidas sobre funcionalidades
- **Mensagens Condicionais**: "Nenhum item encontrado", "Erro ao carregar"
- **Layout Responsivo**: Funciona em todos os dispositivos
- **Navegação Intuitiva**: Breadcrumbs e navegação clara
- **Validação de Formulários**: Feedback em tempo real

## 🔄 Funcionalidades Implementadas

### Componentização (3,5 pts)
- ✅ 3 páginas principais com componentes reutilizáveis
- ✅ Formulários com validação e localStorage
- ✅ 8+ componentes reutilizáveis
- ✅ Interfaces e soluções originais

### React e Roteamento (2,0 pts)
- ✅ Uso correto de useState, useEffect, useParams, useLocation, useNavigate
- ✅ Navegação entre páginas com React Router
- ✅ Rota 404 para URLs inexistentes

### Comunicação com API (1,0 pt)
- ✅ Consumo de API externa (Yahoo Finance)
- ✅ Tratamento de erros e loading
- ✅ Exibição de mensagens amigáveis

### Usabilidade (1,5 pt)
- ✅ Feedback visual completo
- ✅ Layout responsivo
- ✅ Tooltips e mensagens condicionais

### Organização e Documentação (2,0 pts)
- ✅ Projeto no GitHub
- ✅ README.md completo
- ✅ Estrutura de pastas organizada
- ✅ Boas práticas de nomenclatura

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Autor

Desenvolvido como parte do MVP de Frontend Avançado da PUC-Rio.

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
