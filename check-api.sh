#!/bin/bash

echo "🔍 Verificando Multi-Exchange API..."
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Testa conexão com a API
echo "📡 Testando conexão com http://localhost:5000/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health 2>/dev/null)

if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ API está ONLINE!${NC}"
    echo ""
    echo "📊 Resposta do health check:"
    curl -s http://localhost:5000/health | python3 -m json.tool
    echo ""
    
    # Testa endpoint de exchanges
    echo "🔗 Testando endpoint de exchanges disponíveis..."
    curl -s "http://localhost:5000/api/v1/exchanges/available?user_id=charles_test_user" | python3 -m json.tool | head -20
    echo ""
    
    echo -e "${GREEN}✅ Você pode iniciar o frontend com: npm start${NC}"
else
    echo -e "${RED}❌ API está OFFLINE ou não responde${NC}"
    echo ""
    echo -e "${YELLOW}💡 Você tem duas opções:${NC}"
    echo ""
    echo "1️⃣  Iniciar a API backend:"
    echo "   cd /path/to/api-backend"
    echo "   python app.py"
    echo ""
    echo "2️⃣  Usar dados mockados no frontend:"
    echo "   npm start"
    echo "   Depois clique no botão '🎭 Ativar Mock'"
    echo ""
fi
