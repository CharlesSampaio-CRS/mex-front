# Como Testar a Aplicação

## ⚠️ IMPORTANTE: A API Backend Precisa Estar Rodando

A aplicação frontend precisa que a API backend esteja rodando em `http://localhost:5000`.

### Verificar se a API está rodando:

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

Se você receber erro de conexão, a API **não está rodando**.

---

## Opção 1: Testar com Dados Mockados (Recomendado para Teste)

Se você **não tem** a API backend rodando, pode usar dados de exemplo:

1. Inicie a aplicação Electron:
   ```bash
   npm start
   ```

2. Clique no botão **"🎭 Ativar Mock"** no topo da tela

3. A aplicação carregará dados de exemplo da documentação da API

---

## Opção 2: Usar a API Real

### Passo 1: Inicie a API Backend

Vá até o diretório da API e inicie o servidor:

```bash
# Exemplo (ajuste conforme seu projeto)
cd /path/to/api-backend
python app.py
# ou
python main.py
# ou
flask run
```

A API deve iniciar em `http://localhost:5000`

### Passo 2: Verifique a Conexão

```bash
curl http://localhost:5000/health
```

### Passo 3: Teste os Endpoints

```bash
# Listar exchanges disponíveis
curl "http://localhost:5000/api/v1/exchanges/available?user_id=charles_test_user"

# Listar exchanges Conectadas
curl "http://localhost:5000/api/v1/exchanges/linked?user_id=charles_test_user"

# Buscar saldos
curl "http://localhost:5000/api/v1/balances?user_id=charles_test_user"
```

### Passo 4: Inicie o Frontend

```bash
npm start
```

A aplicação deve:
- Mostrar "Online" no status da API
- Carregar exchanges Conectadas
- Mostrar saldos em USD/BRL

---

## Resolução de Problemas

### Erro: "API Offline" ou "Erro ao conectar"

**Causa:** A API backend não está rodando em localhost:5000

**Solução:**
1. Inicie a API backend primeiro
2. OU use o modo Mock clicando em "🎭 Ativar Mock"

### Erro: "CORS" ou "Blocked by CORS policy"

**Causa:** A API precisa permitir requisições do Electron

**Solução:** Configure CORS na API backend:
```python
from flask_cors import CORS
CORS(app)
```

### Erro: "No linked exchanges" mas você já vinculou exchanges

**Causa:** Os dados podem estar em outro banco ou user_id diferente

**Solução:** 
1. Verifique o user_id usado (padrão: "charles_test_user")
2. Confira os dados no MongoDB
3. Use o modo Mock para testar a interface

### Dados não aparecem mesmo com API online

**Causa:** Pode não haver exchanges Conectadas ou saldos

**Solução:**
1. Vá para "Exchanges" e vincule uma exchange
2. Espere alguns segundos para sincronização
3. Volte para Dashboard
4. OU use modo Mock para ver como ficaria com dados

---

## Fluxo Completo de Teste

### Com API Real:

1. ✅ Inicie a API backend (`python app.py`)
2. ✅ Verifique health (`curl localhost:5000/health`)
3. ✅ Inicie o frontend (`npm start`)
4. ✅ Vá para "Exchanges"
5. ✅ Clique em "Adicionar Exchange"
6. ✅ Preencha API Key e Secret
7. ✅ Volte para Dashboard
8. ✅ Veja os saldos aparecerem

### Com Dados Mockados:

1. ✅ Inicie o frontend (`npm start`)
2. ✅ Clique em "🎭 Ativar Mock"
3. ✅ Navegue pelas telas
4. ✅ Todos os dados de exemplo aparecem

---

## Estrutura Esperada

```
Backend API (Python/Flask)
├── Rodando em: http://localhost:5000
├── MongoDB conectado
└── Endpoints disponíveis: /health, /api/v1/exchanges/*, /api/v1/balances/*

Frontend (Electron)
├── Conecta em: http://localhost:5000
├── Modo Mock: Dados de exemplo
└── Modo Real: Busca da API
```

---

## Comandos Úteis

```bash
# Verificar se porta 5000 está em uso
lsof -i :5000

# Testar API health
curl http://localhost:5000/health

# Ver logs da API (se rodando em terminal)
# Ctrl+C para parar

# Compilar CSS do frontend
npm run build:css

# Iniciar frontend
npm start

# Modo desenvolvimento (auto-reload)
npm run dev
```

---

## Status Atual

✅ **Frontend:** Completo e funcional
❌ **Backend API:** Precisa estar rodando
🎭 **Modo Mock:** Disponível para testes sem backend

**Recomendação:** Use o modo Mock para testar a interface enquanto configura a API backend.
