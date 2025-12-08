# Exemplos de Testes com a API

Este arquivo contém exemplos de requisições para testar a integração com a API.

## Testando a API manualmente

### 1. Health Check
```bash
curl http://localhost:5000/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "message": "API rodando",
  "database": "connected"
}
```

### 2. Listar Exchanges Disponíveis
```bash
curl "http://localhost:5000/api/v1/exchanges/available?user_id=charles_test_user"
```

### 3. Vincular uma Exchange
```bash
curl -X POST http://localhost:5000/api/v1/exchanges/link \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "charles_test_user",
    "exchange_id": "693481148b0a41e8b6acb079",
    "api_key": "your_api_key_here",
    "api_secret": "your_api_secret_here"
  }'
```

### 4. Listar Exchanges Conectadas
```bash
curl "http://localhost:5000/api/v1/exchanges/linked?user_id=charles_test_user"
```

### 5. Buscar Saldos
```bash
# Sem force refresh
curl "http://localhost:5000/api/v1/balances?user_id=charles_test_user"

# Com force refresh (ignora cache)
curl "http://localhost:5000/api/v1/balances?user_id=charles_test_user&force_refresh=true"

# Com conversão BRL
curl "http://localhost:5000/api/v1/balances?user_id=charles_test_user&currency=brl"
```

### 6. Evolução do Portfolio
```bash
# Últimos 7 dias (padrão)
curl "http://localhost:5000/api/v1/balances/history/evolution?user_id=charles_test_user"

# Últimas 24 horas
curl "http://localhost:5000/api/v1/balances/history/evolution?user_id=charles_test_user&period=24h"

# Últimos 30 dias
curl "http://localhost:5000/api/v1/balances/history/evolution?user_id=charles_test_user&period=30d"
```

### 7. Histórico de Saldos
```bash
curl "http://localhost:5000/api/v1/balances/history?user_id=charles_test_user&limit=10"
```

### 8. Limpar Cache
```bash
curl -X POST http://localhost:5000/api/v1/balances/clear-cache \
  -H "Content-Type: application/json" \
  -d '{"user_id": "charles_test_user"}'
```

### 9. Desvincular Exchange
```bash
curl -X DELETE http://localhost:5000/api/v1/exchanges/unlink \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "charles_test_user",
    "exchange_id": "693481148b0a41e8b6acb079"
  }'
```

## Testando no Console do Browser

Abra o DevTools (F12) no Electron e execute:

```javascript
// Testar health check
api.healthCheck().then(console.log);

// Listar exchanges disponíveis
api.getAvailableExchanges().then(console.log);

// Listar exchanges Conectadas
api.getLinkedExchanges().then(console.log);

// Buscar saldos
api.getBalances().then(console.log);

// Buscar saldos (force refresh)
api.getBalances(true).then(console.log);

// Evolução do portfolio (7 dias)
api.getPortfolioEvolution('7d').then(console.log);

// Histórico
api.getBalanceHistory().then(console.log);

// Último snapshot
api.getLatestSnapshot().then(console.log);

// Limpar cache
api.clearCache().then(console.log);
```

## Fluxo Completo de Teste

Execute estes comandos em sequência para testar todo o fluxo:

```bash
#!/bin/bash

# 1. Verificar API
echo "1. Verificando API..."
curl http://localhost:5000/health
echo -e "\n"

# 2. Listar exchanges disponíveis
echo "2. Listando exchanges disponíveis..."
curl "http://localhost:5000/api/v1/exchanges/available?user_id=charles_test_user"
echo -e "\n"

# 3. Vincular uma exchange (substitua com seus dados reais)
echo "3. Vinculando exchange..."
curl -X POST http://localhost:5000/api/v1/exchanges/link \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "charles_test_user",
    "exchange_id": "SEU_EXCHANGE_ID",
    "api_key": "SUA_API_KEY",
    "api_secret": "SEU_API_SECRET"
  }'
echo -e "\n"

# 4. Listar exchanges Conectadas
echo "4. Listando exchanges Conectadas..."
curl "http://localhost:5000/api/v1/exchanges/linked?user_id=charles_test_user"
echo -e "\n"

# 5. Buscar saldos
echo "5. Buscando saldos..."
curl "http://localhost:5000/api/v1/balances?user_id=charles_test_user"
echo -e "\n"

# 6. Ver evolução (7 dias)
echo "6. Evolução do portfolio..."
curl "http://localhost:5000/api/v1/balances/history/evolution?user_id=charles_test_user&period=7d"
echo -e "\n"
```

Salve como `test_api.sh` e execute:
```bash
chmod +x test_api.sh
./test_api.sh
```

## Erros Comuns e Soluções

### Erro: CORS / Network Error
**Solução:** Verifique se a API está rodando e acessível. A CSP no HTML já permite conexões para localhost:5000.

### Erro: 400 Bad Request - user_id required
**Solução:** Certifique-se de passar o user_id nos parâmetros da query ou body.

### Erro: 404 Not Found - Exchange not found
**Solução:** O exchange_id não existe no MongoDB. Liste as exchanges disponíveis primeiro.

### Erro: 401 Unauthorized - Invalid credentials
**Solução:** As API Keys estão incorretas. Verifique suas credenciais na exchange.

### Erro: 404 - No linked exchanges found
**Solução:** Você ainda não vinculou nenhuma exchange. Use o endpoint de link primeiro.

## Dados de Exemplo (Mock)

Se a API não estiver disponível, você pode usar estes dados para testar a interface:

```javascript
// Mock de exchanges disponíveis
const mockAvailable = {
  available_exchanges: [
    {
      _id: "693481148b0a41e8b6acb073",
      nome: "Binance",
      ccxt_id: "binance",
      description: "Maior exchange do mundo"
    },
    {
      _id: "693481148b0a41e8b6acb079",
      nome: "NovaDAX",
      ccxt_id: "novadax",
      description: "Exchange brasileira"
    }
  ]
};

// Mock de saldos
const mockBalances = {
  user_id: "charles_test_user",
  timestamp: new Date().toISOString(),
  summary: {
    total_usd: 1234.56,
    exchanges_count: 2
  },
  exchanges: [
    {
      exchange_id: "693481148b0a41e8b6acb073",
      name: "Binance",
      success: true,
      total_usd: 1000.00,
      tokens: {
        BTC: {
          amount: 0.01,
          price_usd: 50000,
          value_usd: 500
        },
        ETH: {
          amount: 0.2,
          price_usd: 2500,
          value_usd: 500
        }
      }
    }
  ],
  meta: {
    from_cache: false
  }
};
```

## Debug no Electron

Para ver logs detalhados:

1. Abra DevTools: `View > Toggle Developer Tools` ou `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows/Linux)
2. Vá para a aba `Console`
3. Todos os logs da aplicação aparecem aqui
4. Erros de API aparecem em vermelho

## Performance

A aplicação faz cache dos dados da API. Para forçar uma atualização:
- Use o botão "🔄 Atualizar" na view de Saldos
- Use `force_refresh=true` nas chamadas de API
- Limpe o cache usando o botão "🗑️ Limpar Cache"
