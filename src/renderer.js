// Renderer Process - Interface integrada com a API Multi-Exchange

// Estado global da aplicação
const appState = {
  linkedExchanges: [],
  availableExchanges: [],
  balances: null,
  currentView: 'dashboard',
  updateInterval: null,
  selectedPeriod: '7d',
  hideZeroBalances: true, // Por padrão oculta exchanges zeradas (toggle inicia marcado)
  tickersLoading: {
    total: 0,
    loaded: 0,
    exchanges: {}
  },
  historyChart: null, // Armazena instância do Chart.js
  showBRL: false, // Mostrar valores em BRL
  language: 'pt', // Idioma padrão
  darkMode: true, // Dark mode ativado por padrão
  expandedExchanges: new Set(),
  activeTokenModal: null,
  exchangeDetailsCache: {},
  robotStrategies: [] // Estratégias de automação
};

// Lista de moedas fiduciárias e stablecoins
const FIAT_CURRENCIES = ['BRL', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'ARS', 'MXN'];
const STABLECOINS = ['USDT', 'USDC', 'BUSD', 'DAI', 'TUSD', 'USDP', 'USDD', 'GUSD', 'PYUSD', 'FDUSD'];

// Traduções do sistema
const translations = {
  pt: {
    // Dashboard
    total: 'Total',
    exchanges: 'Corretoras',
    tokens: 'Tokens',
    history: 'Histórico',
    settings: 'Configurações',
    loading: 'Carregando informações...',
    home: 'Início',
    robot: 'Robot',
    
    // Cards Dashboard
    totalPortfolio: 'Total',
    
    // Títulos de Seção
    connectedExchanges: 'Corretoras Conectadas',
    availableExchanges: 'Corretoras Disponíveis',
    tokenList: 'Lista de Tokens',
    priceHistory: 'Histórico de Preços',
    historyChartTitle: 'Evolução do Portfolio',
    
    // Botões
    refresh: 'Atualizar',
    save: 'Salvar',
    cancel: 'Cancelar',
    add: 'Adicionar',
    remove: 'Remover',
    edit: 'Editar',
    delete: 'Excluir',
    connect: 'Conectar',
    disconnect: 'Desconectar',
    details: 'Detalhes',
    addExchange: '+ Corretora',
    selectExchange: 'Selecione a Corretora',
    loadingExchanges: 'Carregando corretoras...',
    
    // Labels
    balance: 'Saldo',
    value: 'Valor',
    amount: 'Quantidade',
    price: 'Preço',
    change24h: 'Variação 24h',
    symbol: 'Símbolo',
    name: 'Nome',
    hideZero: 'Ocultar Zeradas',
    
    // Settings
    darkMode: 'Modo Escuro',
    darkModeDesc: 'Tema dark/light para o aplicativo',
    brlConversion: 'Conversão em Reais',
    brlConversionDesc: 'Mostrar valores também em BRL (R$)',
    language: 'Idioma',
    languageDesc: 'Português ou English',
    userId: 'ID do Usuário',
    userIdDesc: 'Identificador único para suas configurações',
    
    // Moedas
    fiatCurrency: '💵 Moeda Fiduciária',
    stablecoin: '🔒 Stablecoin',
    fiatDesc: 'Não possui variação de mercado',
    stablecoinDesc: 'Atrelada a moeda fiduciária',
    
    // Mensagens
    noData: 'Nenhum dado disponível',
    noExchanges: 'Nenhuma exchange conectada',
    noTokens: 'Nenhum token encontrado',
    loadingData: 'Carregando dados...',
    error: 'Erro',
    success: 'Sucesso',
    
    // Robot
    robotTitle: 'Robot - Automações',
    robotDesc: 'Configure estratégias automáticas de compra e venda',
    newStrategy: 'Nova Estratégia',
    strategyName: 'Nome da Estratégia',
    activeStrategies: 'Estratégias Ativas'
  },
  en: {
    // Dashboard
    total: 'Total',
    exchanges: 'Exchanges',
    tokens: 'Tokens',
    history: 'History',
    settings: 'Settings',
    loading: 'Loading information...',
    home: 'Home',
    robot: 'Robot',
    
    // Cards Dashboard
    totalPortfolio: 'Total',
    
    // Títulos de Seção
    connectedExchanges: 'Connected Exchanges',
    availableExchanges: 'Available Exchanges',
    tokenList: 'Token List',
    priceHistory: 'Price History',
    historyChartTitle: 'Portfolio Evolution',
    
    // Botões
    refresh: 'Refresh',
    save: 'Save',
    cancel: 'Cancel',
    add: 'Add',
    remove: 'Remove',
    edit: 'Edit',
    delete: 'Delete',
    connect: 'Connect',
    disconnect: 'Disconnect',
    details: 'Details',
    addExchange: '+ Exchange',
    selectExchange: 'Select Exchange',
    loadingExchanges: 'Loading exchanges...',
    
    // Labels
    balance: 'Balance',
    value: 'Value',
    amount: 'Amount',
    price: 'Price',
    change24h: '24h Change',
    symbol: 'Symbol',
    name: 'Name',
    hideZero: 'Hide Zero',
    
    // Settings
    darkMode: 'Dark Mode',
    darkModeDesc: 'Dark/light theme for the app',
    brlConversion: 'BRL Conversion',
    brlConversionDesc: 'Show values in BRL (R$)',
    language: 'Language',
    languageDesc: 'Portuguese or English',
    userId: 'User ID',
    userIdDesc: 'Unique identifier for your settings',
    
    // Moedas
    fiatCurrency: '💵 Fiat Currency',
    stablecoin: '🔒 Stablecoin',
    fiatDesc: 'No market variation',
    stablecoinDesc: 'Pegged to fiat currency',
    
    // Mensagens
    noData: 'No data available',
    noExchanges: 'No exchanges connected',
    noTokens: 'No tokens found',
    loadingData: 'Loading data...',
    error: 'Error',
    success: 'Success',
    
    // Robot
    robotTitle: 'Robot - Automations',
    robotDesc: 'Configure automatic buy and sell strategies',
    newStrategy: 'New Strategy',
    strategyName: 'Strategy Name',
    activeStrategies: 'Active Strategies'
  }
};

// Função para obter tradução
function t(key) {
  return translations[appState.language][key] || key;
}

// Função para verificar se é moeda fiduciária ou stablecoin
function isFiatOrStablecoin(symbol) {
  const upperSymbol = symbol.toUpperCase();
  return FIAT_CURRENCIES.includes(upperSymbol) || STABLECOINS.includes(upperSymbol);
}

// Função para obter o tipo de moeda
function getCurrencyType(symbol) {
  const upperSymbol = symbol.toUpperCase();
  if (FIAT_CURRENCIES.includes(upperSymbol)) {
    return { type: 'fiat', label: t('fiatCurrency'), description: t('fiatDesc') };
  }
  if (STABLECOINS.includes(upperSymbol)) {
    return { type: 'stablecoin', label: t('stablecoin'), description: t('stablecoinDesc') };
  }
  return null;
}

async function loadViewData(viewName) {
  try {
    switch(viewName) {
      case 'dashboard':
        await loadDashboardData();
        break;
      case 'exchanges':
        await loadExchangesData();
        break;
      case 'balances':
        await loadBalancesData();
        break;
      case 'history':
        await loadHistoryData('7d');
        break;
      case 'settings':
        loadSettingsData();
        break;
      case 'robot':
        loadRobotData();
        break;
      case 'orders':
        // TODO: Implementar carregamento de orders
        break;
      default:
        // console.warn('⚠️ View desconhecida:', viewName);
    }
  } catch (error) {
    console.error('❌ Erro em loadViewData:', error);
  }
}

// ==================== DASHBOARD ====================

async function loadDashboardData() {
  // console.log('📊 Carregando dados do dashboard...');
  try {
    // Carrega exchanges vinculadas
    const linkedData = await api.getLinkedExchanges();
    appState.linkedExchanges = linkedData.linked_exchanges || [];
    
    // Carrega balances
    const balances = await api.getBalances();
    appState.balances = balances;
    
    // Atualiza dashboard
    updateDashboardBalances(balances);
    
    // Se a função de renderização existir, usa ela
    if (typeof renderDashboardExchangesWithBalances === 'function') {
      renderDashboardExchangesWithBalances(appState.linkedExchanges, balances, {
        skipTickerRefresh: false,
        autoExpand: true
      });
      
      // Aguarda o carregamento de todos os tickers antes de finalizar
      if (appState.tickerPromises) {
        // console.log('⏳ Aguardando carregamento de tickers...');
        await appState.tickerPromises;
        // console.log('✅ Todos os tickers carregados');
      }
    } else {
      // Fallback: renderiza exchanges simples
      // console.warn('⚠️ renderDashboardExchangesWithBalances não encontrada, usando fallback');
      renderDashboardExchanges(appState.linkedExchanges);
    }
    
    // console.log('✅ Dashboard carregado com sucesso');
    
  } catch (error) {
    console.error('❌ Erro ao carregar dashboard:', error);
    
    // Renderiza mensagem de erro no dashboard
    const exchangesList = document.getElementById('dashboard-exchanges-list');
    if (exchangesList) {
      exchangesList.innerHTML = `
        <div class="text-center py-8">
          <p class="text-red-400 mb-2">❌ Erro ao carregar dados</p>
          <p class="text-dark-400 text-sm mb-4">${error.message || 'API offline?'}</p>
          <button class="btn-primary text-sm" onclick="loadDashboardData()">
            🔄 Tentar Novamente
          </button>
        </div>
      `;
    }
    
    // Atualiza total com zero
    const totalElement = document.getElementById('dashboard-total');
    if (totalElement) {
      totalElement.textContent = '$0.00';
      totalElement.classList.remove('text-green-400');
      totalElement.classList.add('text-red-400');
    }
  }
}

function renderTokensList(tokens, exchangeId, exchangeName) {
  const tokenEntries = Object.entries(tokens);
  
  // Não filtra mais nenhum token - mostra TODOS os ativos
  const tokensWithValue = tokenEntries.filter(([_, t]) => t.value_usd > 0);
  const tokensWithoutValue = tokenEntries.filter(([_, t]) => t.value_usd === 0);
  
  // Ordena tokens com valor por valor (maior primeiro)
  const sortedTokensWithValue = tokensWithValue.sort((a, b) => b[1].value_usd - a[1].value_usd);
  
  // Mostra todos os tokens (com e sem valor)
  const sortedTokens = [...sortedTokensWithValue, ...tokensWithoutValue];
  
  return `
    <div class="space-y-2">
      <div class="grid grid-cols-3 gap-2 px-3 py-2 text-xs text-dark-400 font-semibold border-b border-dark-700/50 bg-dark-800/30 rounded-t-lg">
        <div class="col-span-2">
          <span>Token</span>
        </div>
        <div class="text-right">Valor</div>
      </div>
      ${sortedTokens.length > 0 ? sortedTokens.map(([symbol, token]) => {
        const hasValue = token.value_usd > 0;
        
        // Verifica se é moeda fiduciária ou stablecoin
        const currencyInfo = getCurrencyType(symbol);
        const isFiatStable = currencyInfo !== null;
        
        // Extrai variações se já tiverem sido carregadas
        const change1h = token.change_1h;
        const change4h = token.change_4h;
        const change24h = token.change_24h;
        
        return `
          <div class="token-row"
               data-token-symbol="${symbol}"
               data-exchange-id="${exchangeId}"
               data-exchange-name="${exchangeName}"
               data-token-data='${JSON.stringify(token).replace(/'/g, "&apos;")}'>
            <div class="col-span-2 flex items-center space-x-2">
              <div class="w-8 h-8 rounded-full bg-gradient-to-br ${hasValue ? 'from-primary-600 to-primary-700' : 'from-dark-600 to-dark-700'} flex items-center justify-center text-xs font-bold shadow-md">
                ${symbol.substring(0, 2)}
              </div>
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <span class="font-semibold ${hasValue ? 'text-dark-100' : 'text-dark-400'}">${symbol}</span>
                </div>
                <div class="flex items-center space-x-2 mt-0.5">
                  <span class="text-xs text-dark-500">${formatNumber(token.amount)}</span>
                  <div class="flex items-center space-x-2 ticker-variations" data-symbol="${symbol}">
                    ${isFiatStable ? `
                      <span class="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30" title="${currencyInfo.description}">
                        ${currencyInfo.label}
                      </span>
                    ` : `
                      ${change1h !== undefined && change1h !== null ? `
                        <span class="text-[10px] px-1 py-0.5 rounded ${change1h >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}" title="1 hora">
                          1h: ${change1h >= 0 ? '▲' : '▼'}${Math.abs(change1h).toFixed(1)}%
                        </span>
                      ` : ''}
                      ${change4h !== undefined && change4h !== null ? `
                        <span class="text-[10px] px-1 py-0.5 rounded ${change4h >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}" title="4 horas">
                          4h: ${change4h >= 0 ? '▲' : '▼'}${Math.abs(change4h).toFixed(1)}%
                        </span>
                      ` : ''}
                      ${change24h !== undefined && change24h !== null ? `
                        <span class="text-[10px] px-1 py-0.5 rounded ${change24h >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}" title="24 horas">
                          24h: ${change24h >= 0 ? '▲' : '▼'}${Math.abs(change24h).toFixed(1)}%
                        </span>
                      ` : ''}
                    `}
                  </div>
                </div>
              </div>
            </div>
            <div class="text-right">
              <p class="font-semibold ${hasValue ? 'text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500' : 'text-dark-500'}">
                ${formatCurrency(token.value_usd)}
              </p>
              ${token.price_usd > 0 ? `<p class="text-xs text-dark-500">${formatTokenPrice(token.price_usd)}</p>` : ''}
            </div>
          </div>
        `;
      }).join('') : ''}
    </div>
  `;
}

// Função para toggle de detalhes
async function toggleExchangeDetails(exchangeId) {
  const details = document.getElementById(`details-${exchangeId}`);
  const icon = document.getElementById(`toggle-icon-${exchangeId}`);
  const textSpan = icon?.parentElement?.querySelector('span:last-child');
  
  if (details && icon) {
    if (details.classList.contains('hidden')) {
      // Expandir
      details.classList.remove('hidden');
      icon.style.transform = 'rotate(180deg)';
      if (textSpan) textSpan.textContent = 'Fechar detalhes';
      appState.expandedExchanges.add(exchangeId);
      
      // Os dados já foram carregados no início, apenas re-renderiza se necessário
      // (os tickers já estão sendo buscados em background)
      
    } else {
      // Comprimir
      details.classList.add('hidden');
      icon.style.transform = 'rotate(0deg)';
      if (textSpan) textSpan.textContent = 'Ver detalhes';
      appState.expandedExchanges.delete(exchangeId);
    }
  }
}

// Função para expandir automaticamente exchanges com saldo ao iniciar
function autoExpandExchanges() {
  // console.log('🔓 Auto-expandindo exchanges...');
  // console.log('📌 hideZeroBalances:', appState.hideZeroBalances);
  
  // Usa os dados de balances ao invés de tentar ler o DOM
  if (!appState.balances || !appState.balances.exchanges) {
    // console.log('⚠️ Dados de balances não disponíveis ainda');
    return;
  }
  
  appState.balances.exchanges.forEach(exchange => {
    const exchangeId = exchange.exchange_id;
    const totalUSD = exchange.total_usd || 0;
    const hasBalance = totalUSD > 0;
    
    // console.log(`\n📋 Exchange: ${exchange.name} (${exchangeId})`);
    // console.log('  💰 Total USD:', totalUSD);
    // console.log('  💵 Tem saldo?', hasBalance);
    
    const details = document.getElementById(`details-${exchangeId}`);
    const icon = document.getElementById(`toggle-icon-${exchangeId}`);
    const textSpan = icon?.parentElement?.querySelector('span:last-child');
    
    if (!details || !icon) {
      // console.log('  ❌ Elementos DOM não encontrados');
      return;
    }
    
    // LÓGICA:
    // - SEMPRE expande se tem saldo > 0
    // - Expande zeradas SOMENTE se hideZeroBalances estiver FALSE (desmarcado)
    const shouldExpand = hasBalance || !appState.hideZeroBalances;
    // console.log('  🎯 Deve expandir?', shouldExpand);
    
    if (shouldExpand) {
      details.classList.remove('hidden');
      icon.style.transform = 'rotate(180deg)';
      if (textSpan) textSpan.textContent = 'Fechar detalhes';
      appState.expandedExchanges.add(exchangeId);
      // console.log(`  ✅ EXPANDIDO!`);
    } else {
      appState.expandedExchanges.delete(exchangeId);
      // console.log(`  ⏭️  Mantido colapsado`);
    }
  });
}

function restoreExpandedExchanges() {
  appState.expandedExchanges.forEach(exchangeId => {
    const details = document.getElementById(`details-${exchangeId}`);
    const icon = document.getElementById(`toggle-icon-${exchangeId}`);
    const textSpan = icon?.parentElement?.querySelector('span:last-child');

    if (details && icon) {
      details.classList.remove('hidden');
      icon.style.transform = 'rotate(180deg)';
      if (textSpan) {
        textSpan.textContent = 'Fechar detalhes';
      }
    }
  });
}

// Função para buscar detalhes dos tokens de uma exchange (quando expandir)
async function fetchTokenDetailsForExchange(exchangeId, detailsElement) {
  try {
    // Adiciona indicador de carregamento
    const loadingIndicator = detailsElement.querySelector('.loading-indicator');
    if (!loadingIndicator) {
      const loader = document.createElement('div');
      loader.className = 'loading-indicator text-center py-2';
      loader.innerHTML = '<span class="text-primary-400 animate-pulse">⏳ Buscando informações detalhadas...</span>';
      detailsElement.insertBefore(loader, detailsElement.firstChild);
    }
    
    // Busca todos os tokens da exchange
    const tokenRows = detailsElement.querySelectorAll('.token-row');
    const tokenPromises = [];
    
    tokenRows.forEach(row => {
      const symbol = row.getAttribute('data-token-symbol');
      const tokenDataStr = row.getAttribute('data-token-data');
      
      if (tokenDataStr) {
        const tokenData = JSON.parse(tokenDataStr);
        
        // Apenas busca detalhes se o token tem valor
        if (tokenData.value_usd > 0) {
          tokenPromises.push(
            fetchTokenTicker(exchangeId, symbol, row)
          );
        }
      }
    });
    
    // Aguarda todas as requisições
    await Promise.all(tokenPromises);
    
    // Remove indicador de carregamento
    const loader = detailsElement.querySelector('.loading-indicator');
    if (loader) {
      loader.remove();
    }
    
  } catch (error) {
    console.error('Erro ao buscar detalhes dos tokens:', error);
    
    // Remove indicador de carregamento em caso de erro
    const loader = detailsElement.querySelector('.loading-indicator');
    if (loader) {
      loader.innerHTML = '<span class="text-red-400 text-xs">⚠️ Erro ao buscar informações</span>';
      setTimeout(() => loader.remove(), 3000);
    }
  }
}

// NOVA FUNÇÃO: Busca tickers de todos os tokens de uma exchange (SEM precisar expandir)
async function fetchAllTokenTickersForExchange(exchangeId, tokens) {
  try {
    // console.log(`🔄 Buscando tickers para exchange ${exchangeId}...`);
    
    const tokenEntries = Object.entries(tokens);
    // Filtra apenas tokens com valor (não exclui mais fiat/stablecoins para busca de ticker)
    const tokensWithValue = tokenEntries.filter(([symbol, t]) => t.value_usd > 0);
    
    // Registra total de tokens a carregar
    if (!appState.tickersLoading.exchanges[exchangeId]) {
      appState.tickersLoading.exchanges[exchangeId] = {
        total: tokensWithValue.length,
        loaded: 0
      };
      appState.tickersLoading.total += tokensWithValue.length;
    }
    
    // console.log(`📊 Exchange ${exchangeId}: ${tokensWithValue.length} tokens para buscar ticker (incluindo todos os ativos)`);
    
    // Busca tickers em paralelo (máximo 5 por vez para não sobrecarregar)
    const batchSize = 5;
    for (let i = 0; i < tokensWithValue.length; i += batchSize) {
      const batch = tokensWithValue.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async ([symbol, tokenData]) => {
          try {
            const result = await api.getTokenTicker(exchangeId, symbol);
            
            if (result && result.symbol) {
              // Atualiza o token no cache global
              if (appState.balances && appState.balances.exchanges) {
                const exchange = appState.balances.exchanges.find(ex => ex.exchange_id === exchangeId);
                if (exchange && exchange.tokens && exchange.tokens[symbol]) {
                  exchange.tokens[symbol].change_1h = result.change?.['1h']?.price_change_percent;
                  exchange.tokens[symbol].change_4h = result.change?.['4h']?.price_change_percent;
                  exchange.tokens[symbol].change_24h = result.change?.['24h']?.price_change_percent;
                  exchange.tokens[symbol].ticker = result;
                  
                  // Atualiza contador
                  appState.tickersLoading.loaded++;
                  appState.tickersLoading.exchanges[exchangeId].loaded++;
                  
                  // Calcula progresso (50% a 95% da barra total)
                  const tickerProgress = (appState.tickersLoading.loaded / appState.tickersLoading.total);
                  const totalProgress = 50 + (tickerProgress * 45); // 50% inicial + 45% para tickers
                  
                  // Só atualiza a barra de loading se ainda existir
                  const loadingScreen = document.getElementById('loading-screen');
                  if (loadingScreen && loadingScreen.style.display !== 'none') {
                    updateLoadingMessage(
                      `Carregando preços: ${appState.tickersLoading.loaded}/${appState.tickersLoading.total}`,
                      Math.round(totalProgress)
                    );
                  }
                  
                  // console.log(`✅ Ticker atualizado para ${symbol}: 1h=${exchange.tokens[symbol].change_1h}%, 4h=${exchange.tokens[symbol].change_4h}%, 24h=${exchange.tokens[symbol].change_24h}%`);
                  
                  // Atualiza a UI se a exchange estiver expandida
                  const detailsDiv = document.getElementById(`details-${exchangeId}`);
                  if (detailsDiv && !detailsDiv.classList.contains('hidden')) {
                    const tokenRow = detailsDiv.querySelector(`.token-row[data-token-symbol="${symbol}"]`);
                    if (tokenRow) {
                      updateTokenRowWithTicker(tokenRow, result);
                    }
                  }
                }
              }
            }
          } catch (error) {
            // console.log(`⚠️ Erro ao buscar ticker para ${symbol}:`, error.message);
          }
        })
      );
      
      // Pequeno delay entre batches
      if (i + batchSize < tokensWithValue.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // console.log(`✅ Tickers atualizados para exchange ${exchangeId}`);
    
  } catch (error) {
    console.error(`❌ Erro ao buscar tickers da exchange ${exchangeId}:`, error);
  }
}

// Função para buscar ticker de um token específico
async function fetchTokenTicker(exchangeId, symbol, rowElement) {
  try {
    // Busca informações completas do token via CCXT
    const result = await api.getTokenTicker(exchangeId, symbol);
    
    // console.log(`✅ Ticker para ${symbol}:`, result);
    
    if (result && result.symbol) {
      // console.log(`✅ Atualizando row para ${symbol} com dados:`, result);
      // Atualiza a linha do token com informações adicionais
      updateTokenRowWithTicker(rowElement, result);
    } else {
      // console.log(`⚠️ Sem dados de ticker para ${symbol} na exchange ${exchangeId}`);
    }
  } catch (error) {
    // console.log(`❌ Erro ao buscar ticker para ${symbol}:`, error);
  }
}

// Função para atualizar linha do token com dados do ticker
function updateTokenRowWithTicker(rowElement, tokenInfo) {
  // console.log('📝 Atualizando tokenData com:', tokenInfo);
  
  // Pega o símbolo do token
  const symbol = rowElement.getAttribute('data-token-symbol');
  
  // Verifica se é moeda fiduciária ou stablecoin
  const currencyInfo = getCurrencyType(symbol);
  const isFiatStable = currencyInfo !== null;
  
  // Atualiza as badges de variação inline na lista
  const variationsContainer = rowElement.querySelector('.ticker-variations');
  if (variationsContainer) {
    // Se for fiat/stablecoin, mostra badge especial
    if (isFiatStable) {
      variationsContainer.innerHTML = `
        <span class="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30" title="${currencyInfo.description}">
          ${currencyInfo.label}
        </span>
      `;
    } else {
      // Se for token normal, mostra variações de preço
      const change1h = tokenInfo.change?.['1h']?.price_change_percent;
      const change4h = tokenInfo.change?.['4h']?.price_change_percent;
      const change24h = tokenInfo.change?.['24h']?.price_change_percent;
      
      let variationsHTML = '';
      
      if (change1h !== undefined && change1h !== null) {
        variationsHTML += `
          <span class="text-[10px] px-1 py-0.5 rounded ${change1h >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}" title="1 hora">
            1h: ${change1h >= 0 ? '▲' : '▼'}${Math.abs(change1h).toFixed(1)}%
          </span>
        `;
      }
      
      if (change4h !== undefined && change4h !== null) {
        variationsHTML += `
          <span class="text-[10px] px-1 py-0.5 rounded ${change4h >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}" title="4 horas">
            4h: ${change4h >= 0 ? '▲' : '▼'}${Math.abs(change4h).toFixed(1)}%
          </span>
        `;
      }
      
      if (change24h !== undefined && change24h !== null) {
        variationsHTML += `
          <span class="text-[10px] px-1 py-0.5 rounded ${change24h >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}" title="24 horas">
            24h: ${change24h >= 0 ? '▲' : '▼'}${Math.abs(change24h).toFixed(1)}%
          </span>
        `;
      }
      
      variationsContainer.innerHTML = variationsHTML;
    }
  }
  
  // Atualiza o data attribute com informações completas
  const currentData = JSON.parse(rowElement.getAttribute('data-token-data'));
  const updatedData = {
    ...currentData,
    ticker: tokenInfo,
    change_24h: change24h,
    change_1h: change1h,
    change_4h: change4h,
    volume_24h: tokenInfo.volume?.quote_24h,
    high_24h: tokenInfo.price?.high_24h,
    low_24h: tokenInfo.price?.low_24h,
    pair: tokenInfo.pair,
    contract: tokenInfo.contract
  };
  
  // console.log('📦 Dados salvos no row:', updatedData);
  rowElement.setAttribute('data-token-data', JSON.stringify(updatedData));
}

// Função para mostrar modal de detalhes do token
async function showTokenModal(symbol, tokenData, exchangeId, exchangeName) {
  // console.log('🔍 Abrindo modal para token:', symbol, 'na exchange:', exchangeName);
  
  appState.activeTokenModal = { symbol, exchangeId, exchangeName };
  
  // Mostra modal com loading primeiro
  showTokenModalWithLoading(symbol, tokenData, exchangeName);
  
  // Busca dados completos do ticker da API
  try {
    const tickerData = await api.getTokenTicker(exchangeId, symbol);
    
    // console.log('✅ Dados do ticker recebidos:', tickerData);
    
    // Atualiza o modal com os dados completos
    updateTokenModalWithData(symbol, tokenData, exchangeName, tickerData);
  } catch (error) {
    console.error('❌ Erro ao buscar dados do ticker:', error);
    // Atualiza modal mostrando apenas dados básicos
    updateTokenModalWithData(symbol, tokenData, exchangeName, null);
  }
}

// Função para mostrar modal com loading
function showTokenModalWithLoading(symbol, tokenData, exchangeName) {
  const currencyInfo = getCurrencyType(symbol);
  const isFiatStable = currencyInfo !== null;
  
  const modalHTML = `
    <div id="token-modal" class="modal-overlay animate-fade-in">
      <div class="modal-content animate-scale-in max-h-[90vh] overflow-hidden" style="min-height: 700px;">
        <!-- Header -->
        <div class="relative p-4 border-b border-primary-500/30 bg-gradient-to-r from-primary-900/20 via-dark-800 to-dark-900">
          <div class="flex-1 text-center">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 shadow-lg shadow-primary-500/30 mb-2">
              <span class="text-2xl">${isFiatStable ? (currencyInfo.type === 'fiat' ? '💵' : '🔒') : '💎'}</span>
            </div>
            <h2 class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">${symbol}</h2>
            <p class="text-xs text-dark-400 mt-0.5">${exchangeName}</p>
          </div>
          <button class="absolute top-3 right-3 text-dark-400 hover:text-dark-100 text-2xl leading-none transition-all hover:rotate-90 duration-300 close-modal-btn" data-action="close">×</button>
        </div>
        
        <!-- Loading Content -->
        <div id="modal-content" class="flex flex-col items-center justify-center" style="height: 600px;">
          <!-- Spinner Principal de Loading (versão menor) -->
          <div class="relative">
            <!-- Círculo externo pulsante -->
            <div class="w-24 h-24 mx-auto rounded-full border-4 border-primary-500/20" 
                 style="animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></div>
            
            <!-- Spinner principal girando suavemente -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-20 h-20 rounded-full border-3 border-transparent border-t-primary-500 border-r-primary-400" 
                   style="animation: spin-smooth 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;"></div>
            </div>
            
            <!-- Spinner do meio -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-16 h-16 rounded-full border-3 border-transparent border-r-primary-500 border-b-primary-400" 
                   style="animation: spin-smooth 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;"></div>
            </div>
            
            <!-- Spinner interno menor -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-12 h-12 rounded-full border-2 border-transparent border-b-primary-600 border-l-primary-500" 
                   style="animation: spin-smooth 2s cubic-bezier(0.4, 0, 0.2, 1) infinite reverse;"></div>
            </div>
            
            <!-- Spinner mais interno -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-8 h-8 rounded-full border-2 border-transparent border-t-primary-600 border-r-primary-700" 
                   style="animation: spin-smooth 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;"></div>
            </div>
            
            <!-- Centro com ponto brilhante -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-2 h-2 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary-500/50"
                   style="animation: pulse-ring 1s ease-in-out infinite;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Remove modal anterior se existir
  const existingModal = document.getElementById('token-modal');
  if (existingModal) existingModal.remove();
  
  // Adiciona modal ao body
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Adiciona event listeners
  attachModalCloseListeners();
}

// Função para atualizar modal com dados completos
function updateTokenModalWithData(symbol, tokenData, exchangeName, tickerData) {
  const modalContent = document.getElementById('modal-content');
  if (!modalContent) return;
  
  // Verifica se é moeda fiduciária ou stablecoin
  const currencyInfo = getCurrencyType(symbol);
  const isFiatStable = currencyInfo !== null;
  
  // Usa dados do ticker se disponível
  const ticker = tickerData || tokenData.ticker;
  const hasTicker = ticker && ticker.symbol;
  
  // Usa preço do ticker se disponível
  const currentPrice = ticker?.price?.current || tokenData.price_usd || 0;
  
  // console.log('📊 Atualizando modal - Preço:', currentPrice, 'Ticker:', hasTicker);
  
  // Extrai dados das variações
  const change1h = ticker?.change?.['1h']?.price_change_percent;
  const change4h = ticker?.change?.['4h']?.price_change_percent;
  const change24h = ticker?.change?.['24h']?.price_change_percent;
  
  // Extrai dados de preço e volume
  const volume24h = ticker?.volume?.quote_24h;
  const high24h = ticker?.price?.high_24h;
  const low24h = ticker?.price?.low_24h;
  
  const contentHTML = `
    <div class="p-4 space-y-3">
      <!-- Linha 1: Preço e Valor -->
      <div class="grid grid-cols-2 gap-3">
        <div class="p-3 bg-gradient-to-br from-emerald-500/10 to-green-600/10 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 group">
          <div class="flex items-center space-x-1.5 mb-1.5">
            <span class="text-base">💵</span>
            <p class="text-xs text-dark-400 font-medium">Preço Unitário</p>
          </div>
          <p class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">${formatTokenPrice(currentPrice)}</p>
          ${change24h !== undefined && change24h !== null && change24h !== 0 ? `
            <div class="mt-1.5 inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-full text-xs ${change24h >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}">
              <span class="font-bold">${change24h >= 0 ? '▲' : '▼'} ${Math.abs(change24h).toFixed(2)}%</span>
              <span class="opacity-70">(24h)</span>
            </div>
          ` : ''}
        </div>
        <div class="p-3 bg-gradient-to-br from-primary-500/10 to-blue-600/10 rounded-xl border border-primary-500/20 hover:border-primary-500/40 transition-all duration-300 group">
          <div class="flex items-center space-x-1.5 mb-1.5">
            <span class="text-base">💰</span>
            <p class="text-xs text-dark-400 font-medium">Saldo Total</p>
          </div>
          <p class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-blue-500">${formatCurrency(tokenData.value_usd)}</p>
          <p class="text-xs text-dark-400 mt-1.5 flex items-center space-x-1">
            <span class="w-1 h-1 rounded-full bg-primary-500 animate-pulse"></span>
            <span>${formatNumber(tokenData.amount)} ${symbol}</span>
          </p>
        </div>
      </div>
      
      ${isFiatStable ? `
      <!-- Alerta: Moeda Fiduciária / Stablecoin -->
      <div class="p-3 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl border border-blue-500/30">
        <div class="flex items-center space-x-2">
          <span class="text-2xl">${currencyInfo.type === 'fiat' ? '💵' : '🔒'}</span>
          <div class="flex-1">
            <p class="text-sm font-semibold text-blue-400">${currencyInfo.label}</p>
            <p class="text-xs text-blue-300/70 mt-0.5">${currencyInfo.description}</p>
          </div>
        </div>
      </div>
      ` : ''}
      
      ${!isFiatStable && hasTicker && (change1h !== undefined || change4h !== undefined || change24h !== undefined) && (change1h !== 0 || change4h !== 0 || change24h !== 0) ? `
      <!-- Linha 2: Variações Compactas -->
      <div class="p-3 bg-gradient-to-br from-dark-700/30 to-dark-800/30 rounded-xl border border-dark-600/50">
        <div class="flex items-center space-x-1.5 mb-2">
          <span class="text-sm">📊</span>
          <p class="text-xs text-dark-300 font-semibold">Variações de Preço</p>
        </div>
        <div class="grid grid-cols-3 gap-2">
          ${change1h !== undefined && change1h !== null && change1h !== 0 ? `
            <div class="text-center p-2 bg-dark-800/50 rounded-lg border ${change1h >= 0 ? 'border-green-500/20' : 'border-red-500/20'}">
              <p class="text-[9px] text-dark-500 mb-0.5 uppercase tracking-wider">1h</p>
              <p class="text-sm font-bold ${change1h >= 0 ? 'text-green-400' : 'text-red-400'}">
                ${change1h >= 0 ? '▲' : '▼'}${Math.abs(change1h).toFixed(2)}%
              </p>
            </div>
          ` : ''}
          ${change4h !== undefined && change4h !== null && change4h !== 0 ? `
            <div class="text-center p-2 bg-dark-800/50 rounded-lg border ${change4h >= 0 ? 'border-green-500/20' : 'border-red-500/20'}">
              <p class="text-[9px] text-dark-500 mb-0.5 uppercase tracking-wider">4h</p>
              <p class="text-sm font-bold ${change4h >= 0 ? 'text-green-400' : 'text-red-400'}">
                ${change4h >= 0 ? '▲' : '▼'}${Math.abs(change4h).toFixed(2)}%
              </p>
            </div>
          ` : ''}
          ${change24h !== undefined && change24h !== null && change24h !== 0 ? `
            <div class="text-center p-2 bg-dark-800/50 rounded-lg border ${change24h >= 0 ? 'border-green-500/20' : 'border-red-500/20'}">
              <p class="text-[9px] text-dark-500 mb-0.5 uppercase tracking-wider">24h</p>
              <p class="text-sm font-bold ${change24h >= 0 ? 'text-green-400' : 'text-red-400'}">
                ${change24h >= 0 ? '▲' : '▼'}${Math.abs(change24h).toFixed(2)}%
              </p>
            </div>
          ` : ''}
        </div>
      </div>
      ` : ''}
      
      ${hasTicker && (high24h || low24h || volume24h) && (high24h > 0 || low24h > 0 || volume24h > 0) ? `
      <!-- Linha 3: Dados 24h Compactos -->
      <div class="p-3 bg-gradient-to-br from-dark-700/30 to-dark-800/30 rounded-xl border border-dark-600/50">
        <div class="flex items-center space-x-1.5 mb-2">
          <span class="text-sm">📈</span>
          <p class="text-xs text-dark-300 font-semibold">Estatísticas 24h</p>
        </div>
        <div class="grid grid-cols-3 gap-2">
          ${high24h ? `
            <div class="text-center p-2 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-lg border border-green-500/20">
              <p class="text-[9px] text-green-400/70 mb-0.5 uppercase tracking-wider">⬆ Alta</p>
              <p class="text-xs font-semibold text-green-400">${formatTokenPrice(high24h)}</p>
            </div>
          ` : ''}
          ${low24h ? `
            <div class="text-center p-2 bg-gradient-to-br from-red-500/5 to-rose-500/5 rounded-lg border border-red-500/20">
              <p class="text-[9px] text-red-400/70 mb-0.5 uppercase tracking-wider">⬇ Baixa</p>
              <p class="text-xs font-semibold text-red-400">${formatTokenPrice(low24h)}</p>
            </div>
          ` : ''}
          ${volume24h ? `
            <div class="text-center p-2 bg-gradient-to-br from-primary-500/5 to-blue-500/5 rounded-lg border border-primary-500/20">
              <p class="text-[9px] text-primary-400/70 mb-0.5 uppercase tracking-wider">📊 Vol</p>
              <p class="text-xs font-semibold text-primary-400">${formatCurrency(volume24h)}</p>
            </div>
          ` : ''}
        </div>
      </div>
      ` : ''}
      
      ${!hasTicker && !isFiatStable ? `
      <!-- Aviso: Sem dados do ticker -->
      <div class="p-3 bg-gradient-to-br from-yellow-500/10 to-orange-600/10 rounded-xl border border-yellow-500/30">
        <div class="flex items-center space-x-2">
          <span class="text-2xl">⚠️</span>
          <div class="flex-1">
            <p class="text-sm font-semibold text-yellow-400">Dados Limitados</p>
            <p class="text-xs text-yellow-300/70 mt-0.5">Informações de mercado não disponíveis para este token</p>
          </div>
        </div>
      </div>
      ` : ''}
      
      <!-- Footer Compacto -->
      <div class="pt-1">
        <button class="w-full py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white font-semibold rounded-lg shadow-lg shadow-primary-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-95 close-modal-btn" data-action="close">
          ✨ Fechar
        </button>
      </div>
    </div>
  `;
  
  // Atualiza o conteúdo do modal com animação suave
  modalContent.style.opacity = '0';
  setTimeout(() => {
    modalContent.innerHTML = contentHTML;
    modalContent.style.opacity = '1';
    modalContent.style.transition = 'opacity 0.3s ease-in-out';
    
    // Reanexa event listeners dos botões de fechar
    attachModalCloseListeners();
  }, 150);
}

// Função para anexar event listeners de fechar modal
function attachModalCloseListeners() {
  const tokenModal = document.getElementById('token-modal');
  if (tokenModal) {
    tokenModal.querySelectorAll('.close-modal-btn').forEach(btn => {
      btn.addEventListener('click', closeTokenModal);
    });

    tokenModal.addEventListener('click', (e) => {
      if (e.target.id === 'token-modal') {
        closeTokenModal();
      }
    });
    
    // Adiciona listener para teclas (ESC, Enter, Space, etc.)
    const keyHandler = (e) => {
      // Fecha o modal ao pressionar qualquer tecla
      closeTokenModal();
      document.removeEventListener('keydown', keyHandler);
    };
    document.addEventListener('keydown', keyHandler);
  }
}

// Função para fechar modal
function closeTokenModal() {
  const modal = document.getElementById('token-modal');
  if (modal) {
    modal.classList.add('animate-fade-out');
    setTimeout(() => modal.remove(), 200);
  }
  appState.activeTokenModal = null;
}

function renderDashboardExchanges(exchanges) {
  // Função obsoleta - substituída por renderDashboardExchangesWithBalances
  console.warn('renderDashboardExchanges is deprecated');
}

function renderDashboardExchangesWithBalances(exchanges, balances, options = {}) {
  console.log('📊 renderDashboardExchangesWithBalances chamada');
  const container = document.getElementById('dashboard-exchanges-list');
  const { skipTickerRefresh = false, autoExpand = false } = options;
  
  if (!container) {
    console.error('❌ Container dashboard-exchanges-list não encontrado');
    return;
  }
  
  if (!exchanges || exchanges.length === 0) {
    container.innerHTML = '<p class="text-dark-400 text-center py-8">Nenhuma exchange vinculada</p>';
    return;
  }
  
  // Cria mapa de balances por exchange_id
  const balanceMap = {};
  if (balances && balances.exchanges) {
    balances.exchanges.forEach(ex => {
      balanceMap[ex.exchange_id] = ex;
    });
  }
  
  // Ordena exchanges por valor (maior primeiro)
  const sortedExchanges = [...exchanges].sort((a, b) => {
    const totalA = balanceMap[a.exchange_id]?.total_usd || 0;
    const totalB = balanceMap[b.exchange_id]?.total_usd || 0;
    return totalB - totalA;
  });
  
  // Filtra exchanges zeradas se o toggle estiver ativo
  const filteredExchanges = appState.hideZeroBalances 
    ? sortedExchanges.filter(ex => {
        const totalUSD = balanceMap[ex.exchange_id]?.total_usd || 0;
        return totalUSD > 0;
      })
    : sortedExchanges;
  
  container.innerHTML = filteredExchanges.map(ex => {
    const balance = balanceMap[ex.exchange_id];
    const totalUSD = balance?.total_usd || 0;
    const tokens = balance?.tokens || {};
    const tokenCount = Object.keys(tokens).length;
    const tokensWithValue = Object.values(tokens).filter(t => t.value_usd > 0).length;
    const iconPath = getExchangeIcon(ex.ccxt_id || ex.exchange_name);
    
    return `
      <div class="exchange-card animate-slide-up">
        <!-- Exchange Header - Clicável -->
        <div class="exchange-header" data-exchange-id="${ex.exchange_id}">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-white to-gray-100 p-2.5 flex items-center justify-center flex-shrink-0 shadow-lg border border-dark-600 transform transition-transform duration-300 hover:scale-110">
                <img src="${iconPath}" alt="${ex.exchange_name}" class="w-full h-full object-contain" 
                     onerror="this.onerror=null; this.parentElement.innerHTML='<span class=\'text-2xl\'>${totalUSD > 0 ? '💰' : '🔗'}</span>';">
              </div>
              <div>
                <h3 class="font-bold text-dark-100 text-lg tracking-tight">${ex.exchange_name}</h3>
                <div class="flex items-center space-x-2 mt-1">
                  <span class="text-xs text-dark-400 bg-dark-700/50 px-2 py-0.5 rounded-full">${tokenCount} tokens</span>
                  <span class="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">${tokensWithValue} com valor</span>
                </div>
              </div>
            </div>
            <div class="text-right">
              <p class="text-2xl font-bold ${totalUSD > 0 ? 'text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500' : 'text-dark-400'}">
                ${formatCurrency(totalUSD)}
              </p>
              <span class="text-primary-400 text-xs mt-2 inline-flex items-center space-x-1 hover:text-primary-300 transition-colors">
                <span id="toggle-icon-${ex.exchange_id}" class="transform transition-transform duration-300">▼</span>
                <span>Ver detalhes</span>
              </span>
            </div>
          </div>
        </div>
        
        <!-- Exchange Details - Expansível -->
        <div id="details-${ex.exchange_id}" class="hidden bg-dark-800/30 backdrop-blur-sm animate-slide-down">
          <div class="p-4">
            ${tokenCount > 0 ? renderTokensList(tokens, ex.exchange_id, ex.exchange_name) : '<p class="text-dark-400 text-center py-4">Nenhum token</p>'}
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  // Adiciona event listeners após renderizar
  document.querySelectorAll('.exchange-header').forEach(header => {
    header.addEventListener('click', function() {
      const exchangeId = this.getAttribute('data-exchange-id');
      toggleExchangeDetails(exchangeId);
    });
  });
  
  // Adiciona event listeners para tokens (modal)
  document.querySelectorAll('.token-row').forEach(row => {
    row.addEventListener('click', function() {
      const symbol = this.getAttribute('data-token-symbol');
      const exchangeId = this.getAttribute('data-exchange-id');
      const exchangeName = this.getAttribute('data-exchange-name');
      const tokenData = JSON.parse(this.getAttribute('data-token-data'));
      showTokenModal(symbol, tokenData, exchangeId, exchangeName);
    });
  });
  
  // Carrega variações de preço (tickers) para todas as exchanges
  if (!skipTickerRefresh) {
    const tickerPromises = filteredExchanges.map(ex => {
      const balance = balanceMap[ex.exchange_id];
      if (balance && balance.tokens) {
        return fetchAllTokenTickersForExchange(ex.exchange_id, balance.tokens);
      }
      return Promise.resolve();
    });
    
    // Armazena as promises no appState para aguardar no loading se necessário
    appState.tickerPromises = Promise.all(tickerPromises);
  }
  
  // Auto-expande exchanges se solicitado
  if (autoExpand) {
    setTimeout(() => {
      autoExpandExchanges();
    }, 100);
  }
  
  console.log(`✅ Renderizadas ${filteredExchanges.length} exchanges no dashboard`);
}

function updateDashboardBalances(balances) {
  const totalUSD = balances.summary?.total_usd || 0;
  
  // Atualiza total geral
  const totalEl = document.getElementById('dashboard-total');
  if (totalEl) totalEl.textContent = formatCurrency(totalUSD);
  
  // Calcula totais de BRL, USDT e USDC
  let totalBRL = 0;
  let totalUSDT = 0;
  let totalUSDC = 0;
  
  if (balances.exchanges && Array.isArray(balances.exchanges)) {
    balances.exchanges.forEach(exchange => {
      if (exchange.tokens) {
        
        // Soma BRL (força conversão para número)
        if (exchange.tokens.BRL) {
          totalBRL += parseFloat(exchange.tokens.BRL.amount) || 0;
        }
        // Soma USDT (força conversão para número)
        if (exchange.tokens.USDT) {
          totalUSDT += parseFloat(exchange.tokens.USDT.amount) || 0;
        }
        // Soma USDC (força conversão para número)
        if (exchange.tokens.USDC) {
          totalUSDC += parseFloat(exchange.tokens.USDC.amount) || 0;
        }
      }
    });
  }
  
  // Atualiza cards individuais SEM conversão
  const brlMultiplier = 5.07; // Taxa de conversão USD para BRL (apenas para comparação)
  
  // Card BRL - sempre em BRL (arredonda para 0 se menor que 1 centavo)
  const brlEl = document.getElementById('dashboard-brl');
  if (brlEl) {
    brlEl.textContent = totalBRL >= 0.01 
      ? `R$ ${formatNumber(totalBRL)}` 
      : 'R$ 0,00';
  }
  
  // Card USDT - sempre em USD (sem conversão)
  const usdtEl = document.getElementById('dashboard-usdt');
  if (usdtEl) {
    usdtEl.textContent = totalUSDT > 0 ? `$ ${formatNumber(totalUSDT)}` : '$0.00';
  }
  
  // Card USDC - sempre em USD (sem conversão)
  const usdcEl = document.getElementById('dashboard-usdc');
  if (usdcEl) {
    usdcEl.textContent = totalUSDC > 0 ? `$ ${formatNumber(totalUSDC)}` : '$0.00';
  }
  
  console.log('💰 Totais calculados:', { totalUSD, totalBRL, totalUSDT, totalUSDC });
  
  // Reordena cards: valores > 0 primeiro (ordenados por valor USD), depois os zerados
  const brlToUSD = totalBRL / brlMultiplier; // Converte BRL para USD para comparação
  const valuesToCompare = {
    totalUSD,           // Total já está em USD
    totalBRL: brlToUSD, // BRL convertido para USD (apenas para comparação)
    totalUSDT,          // USDT já está em USD
    totalUSDC           // USDC já está em USD
  };
  console.log('📊 Valores para ordenação (em USD):', valuesToCompare);
  console.log('📊 BRL original:', totalBRL, 'BRL em USD:', brlToUSD);
  reorderCardsByValue(valuesToCompare);
}

// Função para reordenar cards por valor
// Cards com valor > 0 primeiro (ordenados), depois os zerados
function reorderCardsByValue(values) {
  const container = document.querySelector('#dashboard-view > div.mb-6');
  if (!container) {
    console.warn('⚠️ Container de cards não encontrado');
    return;
  }
  
  // Cria array com informações dos cards
  const cards = [
    { id: 'total', value: values.totalUSD, element: null },
    { id: 'brl', value: values.totalBRL, element: null },
    { id: 'usdt', value: values.totalUSDT, element: null },
    { id: 'usdc', value: values.totalUSDC, element: null }
  ];
  
  console.log('🔄 Cards antes de ordenar:', cards.map(c => ({ id: c.id, value: c.value })));
  
  // Pega os elementos dos cards
  const allCards = Array.from(container.children);
  cards[0].element = allCards.find(el => el.querySelector('#dashboard-total'));
  cards[1].element = allCards.find(el => el.querySelector('#dashboard-brl'));
  cards[2].element = allCards.find(el => el.querySelector('#dashboard-usdt'));
  cards[3].element = allCards.find(el => el.querySelector('#dashboard-usdc'));
  
  // Separa cards com valor > 0 e valor = 0
  const cardsWithValue = cards.filter(c => c.value > 0).sort((a, b) => b.value - a.value);
  const cardsWithoutValue = cards.filter(c => c.value === 0);
  
  console.log('📈 Cards COM valor (>0):', cardsWithValue.map(c => ({ id: c.id, value: c.value })));
  console.log('📉 Cards SEM valor (=0):', cardsWithoutValue.map(c => ({ id: c.id, value: c.value })));
  
  // Combina: primeiro os com valor (maior para menor), depois os zerados
  const sortedCards = [...cardsWithValue, ...cardsWithoutValue];
  
  console.log('✅ Cards após ordenar:', sortedCards.map(c => ({ id: c.id, value: c.value })));
  
  // Reordena os elementos no DOM
  sortedCards.forEach((card, index) => {
    if (card.element) {
      console.log(`📌 Movendo card ${card.id} para posição ${index + 1}`);
      container.appendChild(card.element);
    } else {
      console.warn(`⚠️ Card ${card.id} não tem elemento!`);
    }
  });
}

// ==================== EXCHANGES ====================

async function loadExchangesData() {
  try {
    // Carrega exchanges disponíveis
    const availableData = await api.getAvailableExchanges();
    appState.availableExchanges = availableData.available_exchanges || [];
    renderAvailableExchanges(appState.availableExchanges);
    populateExchangeSelect(appState.availableExchanges);
    
    // Carrega exchanges Conectadas
    const linkedData = await api.getLinkedExchanges();
    appState.linkedExchanges = linkedData.linked_exchanges || [];
    renderLinkedExchanges(appState.linkedExchanges);
  } catch (error) {
    console.error('Erro ao carregar exchanges:', error);
    showNotification('Erro ao carregar exchanges. API offline?', 'error');
    
    // Mostra erro na UI
    const availableContainer = document.getElementById('available-exchanges-list');
    if (availableContainer) {
      availableContainer.innerHTML = '<p class="text-red-400 text-center py-8">❌ Erro ao conectar com a API</p>';
    }
    
    const linkedContainer = document.getElementById('linked-exchanges-list');
    if (linkedContainer) {
      linkedContainer.innerHTML = '<p class="text-red-400 text-center py-8">❌ Erro ao conectar com a API</p>';
    }
  }
}

function populateExchangeSelect(exchanges) {
  const select = document.getElementById('exchange-select');
  if (!select) return;
  
  select.innerHTML = '<option value="">Selecione uma exchange...</option>' +
    exchanges.map(ex => `
      <option value="${ex._id}">${ex.nome} (${ex.ccxt_id})</option>
    `).join('');
}

function renderAvailableExchanges(exchanges) {
  const container = document.getElementById('available-exchanges-list');
  
  if (!exchanges || exchanges.length === 0) {
    container.innerHTML = '<p class="text-dark-400 text-center py-8">Nenhuma exchange disponível</p>';
    return;
  }
  
  container.innerHTML = exchanges.map(ex => {
    const iconPath = getExchangeIcon(ex.ccxt_id || ex.nome);
    return `
      <div class="p-4 bg-dark-700/50 rounded-lg hover:bg-dark-700 transition-all">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 rounded-lg overflow-hidden bg-white p-2 flex items-center justify-center flex-shrink-0 border border-dark-600">
              <img src="${iconPath}" alt="${ex.nome}" class="w-full h-full object-contain" 
                   onerror="this.onerror=null; this.parentElement.innerHTML='<span class=\'text-xl\'>🔗</span>';">
            </div>
            <div>
              <h3 class="font-semibold text-dark-100">${ex.nome}</h3>
              <p class="text-sm text-dark-400">${ex.ccxt_id}</p>
            </div>
          </div>
        </div>
        ${ex.description ? `<p class="text-xs text-dark-500 mt-2">${ex.description}</p>` : ''}
      </div>
    `;
  }).join('');
}

function renderLinkedExchanges(exchanges) {
  const container = document.getElementById('linked-exchanges-list');
  
  if (!exchanges || exchanges.length === 0) {
    container.innerHTML = '<p class="text-dark-400 text-center py-8">Nenhuma exchange vinculada ainda</p>';
    return;
  }
  
  container.innerHTML = exchanges.map(ex => {
    const iconPath = getExchangeIcon(ex.ccxt_id || ex.exchange_name);
    return `
      <div class="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg hover:bg-dark-700 transition-all">
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 rounded-lg overflow-hidden bg-white p-2 flex items-center justify-center flex-shrink-0 border border-dark-600">
            <img src="${iconPath}" alt="${ex.exchange_name}" class="w-full h-full object-contain" 
                 onerror="this.onerror=null; this.parentElement.innerHTML='<span class=\'text-xl\'>🔗</span>';">
          </div>
          <div>
            <h3 class="font-semibold text-dark-100">${ex.exchange_name}</h3>
            <p class="text-sm text-dark-400">${ex.ccxt_id}</p>
            <p class="text-xs text-dark-500 mt-1">Vinculada: ${formatDate(ex.linked_at)}</p>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <span class="badge ${ex.is_active ? 'badge-success' : 'badge-error'}">
            ${ex.is_active ? 'Ativa' : 'Inativa'}
          </span>
          <button class="btn-secondary text-sm unlink-btn" data-exchange-id="${ex.exchange_id}" data-exchange-name="${ex.exchange_name}">
            ❌ Desconectar
          </button>
        </div>
      </div>
    `;
  }).join('');
  
  // Adiciona event listeners aos botões de desvincular
  document.querySelectorAll('.unlink-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const exchangeId = this.getAttribute('data-exchange-id');
      const exchangeName = this.getAttribute('data-exchange-name');
      unlinkExchange(exchangeId, exchangeName);
    });
  });
}

// ==================== BALANCES ====================

async function loadBalancesData(forceRefresh = false) {
  try {
    // Removido parâmetro 'brl' que causa erro 500 na API
    const balances = await api.getBalances(forceRefresh);
    appState.balances = balances;
    renderBalances(balances);
  } catch (error) {
    console.error('Erro ao carregar saldos:', error);
    showNotification('Erro ao carregar saldos. API offline?', 'error');
    
    // Mostra erro na UI
    const container = document.getElementById('balances-exchanges-container');
    if (container) {
      container.innerHTML = `
        <div class="card border-red-500/50">
          <div class="text-center py-8">
            <p class="text-red-400 text-xl mb-2">❌ Erro ao conectar com a API</p>
            <p class="text-dark-400">Verifique se a API está rodando em http://localhost:5000</p>
          </div>
        </div>
      `;
    }
  }
}

function renderBalances(balances) {
  // Calcula estatísticas
  const totalUSD = balances.summary?.total_usd || 0;
  const totalBRL = totalUSD * 5.07;
  
  let totalTokens = 0;
  let tokensWithValue = 0;
  
  balances.exchanges?.forEach(ex => {
    const tokens = Object.entries(ex.tokens || {});
    totalTokens += tokens.length;
    tokensWithValue += tokens.filter(([_, t]) => t.value_usd > 0).length;
  });
  
  // Atualiza summary cards
  document.getElementById('balances-total').textContent = formatCurrency(totalUSD);
  document.getElementById('balances-total-tokens').textContent = totalTokens;
  document.getElementById('balances-tokens-with-value').textContent = `${tokensWithValue} com valor`;
  document.getElementById('balances-timestamp').textContent = formatDateTime(balances.timestamp);
  document.getElementById('balances-cache-status').textContent = 
    balances.meta?.from_cache ? '📦 Do cache' : '🔄 Atualizado agora';
  
  // Renderiza exchanges
  const container = document.getElementById('balances-exchanges-container');
  
  if (!balances.exchanges || balances.exchanges.length === 0) {
    container.innerHTML = '<p class="text-dark-400 text-center py-8">Nenhuma exchange com saldo</p>';
    return;
  }
  
  // Ordena exchanges por total_usd (maior primeiro)
  const sortedExchanges = [...balances.exchanges].sort((a, b) => 
    (b.total_usd || 0) - (a.total_usd || 0)
  );
  
  container.innerHTML = sortedExchanges.map(ex => renderExchangeBalance(ex)).join('');
  
  // Adiciona event listeners para cliques nos tokens
  attachTokenClickListeners();
}

// Função para adicionar event listeners nas linhas de tokens
function attachTokenClickListeners() {
  const tokenRows = document.querySelectorAll('.token-row');
  tokenRows.forEach(row => {
    row.addEventListener('click', (e) => {
      const tokenData = JSON.parse(row.getAttribute('data-token'));
      const exchangeId = row.getAttribute('data-exchange-id');
      const exchangeName = row.getAttribute('data-exchange-name');
      const symbol = row.getAttribute('data-symbol');
      
      console.log('🔍 Token clicado:', symbol, 'Exchange:', exchangeName);
      showTokenModal(symbol, tokenData, exchangeId, exchangeName);
    });
  });
}

function renderExchangeBalance(exchange) {
  const tokens = Object.entries(exchange.tokens || {});
  const hasTokens = tokens.length > 0;
  
  // Separa tokens com e sem valor
  const tokensWithValue = tokens.filter(([_, t]) => t.value_usd > 0);
  const tokensWithoutValue = tokens.filter(([_, t]) => t.value_usd === 0);
  
  // Ordena tokens por valor (maior primeiro)
  const sortedTokensWithValue = tokensWithValue.sort((a, b) => b[1].value_usd - a[1].value_usd);
  
  // Se configurado para ocultar saldos zero, usa apenas tokensWithValue
  const hideZero = appState.hideZeroBalances || false;
  const displayTokens = hideZero ? sortedTokensWithValue : [...sortedTokensWithValue, ...tokensWithoutValue];
  
  return `
    <div class="card ${exchange.success ? '' : 'border-red-500/50'}">
      <!-- Exchange Header -->
      <div class="flex items-center justify-between mb-4 pb-4 border-b border-dark-700">
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 ${exchange.success ? 'bg-primary-600' : 'bg-red-600'} rounded-full flex items-center justify-center text-2xl">
            ${exchange.success ? '🏢' : '⚠️'}
          </div>
          <div>
            <h3 class="text-xl font-bold text-dark-100">${exchange.name}</h3>
            <p class="text-xs text-dark-400">${tokens.length} tokens • ${tokensWithValue.length} com valor</p>
          </div>
        </div>
        <div class="text-right">
          <p class="text-3xl font-bold ${exchange.total_usd > 0 ? 'text-green-400' : 'text-dark-400'}">
            ${formatCurrency(exchange.total_usd || 0)}
          </p>
          ${!exchange.success ? `<p class="text-xs text-red-400 mt-1">⚠️ ${exchange.error}</p>` : ''}
        </div>
      </div>
      
      ${hasTokens && displayTokens.length > 0 ? `
        <!-- Tokens Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="text-left text-xs text-dark-400 border-b border-dark-700">
                <th class="pb-2 pr-4">Token</th>
                <th class="pb-2 pr-4 text-right">Quantidade</th>
                <th class="pb-2 pr-4 text-right">Preço USD</th>
                <th class="pb-2 text-right">Valor USD</th>
              </tr>
            </thead>
            <tbody class="text-sm">
              ${displayTokens.map(([symbol, token]) => {
                const isMainToken = token.value_usd > 10; // Destaque para tokens > $10
                const hasValue = token.value_usd > 0;
                const tokenDataJson = JSON.stringify({
                  symbol,
                  amount: token.amount,
                  price_usd: token.price_usd,
                  value_usd: token.value_usd,
                  ticker: token.ticker || null
                });
                return `
                  <tr class="border-b border-dark-700/50 hover:bg-primary-900/20 transition-colors cursor-pointer token-row"
                      data-token='${tokenDataJson.replace(/'/g, "&apos;")}'
                      data-exchange-id="${exchange.exchange_id}"
                      data-exchange-name="${exchange.name}"
                      data-symbol="${symbol}">
                    <td class="py-3 pr-4">
                      <div class="flex items-center gap-2">
                        ${isMainToken ? '<span class="text-yellow-400">⭐</span>' : ''}
                        <span class="font-semibold ${hasValue ? 'text-dark-100' : 'text-dark-400'}">${symbol}</span>
                      </div>
                    </td>
                    <td class="py-3 pr-4 text-right text-dark-300">
                      ${formatNumber(token.amount)}
                    </td>
                    <td class="py-3 pr-4 text-right ${token.price_usd > 0 ? 'text-dark-300' : 'text-dark-500'}">
                      ${token.price_usd > 0 ? formatTokenPrice(token.price_usd) : '-'}
                    </td>
                    <td class="py-3 text-right font-semibold ${hasValue ? 'text-green-400' : 'text-dark-500'}">
                      ${hasValue ? formatCurrency(token.value_usd) : (appState.showBRL ? 'R$ 0,00' : '$0.00')}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
        ${hideZero && tokensWithoutValue.length > 0 ? `
          <div class="mt-3 pt-3 border-t border-dark-700">
            <p class="text-xs text-dark-400 text-center">
              ${tokensWithoutValue.length} tokens sem valor ocultos 
              <button onclick="toggleZeroBalances()" class="text-primary-400 hover:underline ml-1">
                Mostrar
              </button>
            </p>
          </div>
        ` : ''}
      ` : '<p class="text-dark-400 text-center py-4">Nenhum token com saldo</p>'}
    </div>
  `;
}

// ==================== HISTORY ====================

// Estado do gráfico
const chartState = {
  showGrid: true,
  showPoints: true,
  showArea: true
};

async function loadHistoryData(period = '7d') {
  console.log('🔍 loadHistoryData chamado com period:', period);
  try {
    appState.selectedPeriod = period;
    console.log('📡 Chamando API getPortfolioEvolution...');
    const response = await api.getPortfolioEvolution(period);
    console.log('✅ Dados recebidos da API:', response);
    
    const evolution = response.evolution || {};
    
    // A API retorna arrays separados: timestamps, values_usd, values_brl
    // Precisamos transformar em array de objetos
    const timestamps = evolution.timestamps || [];
    const values_usd = evolution.values_usd || [];
    const values_brl = evolution.values_brl || [];
    
    const data_points = timestamps.map((timestamp, index) => ({
      timestamp: timestamp,
      total_usd: values_usd[index] || 0,
      total_brl: values_brl[index] || 0
    }));
    
    const summary = evolution.summary || {};
    
    console.log('📊 Data points processados:', data_points.length, 'pontos');
    console.log('📈 Summary:', summary);
    
    // Salva no appState para re-renderização
    appState.historyData = {
      data_points,
      summary
    };
    
    renderHistoryEvolution({ data_points, summary });
    
    // Aguarda um momento para o DOM ser completamente renderizado
    setTimeout(() => {
      drawHistoryChart(data_points, period);
    }, 500);
  } catch (error) {
    console.error('❌ Erro ao carregar histórico:', error);
    showNotification('Erro ao carregar histórico. API offline?', 'error');
    
    // Mostra erro na UI
    const container = document.getElementById('history-data-points');
    if (container) {
      container.innerHTML = '<p class="text-red-400 text-center py-8">❌ Erro ao conectar com a API</p>';
    }
  }
}

function renderHistoryEvolution(evolution) {
  const summary = evolution.summary || {};
  
  // Atualiza summary cards - converte strings para números
  const startValue = parseFloat(summary.start_value_usd || 0);
  const endValue = parseFloat(summary.end_value_usd || 0);
  const changeValue = parseFloat(summary.change_usd || 0);
  const changePercent = parseFloat(summary.change_percent || 0);
  
  document.getElementById('history-start-value').textContent = 
    formatCurrency(startValue);
  document.getElementById('history-end-value').textContent = 
    formatCurrency(endValue);
  
  const changeColor = changeValue >= 0 ? 'text-green-400' : 'text-red-400';
  
  const changeValueEl = document.getElementById('history-change-value');
  changeValueEl.textContent = (changeValue >= 0 ? '+' : '') + formatCurrency(changeValue);
  changeValueEl.className = `text-2xl font-bold ${changeColor}`;
  
  const changePercentEl = document.getElementById('history-change-percent');
  changePercentEl.textContent = (changePercent >= 0 ? '+' : '') + changePercent.toFixed(2) + '%';
  changePercentEl.className = `text-2xl font-bold ${changeColor}`;
  
  // Renderiza data points
  const container = document.getElementById('history-data-points');
  const dataPoints = evolution.data_points || [];
  
  if (dataPoints.length === 0) {
    container.innerHTML = '<p class="text-dark-400 text-center py-8">Nenhum dado histórico disponível</p>';
    return;
  }
  
  // Determina qual chave usar para o timestamp
  const getTimeValue = (point) => {
    if (point.timestamp) return point.timestamp;
    if (point.date) return point.date;
    if (point.month) return point.month;
    return null;
  };
  
  container.innerHTML = dataPoints.map(point => {
    const timeValue = getTimeValue(point);
    const formattedTime = timeValue ? formatDateTime(timeValue) : 'N/A';
    
    return `
    <div class="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg hover:bg-dark-700 transition-all">
      <p class="text-sm text-dark-300">${formattedTime}</p>
      <div class="text-right">
        <p class="font-semibold text-green-400">${formatCurrency(point.total_usd)}</p>
      </div>
    </div>
  `}).join('');
}

// Função para desenhar o gráfico
// Função para desenhar o gráfico com Chart.js
function drawHistoryChart(dataPoints, period) {
  console.log('🎨 Desenhando gráfico com', dataPoints?.length || 0, 'pontos para período:', period);
  
  const canvas = document.getElementById('history-chart-canvas');
  if (!canvas) {
    console.error('❌ Canvas não encontrado!');
    return;
  }
  
  console.log('📏 Canvas info:', {
    clientWidth: canvas.clientWidth,
    clientHeight: canvas.clientHeight,
    offsetWidth: canvas.offsetWidth,
    offsetHeight: canvas.offsetHeight,
    rect: canvas.getBoundingClientRect(),
    parentRect: canvas.parentElement?.getBoundingClientRect()
  });
  
  // Verifica se Chart.js está disponível
  if (typeof Chart === 'undefined') {
    console.error('❌ Chart.js não está carregado!');
    return;
  }
  
  // Destrói gráfico anterior se existir
  if (appState.historyChart) {
    appState.historyChart.destroy();
  }
  
  if (!dataPoints || dataPoints.length === 0) {
    console.log('⚠️  Sem dados para exibir');
    return;
  }
  
  // Determina qual chave usar para o timestamp baseado no período
  // 1d usa "timestamp", 7d-90d usam "date", 365d usa "month"
  const getTimeValue = (point) => {
    if (point.timestamp) return point.timestamp;
    if (point.date) return point.date;
    if (point.month) return point.month;
    return null;
  };
  
  // Prepara labels baseado no período
  const labels = dataPoints.map(point => {
    const timeValue = getTimeValue(point);
    if (!timeValue) return '';
    
    const date = new Date(timeValue);
    
    // Formato diferente por período
    if (period === '1d') {
      // 24h: mostra hora:minuto
      return date.toLocaleString('pt-BR', { 
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (period === '1y') {
      // 365d: mostra mês/ano
      return date.toLocaleDateString('pt-BR', { 
        month: 'short',
        year: '2-digit'
      });
    } else {
      // 7d, 30d, 90d: mostra dia/mês
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit'
      });
    }
  });
  
  const isBRL = appState.showBRL;
  const multiplier = isBRL ? 5.07 : 1;
  const symbol = isBRL ? 'R$' : '$';
  const values = dataPoints.map(point => {
    if (isBRL) {
      const brlValue = Number(point.total_brl ?? (point.total_usd || 0) * multiplier);
      return Number.isNaN(brlValue) ? 0 : brlValue;
    }
    const usdValue = Number(point.total_usd || 0);
    return Number.isNaN(usdValue) ? 0 : usdValue;
  });
  
  // Calcula variação para determinar a cor (verde = positivo, vermelho = negativo)
  const firstValue = values[0] || 0;
  const lastValue = values[values.length - 1] || 0;
  const isPositive = lastValue >= firstValue;
  
  // Cores dinâmicas baseadas na performance
  const lineColor = isPositive ? '#10B981' : '#EF4444'; // verde ou vermelho
  const gradientColorStart = isPositive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)';
  const gradientColorEnd = isPositive ? 'rgba(16, 185, 129, 0.0)' : 'rgba(239, 68, 68, 0.0)';
  
  // Cria gradiente para o preenchimento
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, gradientColorStart);
  gradient.addColorStop(1, gradientColorEnd);
  
  // Cria o gráfico
  appState.historyChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: isBRL ? '💰 Portfolio (BRL)' : '💵 Portfolio (USD)',
        data: values,
        borderColor: lineColor,
        backgroundColor: chartState.showArea ? gradient : 'transparent',
        borderWidth: 3,
        fill: chartState.showArea,
        tension: 0.4,
        pointRadius: chartState.showPoints ? 4 : 0,
        pointBackgroundColor: lineColor,
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: lineColor,
        pointHoverBorderColor: '#FFFFFF',
        pointHoverBorderWidth: 3,
        segment: {
          borderColor: ctx => {
            // Cor dinâmica por segmento baseado na direção
            const prev = ctx.p0.parsed.y;
            const curr = ctx.p1.parsed.y;
            return curr >= prev ? '#10B981' : '#EF4444';
          }
        }
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 750,
        easing: 'easeInOutQuart'
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'start',
          labels: {
            color: '#E5E7EB',
            font: {
              size: 14,
              weight: '600',
              family: "'Inter', 'Segoe UI', sans-serif"
            },
            padding: 15,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          titleColor: '#F9FAFB',
          bodyColor: '#E5E7EB',
          borderColor: lineColor,
          borderWidth: 2,
          padding: 16,
          displayColors: true,
          boxPadding: 6,
          usePointStyle: true,
          titleFont: {
            size: 13,
            weight: '600',
            family: "'Inter', 'Segoe UI', sans-serif"
          },
          bodyFont: {
            size: 14,
            weight: '700',
            family: "'Inter', 'Segoe UI', sans-serif"
          },
          callbacks: {
            title: function(context) {
              return context[0].label;
            },
            label: function(context) {
              const value = context.parsed.y;
              return `${symbol} ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            },
            afterLabel: function(context) {
              // Mostra a variação em relação ao ponto anterior
              const currentIndex = context.dataIndex;
              if (currentIndex > 0) {
                const currentValue = context.parsed.y;
                const previousValue = context.dataset.data[currentIndex - 1];
                const change = currentValue - previousValue;
                const changePercent = ((change / previousValue) * 100).toFixed(2);
                const changeSymbol = change >= 0 ? '▲' : '▼';
                const changeColor = change >= 0 ? '🟢' : '🔴';
                return `${changeColor} ${changeSymbol} ${changePercent}%`;
              }
              return '';
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: chartState.showGrid,
            color: 'rgba(75, 85, 99, 0.3)',
            drawBorder: false,
            lineWidth: 1
          },
          border: {
            display: false
          },
          ticks: {
            color: '#9CA3AF',
            font: {
              size: 11,
              weight: '500',
              family: "'Inter', 'Segoe UI', sans-serif"
            },
            maxRotation: 45,
            minRotation: 45,
            padding: 8,
            autoSkip: true,
            maxTicksLimit: period === '1d' ? 12 : period === '7d' ? 7 : 10
          }
        },
        y: {
          grid: {
            display: chartState.showGrid,
            color: 'rgba(75, 85, 99, 0.3)',
            drawBorder: false,
            lineWidth: 1
          },
          border: {
            display: false
          },
          ticks: {
            color: '#9CA3AF',
            font: {
              size: 12,
              weight: '600',
              family: "'Inter', 'Segoe UI', sans-serif"
            },
            padding: 12,
            callback: function(value) {
              return `${symbol} ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
            }
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  });
  
  console.log('✅ Gráfico criado com sucesso');
  console.log('📊 Dimensões após criação:', {
    canvas: canvas.getBoundingClientRect(),
    parent: canvas.parentElement?.getBoundingClientRect()
  });
}

function refreshDashboardValuesFromCache() {
  if (!appState.linkedExchanges || !appState.balances) {
    console.log('⚠️ Nenhum dado de dashboard disponível para refresh');
    return;
  }

  updateDashboardBalances(appState.balances);
  renderDashboardExchangesWithBalances(appState.linkedExchanges, appState.balances, {
    skipTickerRefresh: true,
    autoExpand: false
  });
}

function refreshBalancesValuesFromCache() {
  if (!appState.balances) {
    console.log('⚠️ Nenhum dado de balances disponíveis para refresh');
    return;
  }

  renderBalances(appState.balances);
}

function refreshHistoryValuesFromCache() {
  if (!appState.historyData) {
    console.log('⚠️ Nenhum histórico carregado para refresh');
    return;
  }

  renderHistoryEvolution(appState.historyData);
  if (Array.isArray(appState.historyData.data_points)) {
    drawHistoryChart(appState.historyData.data_points);
  }
}

function refreshTokenModalFromState() {
  if (!appState.activeTokenModal) {
    return;
  }

  const { symbol, exchangeId, exchangeName } = appState.activeTokenModal;
  const exchange = appState.balances?.exchanges?.find(ex => ex.exchange_id === exchangeId);
  const tokenData = exchange?.tokens?.[symbol];

  if (!tokenData) {
    console.log('⚠️ Token não encontrado para reabrir modal:', symbol, exchangeId);
    return;
  }

  const existingModal = document.getElementById('token-modal');
  if (existingModal) {
    existingModal.remove();
  }

  showTokenModal(symbol, tokenData, exchangeId, exchangeName);
}

function refreshCurrencySensitiveViews() {
  refreshDashboardValuesFromCache();
  refreshBalancesValuesFromCache();
  refreshHistoryValuesFromCache();
  refreshTokenModalFromState();
}

// ==================== SETTINGS ====================

function loadSettingsData() {
  console.log('⚙️ Carregando dados de configurações...');
  
  // Carrega configurações salvas do localStorage
  const settings = {
    darkMode: localStorage.getItem('darkMode') !== 'false', // default true
    showBRL: localStorage.getItem('showBRL') === 'true', // default false
    language: localStorage.getItem('language') || 'pt' // default pt
  };
  
  console.log('📋 Configurações carregadas:', settings);
  
  // Atualiza appState
  appState.showBRL = settings.showBRL;
  appState.language = settings.language;
  appState.darkMode = settings.darkMode;
  
  // Aplica configurações aos toggles
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const showBRLToggle = document.getElementById('show-brl-toggle');
  const languageToggle = document.getElementById('language-toggle');
  
  if (darkModeToggle) darkModeToggle.checked = settings.darkMode;
  if (showBRLToggle) showBRLToggle.checked = settings.showBRL;
  if (languageToggle) languageToggle.checked = settings.language === 'en';
  
  console.log('🔧 Toggles configurados:', {
    darkMode: darkModeToggle?.checked,
    showBRL: showBRLToggle?.checked,
    language: languageToggle?.checked ? 'en' : 'pt'
  });
  
  // Atualiza label do idioma
  updateLanguageLabel(settings.language);
  
  // Aplica dark mode
  applyDarkMode(settings.darkMode);
  
  // Carrega User ID
  const userId = api.getUserId();
  const userIdInput = document.getElementById('settings-user-id');
  const appUserIdSpan = document.getElementById('app-user-id');
  
  if (userIdInput) userIdInput.value = userId;
  if (appUserIdSpan) appUserIdSpan.textContent = userId;
  
  // Carrega informações da plataforma
  const platformSpan = document.getElementById('app-platform');
  if (platformSpan) platformSpan.textContent = navigator.platform;
  
  // Remove event listeners antigos antes de adicionar novos
  const saveBtn = document.getElementById('save-settings-btn');
  if (saveBtn) {
    const newSaveBtn = saveBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
    newSaveBtn.addEventListener('click', saveSettings);
  }
  
  // Adiciona event listeners aos toggles (apenas se não existirem)
  if (darkModeToggle && !darkModeToggle.dataset.listenerAdded) {
    darkModeToggle.addEventListener('change', (e) => {
      console.log('🌙 Dark mode alterado:', e.target.checked);
      applyDarkMode(e.target.checked);
    });
    darkModeToggle.dataset.listenerAdded = 'true';
  }
  
  if (languageToggle && !languageToggle.dataset.listenerAdded) {
    languageToggle.addEventListener('change', (e) => {
      const lang = e.target.checked ? 'en' : 'pt';
      console.log('🌐 Toggle idioma alterado:', { checked: e.target.checked, lang });
      
      // Salva no localStorage
      localStorage.setItem('language', lang);
      console.log('💾 Idioma salvo no localStorage:', lang);
      
      // Atualiza interface
      updateLanguageLabel(lang);
    });
    languageToggle.dataset.listenerAdded = 'true';
  }
  
  console.log('✅ Configurações carregadas com sucesso');
}

// Aplica o dark mode
function applyDarkMode(isDark) {
  const html = document.documentElement;
  
  // Remove todas as classes de tema primeiro
  html.classList.remove('dark-mode', 'light-mode');
  
  // Adiciona a classe correta
  if (isDark) {
    html.classList.add('dark-mode');
  } else {
    html.classList.add('light-mode');
  }
  
  // Atualiza o estado global
  appState.darkMode = isDark;
  
  // Salva no localStorage
  localStorage.setItem('darkMode', isDark);
  
  // Atualiza o ícone se estiver na página de settings
  const icon = document.querySelector('#dark-mode-toggle')?.closest('.card')?.querySelector('.text-2xl');
  if (icon) {
    icon.textContent = isDark ? '🌙' : '☀️';
  }
  
  console.log('🎨 Tema aplicado:', isDark ? '🌙 DARK MODE' : '☀️ LIGHT MODE');
}

// Atualiza o label do idioma e toda a interface
function updateLanguageLabel(lang) {
  appState.language = lang;
  
  const label = document.querySelector('.language-label');
  if (label) {
    label.textContent = lang === 'pt' ? 'PT' : 'EN';
  }
  
  console.log(`🌐 Idioma alterado para: ${lang === 'pt' ? 'Português' : 'English'}`);
  
  // Atualiza todos os textos da interface
  updateInterfaceLanguage();
}

// Função para atualizar todos os textos da interface
function updateInterfaceLanguage() {
  console.log('🔄 Atualizando interface para idioma:', appState.language);
  
  // 1. Atualiza tooltips da navegação
  const navButtons = [
    { selector: 'button[data-view="dashboard"]', key: 'home' },
    { selector: 'button[data-view="exchanges"]', key: 'exchanges' },
    { selector: 'button[data-view="history"]', key: 'history' },
    { selector: 'button[data-view="settings"]', key: 'settings' }
  ];
  
  navButtons.forEach(item => {
    const el = document.querySelector(item.selector);
    if (el) el.title = t(item.key);
  });
  
  // 2. Atualiza mensagem de loading
  const loadingMsg = document.getElementById('loading-message');
  if (loadingMsg) loadingMsg.textContent = t('loading');
  
  // 3. Atualiza todos os elementos com data-i18n
  const i18nElements = document.querySelectorAll('[data-i18n]');
  i18nElements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key && translations[appState.language][key]) {
      el.textContent = t(key);
    }
  });
  
  // 4. Atualiza textos específicos do Settings
  updateSettingsLanguage();
  
  // 5. Atualiza a view atual para refletir as mudanças
  if (appState.currentView === 'tokens' && appState.balances) {
    renderTokensList(appState.balances);
  }
  
  if (appState.currentView === 'dashboard' && appState.balances) {
    // Recarrega os badges de moedas se necessário
    const badges = document.querySelectorAll('.currency-type-badge');
    badges.forEach(badge => {
      const symbol = badge.getAttribute('data-symbol');
      if (symbol) {
        const currencyType = getCurrencyType(symbol);
        if (currencyType) {
          badge.textContent = currencyType.label;
          badge.title = currencyType.description;
        }
      }
    });
  }
  
  console.log('✅ Interface atualizada para:', appState.language);
}

// Atualiza textos da página de configurações
function updateSettingsLanguage() {
  // Atualiza todos os elementos com data-i18n
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key && translations[appState.language][key]) {
      el.textContent = t(key);
    }
  });
}

// Salva as configurações
function saveSettings() {
  const darkMode = document.getElementById('dark-mode-toggle').checked;
  const showBRL = document.getElementById('show-brl-toggle').checked;
  const language = document.getElementById('language-toggle').checked ? 'en' : 'pt';
  const userId = document.getElementById('settings-user-id').value;
  
  // Salva no localStorage
  localStorage.setItem('darkMode', darkMode);
  localStorage.setItem('showBRL', showBRL);
  localStorage.setItem('language', language);
  
  // Atualiza o User ID na API
  if (userId && userId !== api.getUserId()) {
    api.userId = userId;
    localStorage.setItem('userId', userId);
  }
  
  // Atualiza o appState
  appState.showBRL = showBRL;
  appState.language = language;
  
  // Aplica as mudanças
  applyDarkMode(darkMode);
  updateLanguageLabel(language);
  
  // Recarrega o dashboard se necessário (para atualizar valores BRL)
  if (appState.currentView === 'dashboard') {
    loadDashboardData();
  }
  
  showNotification('⚙️ Configurações salvas com sucesso!', 'success');
}

// ==================== ROBOT (AUTOMAÇÕES) ====================

function loadRobotData() {
  console.log('🤖 Carregando dados de automações...');
  
  // Carrega estratégias salvas do localStorage
  const strategies = JSON.parse(localStorage.getItem('robotStrategies') || '[]');
  appState.robotStrategies = strategies;
  
  // Carrega exchanges vinculadas para popular o select
  loadRobotExchanges();
  
  // Renderiza as estratégias
  renderRobotStrategies(strategies);
  
  // Atualiza contador
  updateRobotActiveCount(strategies);
  
  // Adiciona event listeners
  setupRobotEventListeners();
  
  console.log('✅ Robot carregado com sucesso');
}

async function loadRobotExchanges() {
  try {
    const linkedData = await api.getLinkedExchanges();
    const exchanges = linkedData.linked_exchanges || [];
    
    const select = document.getElementById('robot-exchange-select');
    if (select) {
      select.innerHTML = '<option value="">Selecione uma exchange</option>';
      exchanges.forEach(exchange => {
        const option = document.createElement('option');
        option.value = exchange.exchange_id;
        option.textContent = exchange.name;
        select.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Erro ao carregar exchanges para robot:', error);
  }
}

function renderRobotStrategies(strategies) {
  const listContainer = document.getElementById('robot-strategies-list');
  if (!listContainer) return;
  
  if (strategies.length === 0) {
    listContainer.innerHTML = `
      <div class="text-center py-12 text-dark-400">
        <div class="text-6xl mb-4 opacity-50">🤖</div>
        <p class="text-sm">Nenhuma estratégia criada ainda</p>
        <p class="text-xs mt-2 opacity-70">Crie sua primeira automação ao lado</p>
      </div>
    `;
    return;
  }
  
  listContainer.innerHTML = strategies.map((strategy, index) => `
    <div class="p-4 bg-gradient-to-br from-dark-700/50 to-dark-800/50 rounded-xl border ${strategy.active ? 'border-green-500/30' : 'border-dark-600/50'} hover:border-primary-500/50 transition-all">
      <div class="flex items-start justify-between mb-3">
        <div class="flex-1">
          <div class="flex items-center space-x-2 mb-1">
            <h4 class="font-semibold text-dark-100">${strategy.name}</h4>
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${strategy.active ? 'bg-green-500/20 text-green-400' : 'bg-dark-600 text-dark-400'}">
              ${strategy.active ? '● Ativa' : '○ Pausada'}
            </span>
          </div>
          <p class="text-xs text-dark-400">${strategy.exchange} • ${strategy.pair}</p>
        </div>
        <div class="flex items-center space-x-2">
          <button class="text-sm px-2 py-1 rounded hover:bg-dark-600 transition-all ${strategy.active ? 'text-yellow-400' : 'text-green-400'}" 
                  onclick="toggleRobotStrategy(${index})" 
                  title="${strategy.active ? 'Pausar' : 'Ativar'}">
            ${strategy.active ? '⏸' : '▶'}
          </button>
          <button class="text-sm px-2 py-1 rounded hover:bg-dark-600 transition-all text-red-400" 
                  onclick="deleteRobotStrategy(${index})" 
                  title="Excluir">
            🗑️
          </button>
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-3 text-xs">
        <div class="p-2 bg-dark-800/50 rounded-lg">
          <p class="text-dark-500 mb-1">Tipo</p>
          <p class="text-dark-200 font-semibold">
            ${strategy.type === 'buy' ? '🟢 Compra' : strategy.type === 'sell' ? '🔴 Venda' : '🔄 Ambos'}
          </p>
        </div>
        <div class="p-2 bg-dark-800/50 rounded-lg">
          <p class="text-dark-500 mb-1">Preço Alvo</p>
          <p class="text-dark-200 font-semibold">${formatCurrency(strategy.targetPrice)}</p>
        </div>
        <div class="p-2 bg-dark-800/50 rounded-lg">
          <p class="text-dark-500 mb-1">Quantidade</p>
          <p class="text-dark-200 font-semibold">${strategy.amount}</p>
        </div>
        <div class="p-2 bg-dark-800/50 rounded-lg">
          <p class="text-dark-500 mb-1">Status</p>
          <p class="text-dark-200 font-semibold">
            ${strategy.executions || 0} execuções
          </p>
        </div>
      </div>
      
      ${strategy.stopLoss || strategy.takeProfit ? `
        <div class="mt-3 pt-3 border-t border-dark-700/50 flex items-center space-x-4 text-xs">
          ${strategy.stopLoss ? `
            <div class="flex items-center space-x-1">
              <span class="text-red-400">🛑</span>
              <span class="text-dark-400">Stop:</span>
              <span class="text-red-400 font-semibold">${formatCurrency(strategy.stopLoss)}</span>
            </div>
          ` : ''}
          ${strategy.takeProfit ? `
            <div class="flex items-center space-x-1">
              <span class="text-green-400">🎯</span>
              <span class="text-dark-400">Target:</span>
              <span class="text-green-400 font-semibold">${formatCurrency(strategy.takeProfit)}</span>
            </div>
          ` : ''}
        </div>
      ` : ''}
    </div>
  `).join('');
}

function updateRobotActiveCount(strategies) {
  const activeCount = strategies.filter(s => s.active).length;
  const countElement = document.getElementById('robot-active-count');
  if (countElement) {
    countElement.textContent = `${activeCount} ${activeCount === 1 ? 'ativa' : 'ativas'}`;
    countElement.className = `px-3 py-1 rounded-full text-xs font-semibold ${
      activeCount > 0 ? 'bg-green-500/20 text-green-400' : 'bg-dark-600 text-dark-400'
    }`;
  }
}

function setupRobotEventListeners() {
  // Form de criação de estratégia
  const form = document.getElementById('robot-strategy-form');
  if (form && !form.dataset.listenerAdded) {
    form.addEventListener('submit', handleRobotStrategySubmit);
    form.dataset.listenerAdded = 'true';
  }
  
  // Toggles de Stop Loss e Take Profit
  const stopLossToggle = document.getElementById('robot-stop-loss-toggle');
  const takeProfitToggle = document.getElementById('robot-take-profit-toggle');
  const stopLossInput = document.getElementById('robot-stop-loss');
  const takeProfitInput = document.getElementById('robot-take-profit');
  
  if (stopLossToggle && !stopLossToggle.dataset.listenerAdded) {
    stopLossToggle.addEventListener('change', (e) => {
      stopLossInput.disabled = !e.target.checked;
      if (!e.target.checked) stopLossInput.value = '';
    });
    stopLossToggle.dataset.listenerAdded = 'true';
  }
  
  if (takeProfitToggle && !takeProfitToggle.dataset.listenerAdded) {
    takeProfitToggle.addEventListener('change', (e) => {
      takeProfitInput.disabled = !e.target.checked;
      if (!e.target.checked) takeProfitInput.value = '';
    });
    takeProfitToggle.dataset.listenerAdded = 'true';
  }
}

function handleRobotStrategySubmit(e) {
  e.preventDefault();
  
  const name = document.getElementById('robot-strategy-name').value;
  const exchange = document.getElementById('robot-exchange-select').value;
  const exchangeName = document.getElementById('robot-exchange-select').selectedOptions[0].text;
  const pair = document.getElementById('robot-pair').value.toUpperCase();
  const type = document.getElementById('robot-type').value;
  const targetPrice = parseFloat(document.getElementById('robot-target-price').value);
  const amount = parseFloat(document.getElementById('robot-amount').value);
  const stopLoss = document.getElementById('robot-stop-loss-toggle').checked 
    ? parseFloat(document.getElementById('robot-stop-loss').value) 
    : null;
  const takeProfit = document.getElementById('robot-take-profit-toggle').checked 
    ? parseFloat(document.getElementById('robot-take-profit').value) 
    : null;
  
  const strategy = {
    id: Date.now(),
    name,
    exchange,
    exchangeName,
    pair,
    type,
    targetPrice,
    amount,
    stopLoss,
    takeProfit,
    active: true,
    executions: 0,
    createdAt: new Date().toISOString()
  };
  
  // Adiciona ao localStorage
  const strategies = JSON.parse(localStorage.getItem('robotStrategies') || '[]');
  strategies.push(strategy);
  localStorage.setItem('robotStrategies', JSON.stringify(strategies));
  
  // Atualiza o appState
  appState.robotStrategies = strategies;
  
  // Renderiza novamente
  renderRobotStrategies(strategies);
  updateRobotActiveCount(strategies);
  
  // Limpa o formulário
  e.target.reset();
  document.getElementById('robot-stop-loss').disabled = true;
  document.getElementById('robot-take-profit').disabled = true;
  
  showNotification('🤖 Estratégia criada com sucesso!', 'success');
}

window.toggleRobotStrategy = function(index) {
  const strategies = JSON.parse(localStorage.getItem('robotStrategies') || '[]');
  if (strategies[index]) {
    strategies[index].active = !strategies[index].active;
    localStorage.setItem('robotStrategies', JSON.stringify(strategies));
    appState.robotStrategies = strategies;
    renderRobotStrategies(strategies);
    updateRobotActiveCount(strategies);
    
    const status = strategies[index].active ? 'ativada' : 'pausada';
    showNotification(`🤖 Estratégia ${status}!`, 'success');
  }
};

window.deleteRobotStrategy = function(index) {
  if (confirm('Tem certeza que deseja excluir esta estratégia?')) {
    const strategies = JSON.parse(localStorage.getItem('robotStrategies') || '[]');
    strategies.splice(index, 1);
    localStorage.setItem('robotStrategies', JSON.stringify(strategies));
    appState.robotStrategies = strategies;
    renderRobotStrategies(strategies);
    updateRobotActiveCount(strategies);
    showNotification('🗑️ Estratégia excluída!', 'success');
  }
};

// ==================== MANUAL REFRESH ====================

let isRefreshing = false;

async function handleManualRefresh() {
  if (isRefreshing) return; // Evita múltiplos cliques
  
  isRefreshing = true;
  const refreshIcon = document.getElementById('refresh-icon');
  const refreshStatus = document.getElementById('refresh-status');
  
  // Adiciona animação de rotação
  if (refreshIcon) {
    refreshIcon.style.display = 'inline-block';
    refreshIcon.style.animation = 'spin 1s linear infinite';
  }
  
  if (refreshStatus) {
    refreshStatus.textContent = 'Atualizando...';
  }
  
  try {
    // Recarrega os dados do dashboard
    await loadDashboardData();
    
    showNotification('Dados atualizados com sucesso!', 'success');
    
    if (refreshStatus) {
      refreshStatus.textContent = '5 min';
    }
  } catch (error) {
    console.error('Erro ao atualizar dados:', error);
    showNotification('❌ Erro ao atualizar dados', 'error');
    
    if (refreshStatus) {
      refreshStatus.textContent = 'Erro';
    }
  } finally {
    // Remove animação
    if (refreshIcon) {
      refreshIcon.style.animation = '';
    }
    
    isRefreshing = false;
  }
}

// ==================== NAVEGAÇÃO ====================

async function switchView(viewName) {
  console.log('🔄 Trocando para view:', viewName);
  
  // Atualiza estado
  appState.currentView = viewName;
  
  // Esconde todas as views
  document.querySelectorAll('.view').forEach(view => {
    view.classList.add('hidden');
    view.style.display = 'none'; // Garante que está escondida
  });
  
  // Mostra a view selecionada
  const targetView = document.getElementById(`${viewName}-view`);
  if (targetView) {
    targetView.classList.remove('hidden');
    targetView.style.display = ''; // Remove o display inline para permitir CSS funcionar
  }
  
  // Atualiza botões de navegação
  document.querySelectorAll('[data-view]').forEach(btn => {
    if (btn.getAttribute('data-view') === viewName) {
      btn.classList.remove('btn-secondary');
      btn.classList.add('btn-primary');
    } else {
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-secondary');
    }
  });
  
  // Carrega dados da view
  await loadViewData(viewName);
}

function switchViewOnly(viewName) {
  console.log('🔄 Trocando para view (sem reload):', viewName);
  
  // Atualiza estado
  appState.currentView = viewName;
  
  // Esconde todas as views
  document.querySelectorAll('.view').forEach(view => {
    view.classList.add('hidden');
    view.style.display = 'none'; // Garante que está escondida
  });
  
  // Mostra a view selecionada
  const targetView = document.getElementById(`${viewName}-view`);
  if (targetView) {
    targetView.classList.remove('hidden');
    targetView.style.display = ''; // Remove o display inline para permitir CSS funcionar
  }
  
  // Atualiza botões de navegação
  document.querySelectorAll('[data-view]').forEach(btn => {
    if (btn.getAttribute('data-view') === viewName) {
      btn.classList.remove('btn-secondary');
      btn.classList.add('btn-primary');
    } else {
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-secondary');
    }
  });
}

// ==================== EVENT LISTENERS ====================

function setupEventListeners() {
  // Navegação entre views
  document.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const viewName = btn.getAttribute('data-view');
      await switchView(viewName);
    });
  });
  
  // Form de adicionar exchange
  const addExchangeForm = document.getElementById('add-exchange-form');
  if (addExchangeForm) {
    addExchangeForm.addEventListener('submit', handleAddExchange);
  }
  
  // Logo no header - clique para voltar à dashboard (sem recarregar)
  const logoHeader = document.getElementById('logo-header');
  if (logoHeader) {
    logoHeader.addEventListener('click', () => {
      switchViewOnly('dashboard');
      refreshDashboardValuesFromCache();
    });
  }
  
  // Botão de refresh manual no footer
  const btnManualRefresh = document.getElementById('btn-manual-refresh');
  if (btnManualRefresh) {
    btnManualRefresh.addEventListener('click', handleManualRefresh);
  }
  
  // Botões de refresh
  const refreshBalancesBtn = document.getElementById('refresh-balances-btn');
  if (refreshBalancesBtn) {
    refreshBalancesBtn.addEventListener('click', () => loadBalancesData(true));
  }
  
  const clearCacheBtn = document.getElementById('clear-cache-btn');
  if (clearCacheBtn) {
    clearCacheBtn.addEventListener('click', handleClearCache);
  }
  
  // Botão de toggle zero balances
  const toggleZeroBtn = document.getElementById('toggle-zero-balances-btn');
  if (toggleZeroBtn) {
    toggleZeroBtn.addEventListener('click', () => {
      appState.hideZeroBalances = !appState.hideZeroBalances;
      toggleZeroBtn.textContent = appState.hideZeroBalances ? '👁️ Mostrar $0' : '👁️ Ocultar $0';
      // Re-renderiza os saldos
      if (appState.balances) {
        renderBalances(appState.balances);
      }
    });
  }
  
  // Toggle switch de exchanges zeradas no dashboard
  const toggleZeroDashboardCheckbox = document.getElementById('toggle-zero-dashboard-checkbox');
  if (toggleZeroDashboardCheckbox) {
    toggleZeroDashboardCheckbox.addEventListener('change', () => {
      appState.hideZeroBalances = toggleZeroDashboardCheckbox.checked;
      // Re-renderiza o dashboard
      if (appState.linkedExchanges && appState.balances) {
          renderDashboardExchangesWithBalances(appState.linkedExchanges, appState.balances, {
            skipTickerRefresh: true,
            autoExpand: false
          });
      }
    });
  }
  
  // Botões de período do histórico
  document.querySelectorAll('.period-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const period = e.target.dataset.period;
      
      // Atualiza visual dos botões
      document.querySelectorAll('.period-btn').forEach(b => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-secondary');
      });
      e.target.classList.remove('btn-secondary');
      e.target.classList.add('btn-primary');
      
      // Carrega dados
      loadHistoryData(period);
    });
  });
  
  // Toggles do gráfico
  const toggleGrid = document.getElementById('toggle-grid');
  const togglePoints = document.getElementById('toggle-points');
  const toggleArea = document.getElementById('toggle-area');
  
  if (toggleGrid) {
    toggleGrid.addEventListener('change', () => {
      chartState.showGrid = toggleGrid.checked;
      // Redesenha o gráfico com os dados atuais
      if (appState.currentView === 'history') {
        loadHistoryData(appState.selectedPeriod);
      }
    });
  }
  
  if (togglePoints) {
    togglePoints.addEventListener('change', () => {
      chartState.showPoints = togglePoints.checked;
      if (appState.currentView === 'history') {
        loadHistoryData(appState.selectedPeriod);
      }
    });
  }
  
  if (toggleArea) {
    toggleArea.addEventListener('change', () => {
      chartState.showArea = toggleArea.checked;
      if (appState.currentView === 'history') {
        loadHistoryData(appState.selectedPeriod);
      }
    });
  }
  
  // Botão refresh do histórico
  const refreshHistoryBtn = document.getElementById('refresh-history-btn');
  if (refreshHistoryBtn) {
    refreshHistoryBtn.addEventListener('click', () => {
      loadHistoryData(appState.selectedPeriod);
      showNotification('📊 Histórico atualizado!', 'success');
    });
  }
  
  // Toggle BRL - atualiza imediatamente (apenas converte valores, sem chamar API)
  const showBRLToggle = document.getElementById('show-brl-toggle');
  if (showBRLToggle) {
    showBRLToggle.addEventListener('change', () => {
      const showBRL = showBRLToggle.checked;
      
      console.log('� Toggle BRL alterado:', showBRL ? 'BRL ATIVADO ✅' : 'USD ATIVADO ❌');
      console.log('💱 appState.showBRL antes:', appState.showBRL);
      appState.showBRL = showBRL;
      console.log('💱 appState.showBRL depois:', appState.showBRL);
      localStorage.setItem('showBRL', showBRL);
      console.log('💱 Chamando refreshCurrencySensitiveViews...');
      refreshCurrencySensitiveViews();
      const currencyName = showBRL ? 'BRL (R$)' : 'USD ($)';
      showNotification(`Moeda alterada para ${currencyName}`, 'success');
    });
  }
  
  // Botão salvar configurações
  const saveSettingsBtn = document.getElementById('save-settings-btn');
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', handleSaveSettings);
  }
}

async function handleAddExchange(e) {
  e.preventDefault();
  
  const exchangeId = document.getElementById('exchange-select').value;
  const apiKey = document.getElementById('api-key-input').value;
  const apiSecret = document.getElementById('api-secret-input').value;
  
  if (!exchangeId || !apiKey || !apiSecret) {
    showNotification('Preencha todos os campos', 'error');
    return;
  }
  
  try {
    const result = await api.linkExchange(exchangeId, apiKey, apiSecret);
    showNotification(result.message, 'success');
    
    // Limpa form
    e.target.reset();
    
    // Recarrega dados
    await loadExchangesData();
    await loadDashboardData();
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

async function unlinkExchange(exchangeId, exchangeName) {
  if (!confirm(`Deseja realmente desvincular a exchange ${exchangeName}?`)) {
    return;
  }
  
  try {
    const result = await api.unlinkExchange(exchangeId);
    showNotification(result.message, 'success');
    
    // Recarrega dados
    await loadExchangesData();
    await loadDashboardData();
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

async function handleClearCache() {
  try {
    const result = await api.clearCache();
    showNotification(result.message, 'success');
    await loadBalancesData(true);
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

function handleSaveSettings() {
  const userId = document.getElementById('settings-user-id').value;
  
  if (userId) {
    api.setUserId(userId);
    showNotification('Configurações salvas com sucesso', 'success');
    loadSettingsData();
  }
}

// Função global para toggle (chamada do onclick no HTML)
window.toggleZeroBalances = function() {
  appState.hideZeroBalances = !appState.hideZeroBalances;
  const btn = document.getElementById('toggle-zero-balances-btn');
  if (btn) {
    btn.textContent = appState.hideZeroBalances ? '👁️ Mostrar $0' : '👁️ Ocultar $0';
  }
  if (appState.balances) {
    renderBalances(appState.balances);
  }
};

// Função global para toggle de tokens zerados na exchange (chamada do onclick no HTML)
window.toggleZeroBalancesInExchange = function(exchangeId) {
  appState.hideZeroBalances = !appState.hideZeroBalances;
  
  // Re-renderiza apenas a exchange específica
  const detailsDiv = document.getElementById(`details-${exchangeId}`);
  if (detailsDiv && appState.balances && appState.balances.exchanges) {
    const exchange = appState.balances.exchanges.find(ex => ex.exchange_id === exchangeId);
    if (exchange && exchange.tokens) {
      const exchangeName = exchange.name;
      const tokensListHTML = renderTokensList(exchange.tokens, exchangeId, exchangeName);
      
      // Atualiza o conteúdo
      detailsDiv.querySelector('.p-4').innerHTML = tokensListHTML;
      
      // Re-adiciona event listeners para os tokens
      detailsDiv.querySelectorAll('.token-row').forEach(row => {
        row.addEventListener('click', function() {
          const symbol = this.getAttribute('data-token-symbol');
          const tokenData = JSON.parse(this.getAttribute('data-token-data'));
          showTokenModal(symbol, tokenData, exchangeId, exchangeName);
        });
      });
      
      // Re-adiciona event listener para o botão de toggle
      const toggleBtn = detailsDiv.querySelector('.toggle-zero-btn');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          toggleZeroBalancesInExchange(exchangeId);
        });
      }
    }
  }
};

// Função global para toggle de exchanges zeradas no dashboard (chamada do onclick no HTML)
window.toggleZeroBalancesDashboard = function() {
  appState.hideZeroBalances = !appState.hideZeroBalances;
  const checkbox = document.getElementById('toggle-zero-dashboard-checkbox');
  if (checkbox) {
    checkbox.checked = appState.hideZeroBalances;
  }
  // Re-renderiza o dashboard
  if (appState.linkedExchanges && appState.balances) {
    renderDashboardExchangesWithBalances(appState.linkedExchanges, appState.balances, {
      skipTickerRefresh: true,
      autoExpand: false
    });
  }
};

// ==================== AUTO UPDATE ====================

function startAutoUpdate() {
  // Limpa intervalo anterior se existir
  if (appState.updateInterval) {
    clearInterval(appState.updateInterval);
  }
  
  // Atualiza a cada 2 MINUTOS (120 segundos)
  appState.updateInterval = setInterval(async () => {
    console.log('🔄 Auto-refresh: Atualizando dados...');
    
    // Mostra notificação discreta no canto
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg bg-primary-600 text-white text-sm animate-slide-down';
    notification.innerHTML = '🔄 Atualizando dados...';
    document.body.appendChild(notification);
    
    try {
      if (appState.currentView === 'dashboard') {
        await loadDashboardData();
        console.log('✅ Dashboard atualizado');
      } else if (appState.currentView === 'balances') {
        await loadBalancesData();
        console.log('✅ Balances atualizados');
      }
      
      // Atualiza notificação para sucesso
      notification.innerHTML = '✅ Dados atualizados!';
      notification.className = 'fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg bg-green-600 text-white text-sm animate-slide-down';
      
    } catch (error) {
      console.error('❌ Erro no auto-refresh:', error);
      notification.innerHTML = '⚠️ Erro ao atualizar';
      notification.className = 'fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg bg-red-600 text-white text-sm animate-slide-down';
    }
    
    // Remove notificação após 3 segundos
    setTimeout(() => {
      notification.remove();
    }, 3000);
    
    // Atualiza timestamp
    const now = new Date().toLocaleTimeString('pt-BR');
    console.log(`🕐 Última atualização: ${now}`);
    
  }, 120000); // 120000ms = 2 minutos
  
  console.log('⏰ Auto-refresh configurado para 2 minutos');
}

// ==================== UTILITY FUNCTIONS ====================

function getExchangeIcon(exchangeId) {
  // Mapeia exchange ID/nome para o arquivo de ícone
  const iconMap = {
    'binance': 'binance.png',
    'bybit': 'bybit.png',
    'coinbase': 'coinbase.jpeg',
    'gateio': 'gateio.png',
    'gate.io': 'gateio.png',
    'kraken': 'kraken.png',
    'kucoin': 'kucoin.png',
    'mexc': 'mexc.png',
    'novadax': 'novadax.png',
    'okx': 'okx.png'
  };
  
  const id = exchangeId.toLowerCase();
  const iconFile = iconMap[id] || 'placeholder.png';
  return `./assets/icons/${iconFile}`;
}

function formatCurrency(value, forceUSD = false) {
  // Se forceUSD for true, sempre mostra em USD
  // Caso contrário, respeita a configuração do toggle
  const currency = (forceUSD || !appState.showBRL) ? 'USD' : 'BRL';
  const displayValue = currency === 'BRL' ? value * 5.07 : value;
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency
  }).format(displayValue);
}

function formatTokenPrice(value, forceUSD = false) {
  const currency = (forceUSD || !appState.showBRL) ? 'USD' : 'BRL';
  const multiplier = currency === 'BRL' ? 5.07 : 1;
  
  // Se já vier formatado como string da API (ex: "0.00000030"), usa direto
  if (typeof value === 'string' && value.includes('.')) {
    const numValue = parseFloat(value) * multiplier;
    if (isNaN(numValue) || numValue === 0) {
      return currency === 'USD' ? 'US$ 0,00' : 'R$ 0,00';
    }
    
    // Formata com símbolo de moeda mantendo as casas decimais da string
    const formatted = numValue.toFixed(value.split('.')[1]?.length || 2).replace('.', ',');
    return currency === 'USD' ? `US$ ${formatted}` : `R$ ${formatted}`;
  }
  
  // Converte para número se vier em número ou notação científica
  const numValue = Number(value) * multiplier;
  
  if (!numValue || numValue === 0) return currency === 'USD' ? 'US$ 0,00' : 'R$ 0,00';
  
  // Determina quantas casas decimais significativas o número tem
  let significantDecimals = 2;
  
  if (numValue < 1) {
    // Converte para string e conta casas decimais
    const str = numValue.toFixed(20); // Pega muitas casas
    const afterDot = str.split('.')[1];
    
    if (afterDot) {
      // Conta zeros à esquerda + dígitos significativos
      const firstNonZero = afterDot.search(/[1-9]/);
      if (firstNonZero !== -1) {
        // Mostra até 10 casas decimais para valores muito pequenos
        significantDecimals = Math.min(firstNonZero + 6, 10);
      }
    }
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: significantDecimals
  }).format(numValue);
}

function formatPercent(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '—';
  const sign = num > 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}%`;
}

function formatNumber(value) {
  // Converte para número se vier como string
  const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
  
  if (!numValue || isNaN(numValue)) return '0';
  
  if (numValue >= 1000000) {
    return (numValue / 1000000).toFixed(2) + 'M';
  }
  if (numValue >= 1000) {
    return (numValue / 1000).toFixed(2) + 'K';
  }
  
  // Para números pequenos, mostra até 8 casas decimais removendo zeros à direita
  return numValue.toFixed(8).replace(/\.?0+$/, '');
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR');
}

function showNotification(message, type = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`);
  
  // Cria elemento de notificação
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md animate-slide-down`;
  
  // Define cores baseado no tipo
  const colors = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    warning: 'bg-yellow-600 text-white',
    info: 'bg-blue-600 text-white'
  };
  
  notification.className += ` ${colors[type] || colors.info}`;
  
  // Define ícone baseado no tipo
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  notification.innerHTML = `
    <div class="flex items-center space-x-3">
      <span class="text-2xl">${icons[type] || icons.info}</span>
      <p class="flex-1">${message}</p>
      <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-gray-200">✕</button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Remove automaticamente após 5 segundos
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

// ==================== ELECTRON INTEGRATION ====================

async function loadAppInfo() {
  try {
    const version = await window.electronAPI.getAppVersion();
    const platform = window.platform.os;
    
    const versionEl = document.getElementById('app-version');
    if (versionEl) versionEl.textContent = version;
    
    const platformEl = document.getElementById('app-platform');
    if (platformEl) platformEl.textContent = platform;
    
    const footerInfo = document.getElementById('footer-info');
    if (footerInfo) footerInfo.textContent = `Multi Exchange v${version}`;
    
  } catch (error) {
    console.error('Erro ao carregar informações do app:', error);
  }
}

// ==================== TIMESTAMP UPDATE ====================

function updateTimestamp() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('pt-BR');
  const timestampEl = document.getElementById('last-update');
  if (timestampEl) {
    timestampEl.textContent = timeString;
  }
}

// Função auxiliar para atualizar mensagem de loading
function updateLoadingMessage(message, progressPercent) {
  const loadingMessage = document.getElementById('loading-message');
  const loadingProgress = document.getElementById('loading-progress');
  
  if (loadingMessage) {
    loadingMessage.textContent = message;
  }
  
  if (loadingProgress && progressPercent !== undefined) {
    loadingProgress.style.width = `${progressPercent}%`;
  }
}

// ==================== INICIALIZAÇÃO DO APP ====================

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Iniciando aplicação...');
  
  const loadingScreen = document.getElementById('loading-screen');
  const loadingMessage = document.getElementById('loading-message');
  const loadingProgress = document.getElementById('loading-progress');
  
  try {
    // Carrega informações do app
    loadingMessage.textContent = 'Carregando informações do app...';
    loadingProgress.style.width = '20%';
    await loadAppInfo();
    console.log('✅ App info carregada');
    
    // Registra event listeners
    loadingMessage.textContent = 'Configurando interface...';
    loadingProgress.style.width = '40%';
    setupEventListeners();
    console.log('✅ Event listeners configurados');
    
    // Carrega dashboard inicial
    loadingMessage.textContent = 'Carregando dashboard...';
    loadingProgress.style.width = '60%';
    await switchView('dashboard');
    console.log('✅ Dashboard carregado');
    
    // Atualiza timestamp
    loadingMessage.textContent = 'Finalizando...';
    loadingProgress.style.width = '80%';
    setInterval(updateTimestamp, 1000);
    updateTimestamp();
    console.log('✅ Timestamp iniciado');
    
    // Inicia auto-update
    startAutoUpdate();
    console.log('✅ Auto-update iniciado');
    
  } catch (error) {
    console.error('❌ Erro ao inicializar aplicação:', error);
    loadingMessage.textContent = 'Erro ao carregar aplicação';
    loadingMessage.classList.add('text-red-400');
  } finally {
    // SEMPRE remove o loading screen, mesmo com erro
    loadingProgress.style.width = '100%';
    console.log('🔄 Removendo loading screen...');
    
    const appContainer = document.getElementById('app');
    
    setTimeout(() => {
      if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.transition = 'opacity 0.3s';
        setTimeout(() => {
          loadingScreen.style.display = 'none';
          console.log('✅ Loading screen removido');
        }, 300);
      }
      
      // Habilita interações no app
      if (appContainer) {
        appContainer.classList.remove('pointer-events-none', 'opacity-50');
        appContainer.classList.add('pointer-events-auto', 'opacity-100');
        console.log('✅ App habilitado para interação!');
      }
    }, 500);
  }
});

console.log('Renderer script loaded');
