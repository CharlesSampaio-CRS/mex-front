# Multi Exchange Front

Aplicação desktop construída com Electron e Tailwind CSS para gerenciamento de múltiplas exchanges de criptomoedas.

## 🚀 Tecnologias

- **Electron** - Framework para aplicações desktop
- **Tailwind CSS** - Framework CSS utilitário
- **JavaScript** - Linguagem de programação

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Gerar CSS do Tailwind
npm run build:css
```

## 🔧 Desenvolvimento

```bash
# Modo desenvolvimento com hot reload do CSS
npm run dev

# Ou iniciar apenas o Electron
npm start
```

## 🏗️ Build

```bash
# Build para a plataforma atual
npm run build

# Build específico por plataforma
npm run build:mac
npm run build:win
npm run build:linux
```

## 📁 Estrutura do Projeto

```
mult-exchange-front/
├── src/
│   ├── main.js          # Processo principal do Electron
│   ├── preload.js       # Script de preload
│   ├── renderer.js      # Processo de renderização
│   ├── index.html       # Página principal
│   ├── styles/
│   │   ├── input.css    # CSS de entrada (Tailwind)
│   │   └── output.css   # CSS compilado (gerado)
│   ├── assets/
│   │   └── icons/       # Ícones da aplicação
│   └── components/      # Componentes reutilizáveis
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## 📝 Licença

ISC
