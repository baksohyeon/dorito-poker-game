#!/bin/bash

echo "🎰 Quick Poker Game Service Test"
echo ""

# Check databases
echo "📊 Database Status:"
if docker ps | grep -q "poker-postgres"; then
    echo "  ✅ PostgreSQL running"
else
    echo "  ❌ PostgreSQL not running"
fi

if docker ps | grep -q "poker-redis"; then
    echo "  ✅ Redis running"  
else
    echo "  ❌ Redis not running"
fi

# Check builds
echo ""
echo "🔨 Build Status:"
if [ -f "packages/database/dist/src/index.js" ]; then
    echo "  ✅ Database package built"
else
    echo "  ❌ Database package not built"
fi

if [ -f "apps/master-server/dist/index.js" ]; then
    echo "  ✅ Master server built"
else
    echo "  ❌ Master server not built"
fi

if [ -f "apps/dedicated-server/dist/src/index.js" ]; then
    echo "  ✅ Dedicated server built"
else
    echo "  ❌ Dedicated server not built"
fi

if [ -f "apps/ai-server/dist/src/index.js" ]; then
    echo "  ✅ AI server built"
else
    echo "  ❌ AI server not built"
fi

echo ""
echo "🚀 Ready to start services:"
echo "  npm run start        # All services"
echo "  npm run start:master # Master server only"
echo ""
echo "🌐 Access URLs (once started):"
echo "  Master Server: http://localhost:3001"
echo "  Dedicated Server: http://localhost:3002" 
echo "  AI Server: http://localhost:3003"