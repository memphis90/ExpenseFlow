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
const PROFILI_FILE = path.join(__dirname, 'profili.json');

// ── Profili ──
function readProfili() {
  if (!fs.existsSync(PROFILI_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(PROFILI_FILE, 'utf8')); } catch { return []; }
}
function writeProfili(list) {
  fs.writeFileSync(PROFILI_FILE, JSON.stringify(list, null, 2));
}
function ensureDefaultProfile() {
  const profili = readProfili();
  if (profili.length === 0) {
    writeProfili([{ id: 'default', nome: 'Profilo', password: '', colore: '#2362e8' }]);
    console.log('[Profili] Creato profilo default');
  }
}

// ── Per-profile paths ──
function getProfileDir(profiloId) {
  if (profiloId === 'default') return DATA_DIR;
  const dir = path.join(DATA_DIR, profiloId);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}
function getProfileConfigFile(profiloId, type) {
  if (profiloId === 'default') {
    if (type === 'ricorrenti') return path.join(__dirname, 'ricorrenti.json');
    if (type === 'metodi')     return path.join(__dirname, 'metodi-custom.json');
    if (type === 'categorie')  return path.join(__dirname, 'categorie.json');
  }
  const dir = getProfileDir(profiloId);
  return path.join(dir, type === 'ricorrenti' ? 'ricorrenti.json' : type === 'metodi' ? 'metodi-custom.json' : 'categorie.json');
}

// ── Categorie ──
function readCategorie(profiloId) {
  const f = getProfileConfigFile(profiloId, 'categorie');
  if (!fs.existsSync(f)) fs.writeFileSync(f, JSON.stringify(CATEGORIE_DEFAULT));
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}
function writeCategorie(profiloId, cats) {
  fs.writeFileSync(getProfileConfigFile(profiloId, 'categorie'), JSON.stringify(cats, null, 2));
}

// ── Metodi custom ──
function readMetodiCustom(profiloId) {
  const f = getProfileConfigFile(profiloId, 'metodi');
  if (!fs.existsSync(f)) return [];
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return []; }
}
function writeMetodiCustom(profiloId, list) {
  fs.writeFileSync(getProfileConfigFile(profiloId, 'metodi'), JSON.stringify(list, null, 2));
}

// ── Ricorrenti ──
function readRicorrenti(profiloId) {
  const f = getProfileConfigFile(profiloId, 'ricorrenti');
  if (!fs.existsSync(f)) return [];
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return []; }
}
function writeRicorrenti(profiloId, list) {
  fs.writeFileSync(getProfileConfigFile(profiloId, 'ricorrenti'), JSON.stringify(list, null, 2));
}

// ── Spese ──
function getYearFile(profiloId, year) {
  return path.join(getProfileDir(profiloId), `${year}.json`);
}
function readYear(profiloId, year) {
  const f = getYearFile(profiloId, year);
  if (!fs.existsSync(f)) return {};
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return {}; }
}
function writeYear(profiloId, year, data) {
  fs.writeFileSync(getYearFile(profiloId, year), JSON.stringify(data, null, 2));
}
function getAllSpese(profiloId) {
  const dir = getProfileDir(profiloId);
  if (!fs.existsSync(dir)) return [];
  const spese = [];
  const files = fs.readdirSync(dir).filter(f => /^\d{4}\.json$/.test(f));
  for (const file of files) {
    const yd = readYear(profiloId, file.replace('.json', ''));
    for (const arr of Object.values(yd)) {
      if (Array.isArray(arr)) spese.push(...arr);
    }
  }
  return spese;
}
function addSpesa(profiloId, spesa) {
  const [year, month] = spesa.data.split('-');
  const yd = readYear(profiloId, year);
  if (!yd[month]) yd[month] = [];
  yd[month].push(spesa);
  writeYear(profiloId, year, yd);
}
function updateSpesa(profiloId, id, updates) {
  const dir = getProfileDir(profiloId);
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter(f => /^\d{4}\.json$/.test(f));
  for (const file of files) {
    const year = file.replace('.json', '');
    const yd = readYear(profiloId, year);
    for (const month of Object.keys(yd)) {
      const idx = yd[month].findIndex(s => s.id === id);
      if (idx !== -1) {
        const updated = { ...yd[month][idx], ...updates, id };
        const [newYear, newMonth] = updated.data.split('-');
        if (newYear !== year || newMonth !== month) {
          yd[month].splice(idx, 1);
          if (!yd[month].length) delete yd[month];
          writeYear(profiloId, year, yd);
          addSpesa(profiloId, updated);
        } else {
          yd[month][idx] = updated;
          writeYear(profiloId, year, yd);
        }
        return updated;
      }
    }
  }
  return null;
}
function deleteSpesa(profiloId, id) {
  const dir = getProfileDir(profiloId);
  if (!fs.existsSync(dir)) return false;
  const files = fs.readdirSync(dir).filter(f => /^\d{4}\.json$/.test(f));
  for (const file of files) {
    const year = file.replace('.json', '');
    const yd = readYear(profiloId, year);
    for (const month of Object.keys(yd)) {
      const idx = yd[month].findIndex(s => s.id === id);
      if (idx !== -1) {
        yd[month].splice(idx, 1);
        if (!yd[month].length) delete yd[month];
        writeYear(profiloId, year, yd);
        return true;
      }
    }
  }
  return false;
}

// ── Auto-inserimento ricorrenti ──
function autoInsertRicorrentiForProfilo(profiloId) {
  const today    = new Date();
  const todayDay = today.getDate();
  const yearStr  = String(today.getFullYear());
  const monthStr = String(today.getMonth() + 1).padStart(2, '0');
  const monthKey = `${yearStr}-${monthStr}`;
  const ricorrenti = readRicorrenti(profiloId);
  if (!ricorrenti.length) return;
  const allSpese = getAllSpese(profiloId);
  for (const r of ricorrenti) {
    if (!r.attivo) continue;
    if (todayDay < r.giornoMese) continue;
    const exists = allSpese.some(s => s.ricorrenteId === r.id && s.data.startsWith(monthKey));
    if (exists) continue;
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const day = String(Math.min(r.giornoMese, daysInMonth)).padStart(2, '0');
    const spesa = {
      id: `${Date.now()}_${r.id}`,
      tipo: r.tipo || 'uscita',
      descrizione: r.nome,
      importo: r.importo,
      categoria: r.categoria || '',
      metodoPagamento: r.metodoPagamento || 'Contanti',
      data: `${yearStr}-${monthStr}-${day}`,
      note: r.tipoRicorrenza || '',
      ricorrenteId: r.id
    };
    addSpesa(profiloId, spesa);
    console.log(`[Ricorrente][${profiloId}] Inserita: ${r.nome} per ${monthKey}`);
  }
}
function autoInsertRicorrenti() {
  for (const p of readProfili()) autoInsertRicorrentiForProfilo(p.id);
}

// ── Express setup ──
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

function getProfilo(req) {
  return req.query.profilo || (req.body && req.body._profilo) || 'default';
}

// ── API Profili ──
app.get('/api/profili', (req, res) => {
  const profili = readProfili().map(({ password, ...p }) => ({ ...p, avatar: p.avatar || '', hasPassword: !!password }));
  res.json(profili);
});

app.post('/api/profili', (req, res) => {
  const list = readProfili();
  const { nome, password = '', colore = '#2362e8', avatar = '' } = req.body;
  if (!nome || !nome.trim()) return res.status(400).json({ error: 'Nome richiesto' });
  const id = `p${Date.now()}`;
  const profilo = { id, nome: nome.trim(), password, colore, avatar };
  list.push(profilo);
  writeProfili(list);
  getProfileDir(id); // crea directory
  res.json({ id, nome: profilo.nome, colore, avatar, hasPassword: !!password });
});

app.post('/api/profili/login', (req, res) => {
  const { id, password = '' } = req.body;
  const profilo = readProfili().find(p => p.id === id);
  if (!profilo) return res.status(404).json({ error: 'Profilo non trovato' });
  if (profilo.password && profilo.password !== password)
    return res.status(401).json({ error: 'Password errata' });
  res.json({ id: profilo.id, nome: profilo.nome, colore: profilo.colore, avatar: profilo.avatar || '', hasPassword: !!profilo.password });
});

app.put('/api/profili/:id', (req, res) => {
  const list = readProfili();
  const idx = list.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Profilo non trovato' });
  const { nome, password, colore, avatar } = req.body;
  if (nome !== undefined) list[idx].nome = nome.trim();
  if (password !== undefined) list[idx].password = password;
  if (colore !== undefined) list[idx].colore = colore;
  if (avatar !== undefined) list[idx].avatar = avatar;
  writeProfili(list);
  res.json({ id: list[idx].id, nome: list[idx].nome, colore: list[idx].colore, avatar: list[idx].avatar || '', hasPassword: !!list[idx].password });
});

app.delete('/api/profili/:id', (req, res) => {
  const list = readProfili();
  if (list.length <= 1) return res.status(400).json({ error: "Non puoi eliminare l'ultimo profilo" });
  const idx = list.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Profilo non trovato' });
  list.splice(idx, 1);
  writeProfili(list);
  res.json({ ok: true });
});

// ── API Spese ──
app.get('/api/spese', (req, res) => res.json(getAllSpese(getProfilo(req))));

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
  addSpesa(getProfilo(req), spesa);
  res.json(spesa);
});

app.put('/api/spese/:id', (req, res) => {
  const updated = updateSpesa(getProfilo(req), req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Non trovata' });
  res.json(updated);
});

app.delete('/api/spese/:id', (req, res) => {
  if (!deleteSpesa(getProfilo(req), req.params.id)) return res.status(404).json({ error: 'Non trovata' });
  res.json({ ok: true });
});

// ── API Ricorrenti ──
app.get('/api/ricorrenti', (req, res) => res.json(readRicorrenti(getProfilo(req))));

app.post('/api/ricorrenti', (req, res) => {
  const profiloId = getProfilo(req);
  const list = readRicorrenti(profiloId);
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
  writeRicorrenti(profiloId, list);
  res.json(item);
});

app.put('/api/ricorrenti/:id', (req, res) => {
  const profiloId = getProfilo(req);
  const list = readRicorrenti(profiloId);
  const idx = list.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Non trovata' });
  list[idx] = { ...list[idx], ...req.body, id: req.params.id };
  writeRicorrenti(profiloId, list);
  res.json(list[idx]);
});

app.delete('/api/ricorrenti/:id', (req, res) => {
  const profiloId = getProfilo(req);
  const list = readRicorrenti(profiloId);
  const idx = list.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Non trovata' });
  list.splice(idx, 1);
  writeRicorrenti(profiloId, list);
  res.json({ ok: true });
});

// ── API Metodi custom ──
app.get('/api/metodi-custom', (req, res) => res.json(readMetodiCustom(getProfilo(req))));
app.post('/api/metodi-custom', (req, res) => {
  const profiloId = getProfilo(req);
  const list = readMetodiCustom(profiloId);
  const nome = (req.body.nome || '').trim();
  if (!nome || list.includes(nome)) return res.json(list);
  list.push(nome);
  writeMetodiCustom(profiloId, list);
  res.json(list);
});
app.delete('/api/metodi-custom/:nome', (req, res) => {
  const profiloId = getProfilo(req);
  const list = readMetodiCustom(profiloId).filter(m => m !== req.params.nome);
  writeMetodiCustom(profiloId, list);
  res.json(list);
});

// ── API Categorie ──
app.get('/api/categorie', (req, res) => res.json(readCategorie(getProfilo(req))));
app.post('/api/categorie', (req, res) => {
  const profiloId = getProfilo(req);
  const cats = readCategorie(profiloId);
  if (req.body.nome && !cats.includes(req.body.nome)) {
    cats.push(req.body.nome);
    writeCategorie(profiloId, cats);
  }
  res.json(cats);
});

// ── API Struttura ──
app.get('/api/struttura', (req, res) => {
  const profiloId = getProfilo(req);
  const dir = getProfileDir(profiloId);
  const result = {};
  if (!fs.existsSync(dir)) return res.json(result);
  for (const file of fs.readdirSync(dir).filter(f => /^\d{4}\.json$/.test(f))) {
    const y = file.replace('.json', '');
    result[y] = Object.keys(readYear(profiloId, y)).sort();
  }
  res.json(result);
});

// ── API Utilità ──
app.post('/api/apri-cartella', (req, res) => {
  const profiloId = (req.body && req.body.profilo) || 'default';
  const dir = getProfileDir(profiloId);
  const cmd = process.platform === 'win32'
    ? `explorer "${dir}"`
    : process.platform === 'darwin'
    ? `open "${dir}"`
    : `xdg-open "${dir}"`;
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
  ensureDefaultProfile();
  autoInsertRicorrenti();
});
