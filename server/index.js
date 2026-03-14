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
const CAT_FILE = path.join(__dirname, 'categorie.json');

function readCategorie() {
  if (!fs.existsSync(CAT_FILE)) fs.writeFileSync(CAT_FILE, JSON.stringify(CATEGORIE_DEFAULT));
  return JSON.parse(fs.readFileSync(CAT_FILE, 'utf8'));
}
function writeCategorie(cats) {
  fs.writeFileSync(CAT_FILE, JSON.stringify(cats, null, 2));
}

function getYearFile(year) { return path.join(DATA_DIR, `${year}.json`); }
function readYear(year) {
  const f = getYearFile(year);
  if (!fs.existsSync(f)) return {};
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return {}; }
}
function writeYear(year, data) {
  fs.writeFileSync(getYearFile(year), JSON.stringify(data, null, 2));
}

function getAllSpese() {
  if (!fs.existsSync(DATA_DIR)) return [];
  return fs.readdirSync(DATA_DIR)
    .filter(f => /^\d{4}\.json$/.test(f))
    .flatMap(file => {
      const yd = readYear(file.replace('.json', ''));
      return Object.values(yd).flat().filter(Array.isArray.bind(null) || (v => Array.isArray(v)));
    });
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

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('/api/spese',          (req, res) => res.json(getAllSpeseFixed()));
app.get('/api/categorie',      (req, res) => res.json(readCategorie()));

app.get('/api/struttura', (req, res) => {
  const result = {};
  if (!fs.existsSync(DATA_DIR)) return res.json(result);
  for (const file of fs.readdirSync(DATA_DIR).filter(f => /^\d{4}\.json$/.test(f))) {
    const y = file.replace('.json', '');
    result[y] = Object.keys(readYear(y)).sort();
  }
  res.json(result);
});

app.post('/api/spese', (req, res) => {
  const spesa = {
    id: Date.now().toString(),
    descrizione: req.body.descrizione || '',
    importo: parseFloat(req.body.importo) || 0,
    categoria: req.body.categoria || 'Altro',
    data: req.body.data || new Date().toISOString().split('T')[0],
    note: req.body.note || ''
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

app.post('/api/categorie', (req, res) => {
  const cats = readCategorie();
  if (req.body.nome && !cats.includes(req.body.nome)) {
    cats.push(req.body.nome);
    writeCategorie(cats);
  }
  res.json(cats);
});

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
});
