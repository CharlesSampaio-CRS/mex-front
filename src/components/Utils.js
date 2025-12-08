// Utilitários gerais para a aplicação

const Utils = {
  // Formata valor monetário
  formatCurrency(value, currency = 'USD') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(value);
  },

  // Formata números grandes (ex: 1000000 -> 1M)
  formatLargeNumber(num) {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  },

  // Formata data e hora
  formatDateTime(date) {
    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  },

  // Calcula porcentagem de mudança
  calculateChange(oldValue, newValue) {
    if (oldValue === 0) return 0;
    return ((newValue - oldValue) / oldValue) * 100;
  },

  // Debounce function para otimizar eventos
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Valida API Key
  validateApiKey(key) {
    return key && key.length >= 32;
  },

  // Gera ID único
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Toast notification helper
  showNotification(message, type = 'info') {
    // Implementar sistema de notificações
    console.log(`[${type.toUpperCase()}] ${message}`);
  }
};

// Exporta os utilitários
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
}
