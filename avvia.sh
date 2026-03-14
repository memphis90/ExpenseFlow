#!/bin/bash
# ============================================
# Avvia App Spese - macOS / Linux
# Doppio click su questo file per avviare!
# ============================================

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
SERVER_DIR="$APP_DIR/server"
CLIENT_DIR="$APP_DIR/client"
PORT=3000
DIST_DIR="$CLIENT_DIR/dist"

echo "🚀 Avvio App Spese..."

# Controlla Node.js
if ! command -v node &> /dev/null; then
  osascript -e 'display alert "Node.js non trovato" message "Installa Node.js da https://nodejs.org" as critical'
  exit 1
fi

# Installa dipendenze server se necessario
if [ ! -d "$SERVER_DIR/node_modules" ]; then
  echo "📦 Installazione dipendenze server..."
  cd "$SERVER_DIR" && npm install
fi

# Installa e builda il client se necessario
if [ ! -d "$DIST_DIR" ]; then
  if [ ! -d "$CLIENT_DIR/node_modules" ]; then
    echo "📦 Installazione dipendenze client..."
    cd "$CLIENT_DIR" && npm install
  fi
  echo "🔨 Build del frontend..."
  cd "$CLIENT_DIR" && npm run build
fi

# Avvia il server in background
echo "✅ Avvio server su http://localhost:$PORT"
cd "$SERVER_DIR"
node index.js &
SERVER_PID=$!

# Aspetta che il server sia pronto
sleep 1

# Apri il browser
if command -v xdg-open &> /dev/null; then
  xdg-open "http://localhost:$PORT"
elif command -v open &> /dev/null; then
  open "http://localhost:$PORT"
fi

echo "✅ App avviata! PID server: $SERVER_PID"
echo "🛑 Premi CTRL+C per fermare il server"
echo ""

# Aspetta che l'utente interrompa
trap "echo ''; echo '🛑 Fermo il server...'; kill $SERVER_PID 2>/dev/null; echo '✅ Server fermato.'; exit 0" INT TERM

wait $SERVER_PID
