// Serviço de comunicação com a API Multi-Exchange Balance
const API_BASE_URL = 'http://localhost:5000';

class MultiExchangeAPI {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.userId = 'charles_test_user'; // Pode ser configurável depois
  }

  // Helper para fazer requisições
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      // Verifica se a resposta é JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Se não for JSON, o endpoint provavelmente não existe
        if (options.silentFail) {
          console.log(`Endpoint não retornou JSON: ${endpoint}`);
          return null;
        }
        throw new Error(`Endpoint não disponível: ${endpoint}`);
      }

      const data = await response.json();

      if (!response.ok) {
        if (options.silentFail) {
          console.log(`Erro na requisição (${endpoint}):`, data.error || response.statusText);
          return null;
        }
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      if (options.silentFail) {
        console.log(`API endpoint falhou (${endpoint}):`, error.message);
        return null;
      }
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // 1. Health Check
  async healthCheck() {
    return this.request('/health');
  }

  // 2. Listar Exchanges Disponíveis
  async getAvailableExchanges() {
    const response = await this.request(`/api/v1/exchanges/available?user_id=${this.userId}`);
    // Normaliza a resposta (API pode retornar 'exchanges' ou 'available_exchanges')
    if (response.exchanges && !response.available_exchanges) {
      response.available_exchanges = response.exchanges;
    }
    return response;
  }

  // 3. Vincular Exchange (Link)
  async linkExchange(exchangeId, apiKey, apiSecret) {
    return this.request('/api/v1/exchanges/link', {
      method: 'POST',
      body: JSON.stringify({
        user_id: this.userId,
        exchange_id: exchangeId,
        api_key: apiKey,
        api_secret: apiSecret
      })
    });
  }

  // 4. Listar Exchanges Conectadas
  async getLinkedExchanges() {
    const response = await this.request(`/api/v1/exchanges/linked?user_id=${this.userId}`);
    // Normaliza a resposta (API retorna 'exchanges' mas esperamos 'linked_exchanges')
    if (response.exchanges && !response.linked_exchanges) {
      response.linked_exchanges = response.exchanges.map(ex => ({
        exchange_id: ex.exchange_id,
        exchange_name: ex.name,
        ccxt_id: ex.ccxt_id,
        is_active: true, // API real não retorna is_active, assumimos true
        linked_at: ex.linked_at,
        last_sync: ex.updated_at
      }));
      response.count = response.total || response.exchanges.length;
    }
    return response;
  }

  // 5. Desvincular Exchange (Unlink)
  async unlinkExchange(exchangeId) {
    return this.request('/api/v1/exchanges/unlink', {
      method: 'DELETE',
      body: JSON.stringify({
        user_id: this.userId,
        exchange_id: exchangeId
      })
    });
  }

  // 6. Buscar Saldos de Todas as Exchanges
  async getBalances(forceRefresh = false, currency = null) {
    let endpoint = `/api/v1/balances?user_id=${this.userId}`;
    
    if (forceRefresh) {
      endpoint += '&force_refresh=true';
    }
    
    if (currency) {
      endpoint += `&currency=${currency}`;
    }

    return this.request(endpoint);
  }

  // 7. Limpar Cache de Saldos
  async clearCache() {
    return this.request('/api/v1/balances/clear-cache', {
      method: 'POST',
      body: JSON.stringify({
        user_id: this.userId
      })
    });
  }

  // 8. Histórico de Saldos
  async getBalanceHistory(startDate = null, endDate = null, limit = 100) {
    let endpoint = `/api/v1/balances/history?user_id=${this.userId}&limit=${limit}`;
    
    if (startDate) {
      endpoint += `&start_date=${startDate}`;
    }
    
    if (endDate) {
      endpoint += `&end_date=${endDate}`;
    }

    return this.request(endpoint);
  }

  // 9. Último Snapshot de Saldo
  async getLatestSnapshot() {
    return this.request(`/api/v1/balances/history/latest?user_id=${this.userId}`);
  }

  // 10. Histórico de Token Específico
  async getTokenHistory(token, startDate = null, endDate = null, limit = 100) {
    let endpoint = `/api/v1/balances/history/token/${token}?user_id=${this.userId}&limit=${limit}`;
    
    if (startDate) {
      endpoint += `&start_date=${startDate}`;
    }
    
    if (endDate) {
      endpoint += `&end_date=${endDate}`;
    }

    return this.request(endpoint);
  }

  // 11. Evolução do Portfolio
  async getPortfolioEvolution(period = '7d') {
    const endpoint = `/api/v1/balances/history/evolution?user_id=${this.userId}&period=${period}`;
    console.log('🌐 API Call:', endpoint);
    const result = await this.request(endpoint);
    console.log('🌐 API Response:', result);
    return result;
  }

  // 12. Buscar Informações Completas de um Token em uma Exchange (via CCXT)
  async getTokenDetails(exchangeId, symbol, quote = 'USDT') {
    return this.request(`/api/v1/exchanges/${exchangeId}/token/${symbol}?user_id=${this.userId}&quote=${quote}`, {
      silentFail: true
    });
  }

  // 13. Buscar Ticker (Preço em Tempo Real) - Alias para getTokenDetails
  async getTokenTicker(exchangeId, symbol) {
    return this.getTokenDetails(exchangeId, symbol, 'USDT');
  }

  // 14. Buscar dados completos de uma exchange
  async getExchangeDetails(exchangeId, options = {}) {
    const params = new URLSearchParams({ user_id: this.userId });
    if (options.includeFees) {
      params.append('include_fees', 'true');
    }
    if (options.includeMarkets) {
      params.append('include_markets', 'true');
    }

    const endpoint = `/api/v1/exchanges/${exchangeId}?${params.toString()}`;
    return this.request(endpoint, { silentFail: true });
  }

  // Método auxiliar para definir o user_id
  setUserId(userId) {
    this.userId = userId;
  }

  // Método auxiliar para obter o user_id atual
  getUserId() {
    return this.userId;
  }
}

// Exporta a instância da API
const api = new MultiExchangeAPI();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
