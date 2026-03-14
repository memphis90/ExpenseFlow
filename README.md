# Spese Tracker v3

App per tracciare le spese mensili — Node.js + Express + Vue 3.

## Installazione Windows (prima volta)

1. Doppio click su **`installa-windows.bat`**
2. Attendi (~2-3 min, scarica dipendenze e compila il frontend)
3. Trovi **"Spese Tracker"** sul Desktop e nel menu Start

## Installazione macOS / Linux

```bash
chmod +x avvia.sh && ./avvia.sh
```

## Avvio quotidiano

Doppio click su **"Spese Tracker"** (Desktop) oppure su `avvia.sh`.
L'app si apre nel browser su `http://localhost:3000`.

## Chiusura

Sidebar → **Esci** → Conferma. Il server Node.js si ferma.

## Struttura dati (estratti-conti/)

```
estratti-conti/
├── 2025.json    ← {"01": [{spesa...}], "02": [...], ...}
└── 2026.json
```

Un file JSON per anno, diviso per mese. Leggibile, backupabile, portabile.

## Struttura progetto

```
spese-app/
├── installa-windows.bat   ← installer + shortcut Desktop
├── avvia-windows.bat      ← launcher (usato dal collegamento)
├── avvia.sh               ← launcher macOS/Linux
├── estratti-conti/        ← dati (creata automaticamente)
├── server/                ← Express API
└── client/                ← Vue 3 + Vite
```

## Requisiti

- Node.js 18+ — https://nodejs.org
- Porta 3000 libera
