# 📊 Estrutura de Dados de Saldos

## Dados da API Real (localhost:5000)

### 🎯 Summary (Resumo Geral)
```json
{
  "summary": {
    "total_usd": 134.98,      // Total de todas exchanges em USD
    "exchanges_count": 3       // Número de exchanges Conectadas
  }
}
```

### 🏢 Exchanges com Saldos

#### 1. **NovaDAX** 💰 $0.00
- **Total USD**: $0.00
- **Tokens**: 38 tokens (todos sem valor USD)
- **Principais tokens**:
  - PEPE: 0.6192 (sem preço)
  - FLOKI: 0.56 (sem preço)
  - BONK: 0.49488 (sem preço)
  - KISHU: 0.9264 (sem preço)
  - ELON: 0.995 (sem preço)
  - MOG: 0.579 (sem preço)
  - e mais 32 tokens...

#### 2. **Binance** 💰 $0.00
- **Total USD**: $0.00
- **Tokens**: 1 token
  - BRL: 0.00332774 (sem preço USD)

#### 3. **MEXC** 💰 $134.98 ⭐
- **Total USD**: $134.98
- **Tokens**: 3 tokens
  - **REKTCOIN**: 454,135,458.97 × $0.00 = **$134.83** ⭐ (PRINCIPAL)
  - **MX**: 0.07022369 × $2.1597 = **$0.15**
  - **ICG**: 12,069,255 × $0.00 = $0.00

---

## 🖥️ O Que a Tela de Saldos Deve Mostrar

### **Dashboard (Visão Geral)**
```
┌─────────────────────────────────────┐
│ 📊 RESUMO TOTAL                     │
├─────────────────────────────────────┤
│ Total USD:     $134.98              │
│ Total BRL:     R$ 684,54 (aprox)    │
│ Exchanges:     3 Conectadas         │
└─────────────────────────────────────┘
```

### **View de Saldos (Detalhada)**

#### **Por Exchange:**

```
┌─────────────────────────────────────────────────────┐
│ 🏢 MEXC                                    $134.98   │
├─────────────────────────────────────────────────────┤
│ Token        Quantidade              Preço    Valor │
│ REKTCOIN     454,135,458.97        $0.00    $134.83│ ⭐
│ MX                     0.07        $2.16      $0.15│
│ ICG          12,069,255.00        $0.00      $0.00│
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 🏢 NovaDAX                                   $0.00   │
├─────────────────────────────────────────────────────┤
│ Token        Quantidade              Preço    Valor │
│ PEPE                   0.62        $0.00      $0.00│
│ FLOKI                  0.56        $0.00      $0.00│
│ BONK                   0.49        $0.00      $0.00│
│ ... e mais 35 tokens sem preço                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 🏢 Binance                                   $0.00   │
├─────────────────────────────────────────────────────┤
│ Token        Quantidade              Preço    Valor │
│ BRL                 0.003           $0.00      $0.00│
└─────────────────────────────────────────────────────┘
```

---

## 📝 Observações Importantes

### ❗ Problema com Preços na NovaDAX
- **38 tokens** mas **TODOS com price_usd = 0.00**
- Possíveis causas:
  1. API da NovaDAX não está retornando preços
  2. Tokens não são suportados para conversão USD
  3. Erro na integração CCXT com NovaDAX
  4. Cache desatualizado

### ✅ MEXC Funcionando Bem
- **REKTCOIN**: Preço $0.00 mas **valor USD = $134.83** (calculado)
  - Isso sugere que o preço real é ~$0.000297 por token
  - 454,135,458.97 × $0.000297 ≈ $134.83
- **MX**: Preço e valor corretos ($2.16 × 0.07 = $0.15)

### 🔍 Por Que price_usd Pode Ser Zero?
1. **Preço muito baixo**: Memecoins com preços < $0.0000001
2. **Token não listado**: CoinGecko/CoinMarketCap não tem o preço
3. **API limitation**: Exchange não fornece preço em USD
4. **Valor calculado internamente**: Backend calcula sem expor preço unitário

---

## 🎨 Sugestões de UI

### **Filtros que Você Pode Adicionar:**
1. ✅ Mostrar apenas tokens com valor > $0
2. ✅ Ordenar por valor (maior → menor)
3. ✅ Agrupar por exchange
4. ✅ Buscar token específico
5. ✅ Exportar para CSV/PDF

### **Indicadores Visuais:**
- 🟢 **Verde**: Token com valor > $10
- 🟡 **Amarelo**: Token com valor $0.01 - $10
- 🔴 **Vermelho**: Token sem valor ou sem preço
- ⭐ **Destaque**: Token principal (maior valor)

### **Cards de Resumo:**
```
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ 💰 Total USD   │ │ 🏦 Exchanges   │ │ 🪙 Tokens      │
│   $134.98      │ │      3         │ │     42         │
└────────────────┘ └────────────────┘ └────────────────┘
```

---

## 🐛 Problemas a Investigar no Backend

1. **NovaDAX retornando todos preços = 0**
   ```bash
   # Verificar logs do backend
   # Testar chamada direta à API NovaDAX
   ```

2. **REKTCOIN com price_usd = 0 mas value_usd > 0**
   ```python
   # No backend, verificar:
   # - De onde vem o value_usd se price_usd = 0?
   # - Está pegando preço de outra fonte?
   ```

3. **Cache pode estar desatualizado**
   ```bash
   curl -X POST http://localhost:5000/api/v1/balances/clear-cache \
     -H "Content-Type: application/json" \
     -d '{"user_id": "charles_test_user"}'
   ```

---

## 📊 Estrutura JSON Completa

```json
{
  "user_id": "charles_test_user",
  "timestamp": "2025-12-06T22:23:06.401712",
  "summary": {
    "total_usd": 134.98,
    "exchanges_count": 3
  },
  "exchanges": [
    {
      "exchange_id": "693481148b0a41e8b6acb079",
      "name": "NovaDAX",
      "success": true,
      "total_usd": 0.0,
      "tokens": {
        "SYMBOL": {
          "amount": 0.0,
          "price_usd": 0.0,
          "value_usd": 0.0
        }
      }
    }
  ],
  "from_cache": true,
  "meta": {
    "from_cache": false
  }
}
```

---

## ✅ Checklist de Implementação

- [x] Dashboard mostra total USD/BRL
- [x] Dashboard mostra contagem de exchanges
- [ ] View Saldos lista todas exchanges
- [ ] View Saldos lista todos tokens por exchange
- [ ] Filtro para tokens com valor > 0
- [ ] Ordenação por valor
- [ ] Busca por nome do token
- [ ] Highlight no token principal
- [ ] Conversão USD → BRL
- [ ] Botão "Atualizar" (force refresh)
- [ ] Indicador de cache (from_cache)
- [ ] Export CSV/PDF
