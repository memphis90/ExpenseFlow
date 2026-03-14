const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
const PORT = 3000;

const DATA_DIR = path.join(__dirname, '..', 'estratti-conti');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const CATEGORIE_DEFAULT = ['Cibo', 'Trasporti', 'Casa', 'Salute', 'Svago', 'Shopping', 'Sport', 'Altro'];
const CAT_FILE        = path.join(__dirname, 'categorie.json');
const RICORRENTI_FILE  = path.join(__dirname, 'ricorrenti.json');
const METODI_FILE      = path.join(__dirname, 'metodi-custom.json');

// ── Categorie ──
function readCategorie() {
  if (!fs.existsSync(CAT_FILE)) fs.writeFileSync(CAT_FILE, JSON.stringify(CATEGORIE_DEFAULT));
  return JSON.parse(fs.readFileSync(CAT_FILE, 'utf8'));
}
function writeCategorie(cats) {
  fs.writeFileSync(CAT_FILE, JSON.stringify(cats, null, 2));
}

// ── Metodi custom ──
function readMetodiCustom() {
  if (!fs.existsSync(METODI_FILE)) fs.writeFileSync(METODI_FILE, '[]');
  try { return JSON.parse(fs.readFileSync(METODI_FILE, 'utf8')); } catch { return []; }
}
function writeMetodiCustom(list) { fs.writeFileSync(METODI_FILE, JSON.stringify(list, null, 2)); }

// ── Ricorrenti ──
function readRicorrenti() {
  if (!fs.existsSync(RICORRENTI_FILE)) fs.writeFileSync(RICORRENTI_FILE, '[]');
  try { return JSON.parse(fs.readFileSync(RICORRENTI_FILE, 'utf8')); } catch { return []; }
}
function writeRicorrenti(list) {
  fs.writeFileSync(RICORRENTI_FILE, JSON.stringify(list, null, 2));
}

// ── Spese (anno/mese) ──
function getYearFile(year) { return path.join(DATA_DIR, `${year}.json`); }
function readYear(year) {
  const f = getYearFile(year);
  if (!fs.existsSync(f)) return {};
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return {}; }
}
function writeYear(year, data) {
  fs.writeFileSync(getYearFile(year), JSON.stringify(data, null, 2));
}

function getAllSpeseFixed() {
  if (!fs.existsSync(DATA_DIR)) return [];
  const spese = [];
  const files = fs.readdirSync(DATA_DIR).filter(f => /^\d{4}\.json$/.test(f));
  for (const file of files) {
    const yd = readYear(file.replace('.json', ''));
    for (const arr of Object.values(yd)) {
      if (Array.isArray(arr)) spese.push(...arr);
    }
  }
  return spese;
}

function addSpesa(spesa) {
  const [year, month] = spesa.data.split('-');
  const yd = readYear(year);
  if (!yd[month]) yd[month] = [];
  yd[month].push(spesa);
  writeYear(year, yd);
}

function updateSpesa(id, updates) {
  const files = fs.existsSync(DATA_DIR)
    ? fs.readdirSync(DATA_DIR).filter(f => /^\d{4}\.json$/.test(f))
    : [];
  for (const file of files) {
    const year = file.replace('.json', '');
    const yd = readYear(year);
    for (const month of Object.keys(yd)) {
      const idx = yd[month].findIndex(s => s.id === id);
      if (idx !== -1) {
        const updated = { ...yd[month][idx], ...updates, id };
        const [newYear, newMonth] = updated.data.split('-');
        if (newYear !== year || newMonth !== month) {
          yd[month].splice(idx, 1);
          if (!yd[month].length) delete yd[month];
          writeYear(year, yd);
          addSpesa(updated);
        } else {
          yd[month][idx] = updated;
          writeYear(year, yd);
        }
        return updated;
      }
    }
  }
  return null;
}

function deleteSpesa(id) {
  const files = fs.existsSync(DATA_DIR)
    ? fs.readdirSync(DATA_DIR).filter(f => /^\d{4}\.json$/.test(f))
    : [];
  for (const file of files) {
    const year = file.replace('.json', '');
    const yd = readYear(year);
    for (const month of Object.keys(yd)) {
      const idx = yd[month].findIndex(s => s.id === id);
      if (idx !== -1) {
        yd[month].splice(idx, 1);
        if (!yd[month].length) delete yd[month];
        writeYear(year, yd);
        return true;
      }
    }
  }
  return false;
}

// ── Auto-inserimento ricorrenti ──
function autoInsertRicorrenti() {
  const today     = new Date();
  const todayDay  = today.getDate();
  const yearStr   = String(today.getFullYear());
  const monthStr  = String(today.getMonth() + 1).padStart(2, '0');
  const monthKey  = `${yearStr}-${monthStr}`;

  const ricorrenti = readRicorrenti();
  if (!ricorrenti.length) return;

  const allSpese = getAllSpeseFixed();

  for (const r of ricorrenti) {
    if (!r.attivo) continue;
    if (todayDay < r.giornoMese) continue; // giorno non ancora arrivato

    // già inserita questo mese?
    const exists = allSpese.some(s => s.ricorrenteId === r.id && s.data.startsWith(monthKey));
    if (exists) continue;

    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const day = String(Math.min(r.giornoMese, daysInMonth)).padStart(2, '0');
    const dataStr = `${yearStr}-${monthStr}-${day}`;

    const spesa = {
      id: `${Date.now()}_${r.id}`,
      tipo: r.tipo || 'uscita',
      descrizione: r.nome,
      importo: r.importo,
      categoria: r.categoria || '',
      metodoPagamento: r.metodoPagamento || 'Contanti',
      data: dataStr,
      note: r.tipoRicorrenza || '',
      ricorrenteId: r.id
    };

    addSpesa(spesa);
    console.log(`[Ricorrente] Inserita: ${r.nome} per ${monthKey}`);
  }
}

// ── Express setup ──
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

// ── API Spese ──
app.get('/api/spese', (req, res) => res.json(getAllSpeseFixed()));

app.post('/api/spese', (req, res) => {
  const spesa = {
    id: Date.now().toString(),
    tipo: req.body.tipo || 'uscita',
    descrizione: req.body.descrizione || '',
    importo: parseFloat(req.body.importo) || 0,
    categoria: req.body.categoria || (req.body.tipo === 'entrata' ? '' : 'Altro'),
    metodoPagamento: req.body.metodoPagamento || 'Contanti',
    data: req.body.data || new Date().toISOString().split('T')[0],
    note: req.body.note || '',
    ricorrenteId: req.body.ricorrenteId || null
  };
  addSpesa(spesa);
  res.json(spesa);
});

app.put('/api/spese/:id', (req, res) => {
  const updated = updateSpesa(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Non trovata' });
  res.json(updated);
});

app.delete('/api/spese/:id', (req, res) => {
  if (!deleteSpesa(req.params.id)) return res.status(404).json({ error: 'Non trovata' });
  res.json({ ok: true });
});

// ── API Ricorrenti ──
app.get('/api/ricorrenti', (req, res) => res.json(readRicorrenti()));

app.post('/api/ricorrenti', (req, res) => {
  const list = readRicorrenti();
  const item = {
    id: Date.now().toString(),
    nome: req.body.nome || '',
    importo: parseFloat(req.body.importo) || 0,
    tipo: req.body.tipo || 'uscita',
    tipoRicorrenza: req.body.tipoRicorrenza || 'Abbonamento',
    categoria: req.body.categoria || '',
    metodoPagamento: req.body.metodoPagamento || 'Contanti',
    giornoMese: parseInt(req.body.giornoMese) || 1,
    attivo: req.body.attivo !== false,
    note: req.body.note || ''
  };
  list.push(item);
  writeRicorrenti(list);
  res.json(item);
});

app.put('/api/ricorrenti/:id', (req, res) => {
  const list = readRicorrenti();
  const idx = list.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Non trovata' });
  list[idx] = { ...list[idx], ...req.body, id: req.params.id };
  writeRicorrenti(list);
  res.json(list[idx]);
});

app.delete('/api/ricorrenti/:id', (req, res) => {
  const list = readRicorrenti();
  const idx = list.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Non trovata' });
  list.splice(idx, 1);
  writeRicorrenti(list);
  res.json({ ok: true });
});

// ── API Metodi custom ──
app.get('/api/metodi-custom', (req, res) => res.json(readMetodiCustom()));
app.post('/api/metodi-custom', (req, res) => {
  const list = readMetodiCustom();
  const nome = (req.body.nome || '').trim();
  if (!nome || list.includes(nome)) return res.json(list);
  list.push(nome);
  writeMetodiCustom(list);
  res.json(list);
});
app.delete('/api/metodi-custom/:nome', (req, res) => {
  const list = readMetodiCustom().filter(m => m !== req.params.nome);
  writeMetodiCustom(list);
  res.json(list);
});

// ── API Categorie ──
app.get('/api/categorie', (req, res) => res.json(readCategorie()));

app.post('/api/categorie', (req, res) => {
  const cats = readCategorie();
  if (req.body.nome && !cats.includes(req.body.nome)) {
    cats.push(req.body.nome);
    writeCategorie(cats);
  }
  res.json(cats);
});

// ── API Struttura ──
app.get('/api/struttura', (req, res) => {
  const result = {};
  if (!fs.existsSync(DATA_DIR)) return res.json(result);
  for (const file of fs.readdirSync(DATA_DIR).filter(f => /^\d{4}\.json$/.test(f))) {
    const y = file.replace('.json', '');
    result[y] = Object.keys(readYear(y)).sort();
  }
  res.json(result);
});

// ── API Utilità ──
app.post('/api/apri-cartella', (req, res) => {
  const cmd = process.platform === 'win32'
    ? `explorer "${DATA_DIR}"`
    : process.platform === 'darwin'
    ? `open "${DATA_DIR}"`
    : `xdg-open "${DATA_DIR}"`;
  exec(cmd);
  res.json({ ok: true });
});

app.post('/api/quit', (req, res) => {
  res.json({ ok: true });
  setTimeout(() => process.exit(0), 200);
});

app.get('*', (req, res) => {
  const idx = path.join(__dirname, '../client/dist/index.html');
  if (fs.existsSync(idx)) res.sendFile(idx);
  else res.status(404).send('Esegui prima: cd client && npm install && npm run build');
});

app.listen(PORT, () => {
  console.log(`Server avviato: http://localhost:${PORT}`);
  console.log(`Dati in: ${DATA_DIR}`);
  autoInsertRicorrenti();
});
