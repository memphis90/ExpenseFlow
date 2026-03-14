<template>
  <div class="app-layout">

    <!-- ── MOB OVERLAY ── -->
    <div class="mob-overlay" :class="{ open: sideOpen }" @click="sideOpen=false"></div>

    <!-- ══ SIDEBAR ══ -->
    <aside class="sidebar" :class="{ open: sideOpen }">
      <div class="sb-logo">
        <div class="sb-logomark">Tracker</div>
        <div class="sb-name">Le mie spese</div>
      </div>
      <nav class="sb-nav">
        <div class="sb-section">Navigazione</div>
        <button class="sb-link" :class="{ on: page==='home' }" @click="go('home')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12L12 3l9 9"/><path d="M9 21V12h6v9"/><path d="M5 10v11h14V10"/></svg>
          Dashboard
        </button>
        <button class="sb-link" :class="{ on: page==='spese' }" @click="go('spese')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/></svg>
          Transazioni
        </button>
        <button class="sb-link" :class="{ on: page==='stats' }" @click="go('stats')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="12" width="4" height="9"/><rect x="10" y="7" width="4" height="14"/><rect x="17" y="3" width="4" height="18"/></svg>
          Statistiche
        </button>
        <div class="sb-section">Gestione</div>
        <button class="sb-link" :class="{ on: page==='categorie' }" @click="go('categorie')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><circle cx="7" cy="7" r="1.5" fill="currentColor"/></svg>
          Categorie
        </button>
        <button class="sb-link" @click="openFolder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
          Estratti conti
        </button>
        <button class="sb-link" @click="exportCSV">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Esporta CSV
        </button>
        <button class="sb-link" @click="quitOpen=true" style="margin-top:auto;color:var(--red)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Esci
        </button>
      </nav>
      <div class="sb-foot">
        <div class="sb-foot-label">Totale {{ meseNome }}</div>
        <div class="sb-foot-num">€{{ totMese }}</div>
      </div>
    </aside>

    <!-- ══ MAIN ══ -->
    <main class="main-area">

      <!-- ────── HOME ────── -->
      <div class="page" :class="{ active: page==='home' }">
        <div class="page-header">
          <div class="ph-row">
            <div>
              <div class="eyebrow" style="margin-bottom:3px">{{ meseNome }} {{ anno }}</div>
              <div class="display">Dashboard</div>
            </div>
            <div style="display:flex;gap:8px">
              <button class="btn-icon" @click="openNew">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Aggiungi
              </button>
              <button class="btn-icon" style="display:none" id="mob-menu-btn" @click="sideOpen=true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
            </div>
          </div>
        </div>
        <div class="page-inner">
          <div class="kpi-grid">
            <div class="kpi-card kpi-hero">
              <div>
                <div class="eyebrow">Speso questo mese</div>
                <div class="kpi-num">€{{ totMese }}</div>
              </div>
              <div style="text-align:right">
                <div class="eyebrow">Transazioni</div>
                <div class="kpi-num" style="font-size:26px">{{ speseMese.length }}</div>
              </div>
            </div>
            <div class="kpi-card">
              <div class="eyebrow">Media / giorno</div>
              <div class="kpi-num" style="font-size:22px;margin-top:8px">€{{ mediaGiorno }}</div>
              <div class="kpi-sub">su {{ giorniMese }} giorni</div>
            </div>
            <div class="kpi-card">
              <div class="eyebrow">Categoria top</div>
              <div style="font-size:15px;font-weight:500;margin-top:10px">{{ catTop.nome || '—' }}</div>
              <div class="kpi-sub" v-if="catTop.tot">€{{ catTop.tot }}</div>
            </div>
            <div class="kpi-card">
              <div class="eyebrow">Spesa massima</div>
              <div class="kpi-num" style="font-size:20px;margin-top:8px">€{{ spesaMax.importo?.toFixed(2) || '0.00' }}</div>
              <div class="kpi-sub" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ spesaMax.descrizione || '—' }}</div>
            </div>
          </div>

          <!-- Grafico a barre 7 giorni -->
          <div class="section-label">Ultimi 7 giorni</div>
          <div class="card" style="margin-bottom:12px">
            <div class="card-body">
              <div class="row" style="margin-bottom:14px">
                <span style="font-size:13px;font-weight:500">Spese per giorno</span>
                <span class="mono" style="font-size:12px;color:var(--ink3)">€{{ tot7g }}</span>
              </div>
              <div class="bar-chart" style="height:90px">
                <div v-for="g in week" :key="g.lbl" class="bar-col">
                  <div class="bar-track" style="height:100%">
                    <div class="bar-fill" :class="{ today: g.isToday, hi: g.isMax }" :style="{ height: g.pct+'%' }"></div>
                  </div>
                  <div class="bar-lbl">{{ g.lbl }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Grafico donut (Chart.js) -->
          <div class="section-label">Ripartizione mensile</div>
          <div class="card" style="margin-bottom:12px">
            <div class="card-body">
              <div v-if="!speseMese.length" class="empty" style="padding:20px 0">
                <div class="empty-sub">Nessuna spesa questo mese</div>
              </div>
              <div v-else style="display:flex;align-items:center;gap:24px;flex-wrap:wrap">
                <div class="chart-wrap" style="width:160px;height:160px;flex-shrink:0">
                  <canvas ref="donutRef" width="160" height="160"></canvas>
                </div>
                <div style="flex:1;min-width:140px">
                  <div v-for="(r,i) in perCat.slice(0,5)" :key="r.nome" style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                    <div style="width:8px;height:8px;border-radius:50%;flex-shrink:0" :style="{ background: PALETTE[i % PALETTE.length] }"></div>
                    <span style="font-size:13px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ r.nome }}</span>
                    <span class="mono" style="font-size:12px;color:var(--ink2)">{{ r.pct.toFixed(0) }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recenti -->
          <div class="row" style="margin-bottom:8px">
            <span class="section-label" style="margin:0">Recenti</span>
            <button @click="go('spese')" style="font-size:12px;font-weight:500;color:var(--blue);background:none;border:none;cursor:pointer;font-family:inherit">Vedi tutto →</button>
          </div>
          <div class="card" v-if="ultimi.length">
            <div class="tx-list">
              <div v-for="s in ultimi" :key="s.id" class="tx-row" @click="openEdit(s)">
                <div class="tx-icon"><svg-icon :name="catIcon(s.categoria)" /></div>
                <div class="tx-body">
                  <div class="tx-name">{{ s.descrizione }}</div>
                  <div class="tx-sub">{{ s.categoria }} · {{ fmtDate(s.data) }}</div>
                </div>
                <div class="tx-amt">−{{ s.importo.toFixed(2) }}</div>
              </div>
            </div>
          </div>
          <div class="card" v-else>
            <div class="empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
              <div class="empty-title">Nessuna spesa</div>
              <div class="empty-sub">Premi + per iniziare</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ────── TRANSAZIONI ────── -->
      <div class="page" :class="{ active: page==='spese' }">
        <div class="page-header">
          <div class="ph-row">
            <div class="display">Transazioni</div>
            <button class="btn-icon" @click="openNew">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Nuova
            </button>
          </div>
          <div class="tabs">
            <button class="tab" :class="{ on: fMese==='' }" @click="fMese=''">Tutte</button>
            <button v-for="m in mesiList" :key="m.v" class="tab" :class="{ on: fMese===m.v }" @click="fMese=m.v">{{ m.l }}</button>
          </div>
        </div>
        <div class="page-inner">
          <div class="tabs" style="margin-bottom:10px">
            <button class="tab" :class="{ on: fCat==='' }" @click="fCat=''">Tutte</button>
            <button v-for="c in catsUsed" :key="c" class="tab" :class="{ on: fCat===c }" @click="fCat=c">{{ c }}</button>
          </div>
          <div v-if="filtrate.length" style="margin-bottom:8px;font-size:12px;color:var(--ink3)">
            {{ filtrate.length }} transazioni · Totale <span class="mono">€{{ totFiltrate }}</span>
          </div>
          <div class="card" v-if="filtrate.length">
            <div class="tx-list">
              <div v-for="s in filtrate" :key="s.id" class="tx-row" @click="openEdit(s)">
                <div class="tx-icon"><svg-icon :name="catIcon(s.categoria)" /></div>
                <div class="tx-body">
                  <div class="tx-name">{{ s.descrizione }}</div>
                  <div class="tx-sub">{{ s.categoria }} · {{ fmtDate(s.data) }}</div>
                </div>
                <div class="tx-amt">−{{ s.importo.toFixed(2) }}</div>
              </div>
            </div>
          </div>
          <div class="card" v-else>
            <div class="empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <div class="empty-title">Nessun risultato</div>
              <div class="empty-sub">Prova un altro filtro</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ────── STATISTICHE ────── -->
      <div class="page" :class="{ active: page==='stats' }">
        <div class="page-header">
          <div class="ph-row">
            <div class="display">Statistiche</div>
            <div class="tabs">
              <button class="tab" :class="{ on: statsMese==='' }" @click="statsMese=''">Tutti</button>
              <button v-for="m in mesiList" :key="m.v" class="tab" :class="{ on: statsMese===m.v }" @click="statsMese=m.v">{{ m.l }}</button>
            </div>
          </div>
        </div>
        <div class="page-inner">
          <div class="stats-grid">
            <!-- Categorie -->
            <div>
              <div class="section-label">Per categoria</div>
              <div class="card">
                <div class="card-body">
                  <div v-if="!statsPerCat.length" class="empty" style="padding:20px 0">
                    <div class="empty-sub">Nessun dato</div>
                  </div>
                  <div v-for="(r,i) in statsPerCat" :key="r.nome" class="prog-item">
                    <div class="prog-row">
                      <div style="display:flex;align-items:center;gap:10px">
                        <div class="tx-icon" style="width:32px;height:32px;border-radius:9px">
                          <svg-icon :name="catIcon(r.nome)" />
                        </div>
                        <span style="font-size:13px;font-weight:500">{{ r.nome }}</span>
                      </div>
                      <span class="mono" style="font-size:13px">€{{ r.tot.toFixed(2) }}</span>
                    </div>
                    <div class="prog-bar-bg">
                      <div class="prog-bar" :style="{ width: r.pct+'%', background: PALETTE[i % PALETTE.length] }"></div>
                    </div>
                    <div style="font-size:10px;color:var(--ink3)">{{ r.pct.toFixed(0) }}% · {{ r.n }} operazioni</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Trend + Line chart -->
            <div>
              <div class="section-label">Trend mensile</div>
              <div class="card" style="margin-bottom:12px">
                <div class="card-body">
                  <div v-if="trend.length < 2" class="empty" style="padding:16px 0">
                    <div class="empty-sub">Servono almeno 2 mesi di dati</div>
                  </div>
                  <div v-else>
                    <div class="chart-wrap" style="height:140px">
                      <canvas ref="lineRef"></canvas>
                    </div>
                  </div>
                </div>
              </div>

              <div class="section-label">Riepilogo mensile</div>
              <div class="card">
                <div class="tx-list">
                  <div v-for="m in trend.slice().reverse().slice(0,6)" :key="m.key" class="tx-row" style="cursor:default">
                    <div class="tx-body">
                      <div class="tx-name">{{ m.lbl }}</div>
                      <div class="tx-sub">{{ m.n }} transazioni</div>
                    </div>
                    <div class="mono" style="font-size:14px;color:var(--ink)">€{{ m.tot }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ────── CATEGORIE ────── -->
      <div class="page" :class="{ active: page==='categorie' }">
        <div class="page-header">
          <div class="ph-row"><div class="display">Categorie</div></div>
        </div>
        <div class="page-inner">
          <div class="card" style="margin-bottom:12px">
            <div class="tx-list">
              <div v-for="c in allCats" :key="c.nome" class="tx-row" style="cursor:default">
                <div class="tx-icon"><svg-icon :name="catIcon(c.nome)" /></div>
                <div class="tx-body">
                  <div class="tx-name">{{ c.nome }}</div>
                  <div class="tx-sub">{{ c.n }} spese · €{{ c.tot.toFixed(2) }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="section-label">Aggiungi categoria</div>
          <div class="card">
            <div class="card-body">
              <div class="field">
                <label>Nome categoria</label>
                <input v-model="newCat" placeholder="Es. Viaggi" @keyup.enter="addCat" />
              </div>
              <div style="margin-top:12px"><button class="btn-primary" @click="addCat">Aggiungi</button></div>
            </div>
          </div>
        </div>
      </div>

    </main><!-- /main-area -->

    <!-- ══ DOCK (mobile) ══ -->
    <div class="dock-wrap">
      <div class="dock">
        <button class="d-btn" :class="{ on: page==='home' }" @click="go('home')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12L12 3l9 9"/><path d="M9 21V12h6v9"/></svg>
          <span>Home</span>
        </button>
        <button class="d-btn" :class="{ on: page==='spese' }" @click="go('spese')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/></svg>
          <span>Spese</span>
        </button>
        <button class="d-add" @click="openNew">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
        <button class="d-btn" :class="{ on: page==='stats' }" @click="go('stats')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="12" width="4" height="9"/><rect x="10" y="7" width="4" height="14"/><rect x="17" y="3" width="4" height="18"/></svg>
          <span>Stats</span>
        </button>
        <button class="d-btn" @click="sideOpen=true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          <span>Menu</span>
        </button>
      </div>
    </div>

    <!-- ══ SHEET ══ -->
    <div class="sh-overlay" :class="{ open: sheetOpen }" @click="closeSheet"></div>
    <div class="sheet" :class="{ open: sheetOpen }">
      <div class="sh-handle"></div>
      <div class="sh-head">
        <div class="sh-title">{{ editId ? 'Modifica spesa' : 'Nuova spesa' }}</div>
      </div>
      <div class="sh-body">
        <div class="field" style="margin-bottom:16px">
          <label>Importo</label>
          <div class="amount-wrap">
            <span class="amount-sym">€</span>
            <input class="amount-input" type="number" min="0" step="0.01" placeholder="0,00" v-model="form.importo" />
          </div>
        </div>
        <div class="field" style="margin-bottom:16px">
          <label>Categoria</label>
          <div class="cat-grid">
            <button v-for="c in CATS" :key="c.nome" class="cat-btn" :class="{ sel: form.categoria===c.nome }" @click="form.categoria=c.nome">
              <svg-icon :name="c.icon" />
              <span>{{ c.nome }}</span>
            </button>
          </div>
        </div>
        <div class="field">
          <label>Descrizione</label>
          <input type="text" v-model="form.descrizione" placeholder="Cosa hai speso?" />
        </div>
        <div class="field">
          <label>Data</label>
          <input type="date" v-model="form.data" />
        </div>
        <div class="field">
          <label>Note</label>
          <input type="text" v-model="form.note" placeholder="Facoltativo" />
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;margin-top:20px">
          <button class="btn-primary" @click="save" :disabled="!canSave">
            {{ editId ? 'Aggiorna' : 'Aggiungi spesa' }}
          </button>
          <button v-if="editId" class="btn-danger" @click="del">Elimina questa spesa</button>
        </div>
      </div>
    </div>

    <!-- ══ QUIT CONFIRM ══ -->
    <div class="quit-overlay" :class="{ open: quitOpen }">
      <div class="quit-modal">
        <h2>Chiudere l'app?</h2>
        <p>Il server verrà arrestato e l'app non sarà più accessibile finché non la riavvii.</p>
        <div class="quit-actions">
          <button class="btn-cancel" @click="quitOpen=false">Annulla</button>
          <button class="btn-primary" @click="confirmQuit" style="background:var(--red)">Esci</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div class="toast" :class="{ show: !!toastTxt }">{{ toastTxt }}</div>

  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch, nextTick } from 'vue'

// ── SVG Icon component inline ──
const SvgIcon = {
  props: ['name'],
  setup(props) {
    const ICONS = {
      utensils: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>`,
      car:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H3v-5l2-5h14l2 5v5h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/></svg>`,
      home:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12L12 3l9 9"/><path d="M9 21V12h6v9"/><path d="M5 10v11h14V10"/></svg>`,
      heart:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
      film:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="17" y1="7" x2="22" y2="7"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="2" y1="17" x2="7" y2="17"/></svg>`,
      bag:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>`,
      dumbbell:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5h11"/><path d="M6.5 17.5h11"/><path d="M2 8.5V6a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1v-2.5"/><path d="M22 8.5V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v12a1 1 0 001 1h2a1 1 0 001-1v-2.5"/></svg>`,
      box:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
    }
    return () => {
      const svg = ICONS[props.name] || ICONS.box
      return { render() { return null } }
    }
  },
  template: `<span v-html="svgHtml" style="display:contents"></span>`,
  computed: {
    svgHtml() {
      const ICONS = {
        utensils: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>`,
        car:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H3v-5l2-5h14l2 5v5h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/></svg>`,
        home:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12L12 3l9 9M5 10v11h14V10M9 21V12h6v9"/></svg>`,
        heart:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
        film:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>`,
        bag:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>`,
        dumbbell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5h11M6.5 17.5h11M2 8.5V6a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1v-2.5M22 8.5V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v12a1 1 0 001 1h2a1 1 0 001-1v-2.5"/></svg>`,
        box:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
      }
      return ICONS[this.name] || ICONS.box
    }
  }
}

// ── Categorie ──
const CATS = [
  { nome: 'Cibo',       icon: 'utensils' },
  { nome: 'Trasporti',  icon: 'car'      },
  { nome: 'Casa',       icon: 'home'     },
  { nome: 'Salute',     icon: 'heart'    },
  { nome: 'Svago',      icon: 'film'     },
  { nome: 'Shopping',   icon: 'bag'      },
  { nome: 'Sport',      icon: 'dumbbell' },
  { nome: 'Altro',      icon: 'box'      },
]
const PALETTE = ['#2362e8','#15803d','#b45309','#d92b2b','#7c3aed','#0e7490','#be185d','#65a30d']
const MESI = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre']

function catIcon(nome) { return CATS.find(c=>c.nome===nome)?.icon || 'box' }

// ── State ──
const page     = ref('home')
const sideOpen = ref(false)
const sheetOpen = ref(false)
const editId   = ref(null)
const toastTxt = ref('')
const quitOpen = ref(false)
const spese    = ref([])
const newCat   = ref('')
const extraCats = ref([])
const donutRef = ref(null)
const lineRef  = ref(null)
let donutChart = null
let lineChart  = null

const form = reactive({ descrizione:'', importo:'', categoria:'Cibo', data:today(), note:'' })

function today() { return new Date().toISOString().split('T')[0] }
const now  = new Date()
const anno = now.getFullYear()
const meseKey = `${anno}-${String(now.getMonth()+1).padStart(2,'0')}`

const meseNome    = MESI[now.getMonth()]
const speseMese   = computed(() => spese.value.filter(s=>s.data.startsWith(meseKey)))
const totMese     = computed(() => speseMese.value.reduce((a,s)=>a+s.importo,0).toFixed(2))
const ultimi      = computed(() => [...speseMese.value].sort((a,b)=>b.data.localeCompare(a.data)).slice(0,6))
const giorniMese  = new Date(anno, now.getMonth()+1, 0).getDate()
const mediaGiorno = computed(() => (parseFloat(totMese.value)/giorniMese).toFixed(2))
const catTop      = computed(() => {
  const m={}; speseMese.value.forEach(s=>{m[s.categoria]=(m[s.categoria]||0)+s.importo})
  const t=Object.entries(m).sort((a,b)=>b[1]-a[1])[0]
  return t?{nome:t[0],tot:t[1].toFixed(2)}:{}
})
const spesaMax = computed(() => speseMese.value.reduce((max,s)=>s.importo>(max.importo||0)?s:max,{}))

// ── 7 giorni ──
const week = computed(() => {
  const L=['Do','Lu','Ma','Me','Gi','Ve','Sa'], days=[]
  for(let i=6;i>=0;i--){
    const d=new Date(); d.setDate(d.getDate()-i)
    const k=d.toISOString().split('T')[0]
    const tot=spese.value.filter(s=>s.data===k).reduce((a,s)=>a+s.importo,0)
    days.push({lbl:L[d.getDay()],tot,isToday:i===0})
  }
  const max=Math.max(...days.map(d=>d.tot),1)
  const maxTot=Math.max(...days.map(d=>d.tot))
  return days.map(d=>({...d,pct:Math.max(Math.round((d.tot/max)*100),d.tot>0?5:2),isMax:d.tot===maxTot&&d.tot>0}))
})
const tot7g = computed(() => week.value.reduce((a,g)=>a+g.tot,0).toFixed(2))

// ── Per categoria (mese corrente) ──
const perCat = computed(() => {
  const m={}
  speseMese.value.forEach(s=>{if(!m[s.categoria])m[s.categoria]={tot:0,n:0};m[s.categoria].tot+=s.importo;m[s.categoria].n++})
  const tot=parseFloat(totMese.value)||1
  return Object.entries(m).sort((a,b)=>b[1].tot-a[1].tot).map(([nome,r])=>({nome,tot:r.tot,n:r.n,pct:(r.tot/tot)*100}))
})

// ── Trend ──
const trend = computed(() => {
  const m={}
  spese.value.forEach(s=>{const k=s.data.substring(0,7);if(!m[k])m[k]={tot:0,n:0};m[k].tot+=s.importo;m[k].n++})
  const sorted=Object.entries(m).sort((a,b)=>a[0].localeCompare(b[0])).slice(-12)
  return sorted.map(([k,r])=>{const[,mn]=k.split('-');return{key:k,lbl:MESI[parseInt(mn)-1].substring(0,3)+' '+k.split('-')[0],tot:r.tot.toFixed(0),n:r.n}})
})

// ── Filtri Transazioni ──
const fMese = ref(''); const fCat = ref('')
const mesiList = computed(() => {
  const s=new Set(spese.value.map(s=>s.data.substring(0,7)))
  return [...s].sort().reverse().map(v=>{const[y,m]=v.split('-');return{v,l:MESI[parseInt(m)-1].substring(0,3)+' '+y}})
})
const catsUsed  = computed(() => [...new Set(spese.value.map(s=>s.categoria))])
const filtrate  = computed(() => {
  let l=[...spese.value]
  if(fMese.value) l=l.filter(s=>s.data.startsWith(fMese.value))
  if(fCat.value)  l=l.filter(s=>s.categoria===fCat.value)
  return l.sort((a,b)=>b.data.localeCompare(a.data))
})
const totFiltrate = computed(() => filtrate.value.reduce((a,s)=>a+s.importo,0).toFixed(2))

// ── Filtri Stats ──
const statsMese = ref(meseKey)
const statsPerCat = computed(() => {
  const base = statsMese.value ? spese.value.filter(s=>s.data.startsWith(statsMese.value)) : spese.value
  const m={}; base.forEach(s=>{if(!m[s.categoria])m[s.categoria]={tot:0,n:0};m[s.categoria].tot+=s.importo;m[s.categoria].n++})
  const tot=Object.values(m).reduce((a,r)=>a+r.tot,0)||1
  return Object.entries(m).sort((a,b)=>b[1].tot-a[1].tot).map(([nome,r])=>({nome,tot:r.tot,n:r.n,pct:(r.tot/tot)*100}))
})

// ── Categorie page ──
const allCats = computed(() => {
  const names=[...new Set([...CATS.map(c=>c.nome),...extraCats.value])]
  return names.map(nome=>{const r=spese.value.filter(s=>s.categoria===nome);return{nome,n:r.length,tot:r.reduce((a,s)=>a+s.importo,0)}})
})

// ── Navigation ──
function go(p) { page.value=p; sideOpen.value=false }

// ── Form ──
const canSave = computed(() => form.importo>0 && form.categoria && form.data)
function openNew() { editId.value=null; Object.assign(form,{descrizione:'',importo:'',categoria:'Cibo',data:today(),note:''}); sheetOpen.value=true }
function openEdit(s) { editId.value=s.id; Object.assign(form,{descrizione:s.descrizione,importo:s.importo,categoria:s.categoria,data:s.data,note:s.note||''}); sheetOpen.value=true }
function closeSheet() { sheetOpen.value=false; editId.value=null }

// ── API ──
async function load() {
  try { spese.value=await fetch('/api/spese').then(r=>r.json()) } catch(e){console.error(e)}
}
async function save() {
  if(!canSave.value) return
  const body={descrizione:form.descrizione,importo:parseFloat(form.importo),categoria:form.categoria,data:form.data,note:form.note}
  try {
    if(editId.value) {
      const u=await fetch(`/api/spese/${editId.value}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(r=>r.json())
      const i=spese.value.findIndex(s=>s.id===editId.value); spese.value[i]=u; toast('Aggiornata ✓')
    } else {
      const n=await fetch('/api/spese',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(r=>r.json())
      spese.value.push(n); toast('Aggiunta ✓')
    }
    closeSheet()
  } catch(e){console.error(e)}
}
async function del() {
  if(!editId.value||!confirm('Eliminare questa spesa?')) return
  await fetch(`/api/spese/${editId.value}`,{method:'DELETE'})
  spese.value=spese.value.filter(s=>s.id!==editId.value); closeSheet(); toast('Eliminata')
}
async function addCat() {
  if(!newCat.value.trim()) return
  extraCats.value.push(newCat.value.trim())
  await fetch('/api/categorie',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nome:newCat.value})})
  toast('Categoria aggiunta'); newCat.value=''
}
function exportCSV() {
  const rows=[['Data','Descrizione','Categoria','Importo','Note']]
  spese.value.forEach(s=>rows.push([s.data,s.descrizione,s.categoria,s.importo.toFixed(2),s.note||'']))
  const a=Object.assign(document.createElement('a'),{href:URL.createObjectURL(new Blob([rows.map(r=>r.join(',')).join('\n')],{type:'text/csv'})),download:'spese.csv'})
  a.click(); toast('Export completato')
}
async function openFolder() {
  await fetch('/api/apri-cartella',{method:'POST'}); toast('Cartella aperta')
}
async function confirmQuit() {
  quitOpen.value=false
  await fetch('/api/quit',{method:'POST'}).catch(()=>{})
  setTimeout(()=>window.close(),300)
}

function fmtDate(d) { const[y,m,g]=d.split('-');return`${g}/${m}/${y}` }
function toast(msg) { toastTxt.value=msg; setTimeout(()=>{toastTxt.value=''},2200) }

// ── Chart.js ──
async function loadChartJS() {
  if(window.Chart) return
  await new Promise((res,rej)=>{
    const s=document.createElement('script')
    s.src='https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js'
    s.onload=res; s.onerror=rej; document.head.appendChild(s)
  })
}

async function renderDonut() {
  if(!donutRef.value||!perCat.value.length) return
  await loadChartJS()
  const isDark=matchMedia('(prefers-color-scheme:dark)').matches
  if(donutChart) donutChart.destroy()
  donutChart=new Chart(donutRef.value,{
    type:'doughnut',
    data:{
      labels:perCat.value.map(r=>r.nome),
      datasets:[{data:perCat.value.map(r=>r.tot),backgroundColor:PALETTE,borderWidth:0,hoverOffset:4}]
    },
    options:{
      responsive:false, cutout:'68%',
      plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>`€${parseFloat(ctx.raw).toFixed(2)}`}}}
    }
  })
}

async function renderLine() {
  if(!lineRef.value||trend.value.length<2) return
  await loadChartJS()
  const isDark=matchMedia('(prefers-color-scheme:dark)').matches
  const gridColor=isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)'
  const textColor=isDark?'#48483f':'#a5a49c'
  if(lineChart) lineChart.destroy()
  lineChart=new Chart(lineRef.value,{
    type:'line',
    data:{
      labels:trend.value.map(m=>m.lbl),
      datasets:[{
        data:trend.value.map(m=>parseFloat(m.tot)),
        borderColor:'#2362e8', backgroundColor:'rgba(35,98,232,0.08)',
        borderWidth:2, pointRadius:3, pointBackgroundColor:'#2362e8',
        fill:true, tension:0.35
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>`€${ctx.raw.toFixed(0)}`}}},
      scales:{
        x:{grid:{color:gridColor},ticks:{color:textColor,font:{size:10}}},
        y:{grid:{color:gridColor},ticks:{color:textColor,font:{size:10},callback:v=>'€'+v}}
      }
    }
  })
}

watch(() => [perCat.value, page.value], async([,p])=>{
  if(p==='home') { await nextTick(); renderDonut() }
  if(p==='stats') { await nextTick(); renderLine() }
},{deep:true})

watch(()=>statsMese.value, async()=>{ await nextTick(); renderLine() })

onMounted(async()=>{
  await load()
  await nextTick()
  if(page.value==='home') renderDonut()
})
</script>
