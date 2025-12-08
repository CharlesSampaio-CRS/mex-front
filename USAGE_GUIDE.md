# Multi Exchange Front - Guia de Uso

## 🚀 Sobre o Projeto

Aplicação desktop construída com **Electron** e **Tailwind CSS** para gerenciar múltiplas exchanges de criptomoedas através da API Multi-Exchange Balance.

## 📋 Pré-requisitos

1. **Node.js** instalado (versão 16 ou superior)
2. **API Multi-Exchange Balance** rodando em `http://localhost:5000`

## 🔧 Instalação

```bash
# 1. Instalar dependências
npm install

# 2. Compilar CSS do Tailwind
npm run build:css

# 3. Iniciar o aplicativo
npm start
```

## 💻 Modo Desenvolvimento

```bash
# Inicia o app com watch no CSS (recompila automaticamente)
npm run dev
```

## 📱 Funcionalidades Principais

### 📊 Dashboard
- Visão geral de todas as exchanges Conectadas
- Total em USD e BRL
- Status da API e banco de dados
- Listagem rápida de exchanges conectadas

### 🔗 Gerenciar Exchanges
- **Listar exchanges disponíveis** (Binance, NovaDAX, MEXC, etc.)
- **Vincular nova exchange** com API Key e Secret
- **Desvincular exchanges** existentes
- Visualizar status de cada exchange (ativa/inativa)

### 💰 Saldos Detalhados
- Visualização completa de saldos por exchange
- Listagem de todos os tokens com quantidade e valor
- Conversão automática USD/BRL
- Botões para atualizar e limpar cache
- Indicador de cache (se os dados são do cache ou atualizados)

### 📈 Histórico e Evolução
- Gráfico de evolução do portfolio
- Períodos: 24h, 7 dias, 30 dias, 90 dias, 1 ano
- Variação em valor e porcentagem
- Pontos de dados históricos com timestamp

### ⚙️ Configurações
- Configurar User ID
- URL da API
- Intervalo de atualização
- Informações do aplicativo

## 🔌 Integração com a API

A aplicação se conecta automaticamente com a API em `http://localhost:5000`. Certifique-se de que:

1. A API está rodando
2. O MongoDB está conectado
3. O User ID nas configurações corresponde ao da API

### Endpoints Utilizados

- `GET /health` - Verifica status da API
- `GET /api/v1/exchanges/available` - Lista exchanges disponíveis
- `POST /api/v1/exchanges/link` - Vincula uma exchange
- `GET /api/v1/exchanges/linked` - Lista exchanges Conectadas
- `DELETE /api/v1/exchanges/unlink` - Desvincula uma exchange
- `GET /api/v1/balances` - Busca saldos de todas exchanges
- `POST /api/v1/balances/clear-cache` - Limpa cache de saldos
- `GET /api/v1/balances/history/evolution` - Evolução do portfolio

## 🔐 Segurança

- As API Keys e Secrets são enviadas via HTTPS/POST
- As credenciais são armazenadas criptografadas no backend
- Apenas permissões de leitura são necessárias nas exchanges
- Context Isolation ativo no Electron

## 🎨 Personalização

### Cores e Tema

As cores podem ser customizadas em `tailwind.config.js`:

```javascript
colors: {
  primary: { /* seus valores */ },
  dark: { /* seus valores */ }
}
```

### CSS Customizado

Adicione estilos em `src/styles/input.css`:

```css
@layer components {
  .seu-componente {
    @apply classes-do-tailwind;
  }
}
```

## 📂 Estrutura de Arquivos

```
mult-exchange-front/
├── src/
│   ├── main.js              # Processo principal do Electron
│   ├── preload.js           # Bridge seguro entre processos
│   ├── renderer.js          # Lógica da interface (integrada com API)
│   ├── index.html           # Interface principal
│   ├── services/
│   │   └── api.js           # Serviço de comunicação com API
│   ├── styles/
│   │   ├── input.css        # CSS de entrada (Tailwind)
│   │   └── output.css       # CSS compilado (gerado)
│   ├── assets/              # Ícones e recursos
│   └── components/          # Componentes reutilizáveis
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 🔄 Atualização Automática

A aplicação atualiza automaticamente os dados do dashboard e saldos a cada **30 segundos** quando nas respectivas views.

## 🐛 Troubleshooting

### API não conecta
- Verifique se a API está rodando em `http://localhost:5000`
- Execute `curl http://localhost:5000/health` para testar
- Verifique o console do DevTools (View > Toggle Developer Tools)

### CSS não aparece
- Execute `npm run build:css` para compilar o Tailwind
- Verifique se `src/styles/output.css` foi gerado
- Recarregue a aplicação (Cmd+R / Ctrl+R)

### Exchanges não aparecem
- Certifique-se de que o User ID está correto nas configurações
- Verifique se a API tem exchanges cadastradas no MongoDB
- Abra o console (F12) para ver mensagens de erro

## 🏗️ Build para Produção

```bash
# Build para a plataforma atual
npm run build

# Build específico
npm run build:mac    # macOS (DMG, ZIP)
npm run build:win    # Windows (NSIS, Portable)
npm run build:linux  # Linux (AppImage, deb)
```

Os builds ficam na pasta `dist/`.

## 📝 Próximas Melhorias

- [ ] Sistema de notificações toast
- [ ] Gráficos interativos (Chart.js / Recharts)
- [ ] Exportar relatórios PDF/Excel
- [ ] Sistema de alertas de preço
- [ ] Suporte a múltiplos usuários
- [ ] Tema claro/escuro toggle
- [ ] Autenticação local

## 📄 Licença

ISC

## 👤 Autor

Charles Roberto

---

**Importante:** Esta aplicação é apenas para visualização e consulta de saldos. Nunca compartilhe suas API Keys e sempre use permissões somente de leitura nas exchanges.
