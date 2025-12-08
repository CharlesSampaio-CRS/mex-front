// Exemplo de componente reutilizável
// Este arquivo demonstra como criar componentes modulares

class ExchangeCard {
  constructor(data) {
    this.name = data.name;
    this.balance = data.balance;
    this.status = data.status;
    this.icon = data.icon;
    this.type = data.type;
  }

  render() {
    const statusClass = this.status === 'connected' ? 'badge-success' : 'badge-error';
    const statusText = this.status === 'connected' ? 'Conectado' : 'Desconectado';

    return `
      <div class="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg hover:bg-dark-700 transition-all cursor-pointer">
        <div class="flex items-center space-x-4">
          <div class="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-xl">
            ${this.icon}
          </div>
          <div>
            <h3 class="font-semibold text-dark-100">${this.name}</h3>
            <p class="text-sm text-dark-400">${this.type}</p>
          </div>
        </div>
        <div class="text-right">
          <p class="font-semibold text-green-400">$${this.balance.toFixed(2)}</p>
          <span class="badge ${statusClass} text-xs">${statusText}</span>
        </div>
      </div>
    `;
  }
}

class StatsCard {
  constructor(data) {
    this.title = data.title;
    this.value = data.value;
    this.icon = data.icon;
    this.subtitle = data.subtitle;
    this.color = data.color || 'primary';
  }

  render() {
    return `
      <div class="card hover:border-primary-500/50 transition-all cursor-pointer animate-fade-in">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-dark-100">${this.title}</h3>
          <span class="text-3xl">${this.icon}</span>
        </div>
        <p class="text-4xl font-bold text-${this.color}-400">${this.value}</p>
        <p class="text-sm text-dark-400 mt-2">${this.subtitle}</p>
      </div>
    `;
  }
}

// Exporta os componentes para uso no renderer
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ExchangeCard, StatsCard };
}
