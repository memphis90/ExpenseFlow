<template>

  <!-- ══ LOGIN ══ -->
  <div v-if="!currentProfile" class="login-screen">

    <!-- ── Seleziona profilo (stile Netflix) ── -->
    <div v-if="loginStep==='select'" class="nf-wrap">
      <div class="nf-logo">💰 <span>ExpenseFlow</span></div>
      <div class="nf-who">{{ t('login.whoAreYou') }}</div>
      <div class="nf-profiles">
        <div v-for="p in loginProfiles" :key="p.id" class="nf-card" @click="selectProfile(p)">
          <div class="nf-circle" :style="!p.avatar ? { background: p.colore } : {}">
            <img v-if="p.avatar" :src="p.avatar" :alt="p.nome" />
            <span v-else>{{ p.nome.charAt(0).toUpperCase() }}</span>
            <div v-if="p.hasPassword" class="nf-lock">🔒</div>
          </div>
          <div class="nf-name">{{ p.nome }}</div>
        </div>
        <!-- Aggiungi profilo -->
        <div class="nf-card" @click="loginStep='create'; loginError=''; newProfileAvatar=''">
          <div class="nf-circle nf-circle-add">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:40px;height:40px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
          <div class="nf-name" style="color:var(--ink3)">{{ t('login.add') }}</div>
        </div>
      </div>
      <label class="remember-row">
        <input type="checkbox" v-model="rememberMe" />
        <span>{{ t('login.remember') }}</span>
      </label>
    </div>

    <!-- ── Password ── -->
    <div v-else-if="loginStep==='password'" class="nf-wrap nf-wrap-sm">
      <button class="nf-back" @click="loginStep='select'; loginError=''; loginPassword=''">{{ t('login.back') }}</button>
      <div class="nf-circle" style="margin:0 auto 14px" :style="!selectedLogin?.avatar ? { background: selectedLogin?.colore } : {}">
        <img v-if="selectedLogin?.avatar" :src="selectedLogin.avatar" :alt="selectedLogin.nome" />
        <span v-else>{{ selectedLogin?.nome.charAt(0).toUpperCase() }}</span>
      </div>
      <div class="nf-who" style="font-size:22px;margin-bottom:20px">{{ selectedLogin?.nome }}</div>
      <div class="field">
        <label>Password</label>
        <input type="password" v-model="loginPassword" @keyup.enter="doLogin" :placeholder="t('login.passwordPlaceholder')" autofocus />
      </div>
      <div v-if="loginError" class="login-error">{{ loginError }}</div>
      <button class="btn-primary" style="width:100%;margin-top:14px" @click="doLogin">{{ t('login.signIn') }}</button>
      <label class="remember-row" style="margin-top:14px">
        <input type="checkbox" v-model="rememberMe" />
        <span>{{ t('login.remember') }}</span>
      </label>
    </div>

    <!-- ── Crea profilo ── -->
    <div v-else-if="loginStep==='create'" class="nf-wrap nf-wrap-sm">
      <button v-if="loginProfiles.length" class="nf-back" @click="loginStep='select'; loginError=''">{{ t('login.back') }}</button>
      <div class="nf-who" style="font-size:22px;margin-bottom:6px">{{ loginProfiles.length ? t('login.newProfile') : t('login.welcome') }}</div>
      <div v-if="!loginProfiles.length" style="font-size:13px;color:var(--ink3);text-align:center;margin-bottom:20px">{{ t('login.firstProfileHint') }}</div>

      <!-- Anteprima avatar selezionato -->
      <div style="display:flex;justify-content:center;margin-bottom:16px">
        <div class="nf-circle" :style="!newProfileAvatar ? { background: newProfileColore } : {}">
          <img v-if="newProfileAvatar" :src="newProfileAvatar" alt="avatar" />
          <span v-else>{{ newProfileNome.trim().charAt(0).toUpperCase() || '?' }}</span>
        </div>
      </div>

      <!-- Griglia avatar -->
      <div class="av-label">{{ t('login.chooseAvatar') }}</div>
      <div class="av-grid">
        <!-- Opzione: solo iniziale colorata -->
        <button class="av-opt" :class="{ sel: !newProfileAvatar }" @click="newProfileAvatar=''" title="Solo iniziale">
          <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:500;color:#fff;border-radius:6px" :style="{ background: newProfileColore }">
            {{ newProfileNome.trim().charAt(0).toUpperCase() || '?' }}
          </div>
        </button>
        <button v-for="av in avatarList" :key="av.id" class="av-opt" :class="{ sel: newProfileAvatar===av.url }" @click="newProfileAvatar=av.url">
          <img :src="av.url" :alt="av.id" />
        </button>
      </div>

      <!-- Colore (solo se nessun avatar) -->
      <div v-if="!newProfileAvatar" style="margin-bottom:14px">
        <div class="av-label">{{ t('login.colorLabel') }}</div>
        <div class="color-picker">
          <button v-for="c in PROFILE_COLORS" :key="c" class="color-dot" :class="{ sel: newProfileColore===c }" :style="{ background: c }" @click="newProfileColore=c"></button>
        </div>
      </div>

      <div class="field" style="margin-top:4px">
        <label>{{ t('login.nameLabel') }}</label>
        <input type="text" v-model="newProfileNome" :placeholder="t('login.namePlaceholder')" @keyup.enter="doCreateProfile" autofocus />
      </div>
      <div class="field" style="margin-top:12px">
        <label>Password <span style="color:var(--ink3);font-weight:400">{{ t('login.passwordOptional') }}</span></label>
        <input type="password" v-model="newProfilePassword" :placeholder="t('login.passwordEmptyHint')" />
      </div>
      <div v-if="loginError" class="login-error">{{ loginError }}</div>
      <button class="btn-primary" style="width:100%;margin-top:16px" @click="doCreateProfile" :disabled="!newProfileNome.trim()">{{ t('login.createProfile') }}</button>
    </div>

  </div>

  <!-- ══ APP ══ -->
  <div v-else class="app-layout">

    <!-- ══ NAV RAIL (desktop only) ══ -->
    <div class="nav-col">
      <div class="nr-logo-wrap">
        <img :src="isDark ? '/logo.svg' : '/logo-light.svg'" class="nr-logo-img" alt="ExpenseFlow" />
      </div>

      <!-- Avatar → impostazioni, prima del menù -->
      <button class="nr-btn nr-avatar-btn" :class="{on:page==='config'}" @click="go('config')" :title="currentProfile?.nome">
        <div class="nf-circle" style="width:32px;height:32px;border-radius:9px;font-size:13px;font-weight:600;flex-shrink:0" :style="!currentProfile?.avatar ? { background: currentProfile?.colore||'#2362e8' } : {}">
          <img v-if="currentProfile?.avatar" :src="currentProfile.avatar" :alt="currentProfile.nome" />
          <span v-else>{{ currentProfile?.nome?.charAt(0).toUpperCase() }}</span>
        </div>
        <span class="nr-label">{{ currentProfile?.nome }}</span>
      </button>

    <nav class="nav-rail">
      <div class="nr-divider"></div>
      <button class="nr-btn" :class="{on:page==='home'}" @click="go('home')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12L12 3l9 9"/><path d="M9 21V12h6v9"/></svg>
        <span class="nr-label">{{ t('nav.home') }}</span>
      </button>
      <button class="nr-btn" :class="{on:page==='spese'}" @click="go('spese')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/></svg>
        <span class="nr-label">{{ t('nav.transactions') }}</span>
      </button>
      <button class="nr-btn" :class="{on:page==='stats'}" @click="go('stats')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="12" width="4" height="9"/><rect x="10" y="7" width="4" height="14"/><rect x="17" y="3" width="4" height="18"/></svg>
        <span class="nr-label">{{ t('nav.statistics') }}</span>
      </button>
      <div class="nr-divider"></div>
      <button class="nr-add" @click="openNew">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        <span class="nr-label">{{ t('nav.add') }}</span>
      </button>
      <div class="nr-divider"></div>
      <button class="nr-btn" :class="{on:page==='categorie'}" @click="go('categorie')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><circle cx="7" cy="7" r="1.5" fill="currentColor"/></svg>
        <span class="nr-label">{{ t('nav.categories') }}</span>
      </button>
      <button class="nr-btn" :class="{on:page==='metodi'}" @click="go('metodi')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
        <span class="nr-label">{{ t('nav.methods') }}</span>
      </button>
      <button class="nr-btn" :class="{on:page==='config'}" @click="go('config')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
        <span class="nr-label">{{ t('nav.settings') }}</span>
      </button>
    </nav>

      <!-- Bottom: solo logout -->
      <div class="nav-col-foot">
        <button class="nr-btn nr-logout-btn" @click="quitOpen=true" :title="t('sidebar.exit')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          <span class="nr-label">{{ t('sidebar.exit') }}</span>
        </button>
      </div>
    </div><!-- /nav-col -->

    <!-- ══ MAIN ══ -->
    <main class="main-area">

    <!-- ══ APP TOPBAR — solo mobile ══ -->
    <div class="app-topbar" :class="{ scrolled: topbarScrolled }">
      <div class="topbar-logo">
        <img :src="isDark ? '/logo.svg' : '/logo-light.svg'" alt="ExpandeFlow" class="topbar-logo-img" />
      </div>
      <button class="topbar-avatar" @click="sideOpen=true" :title="currentProfile?.nome">
        <div class="nf-circle" style="width:32px;height:32px;border-radius:6px;font-size:13px;font-weight:600" :style="!currentProfile?.avatar ? { background: currentProfile?.colore||'#2362e8' } : {}">
          <img v-if="currentProfile?.avatar" :src="currentProfile.avatar" :alt="currentProfile.nome" />
          <span v-else>{{ currentProfile?.nome?.charAt(0).toUpperCase() }}</span>
        </div>
      </button>
    </div>

      <!-- ────── HOME ────── -->
      <div class="page" :class="{ active: page==='home' }">
        <div class="page-inner">
          <div class="page-title">
            <div class="eyebrow">{{ meseNome }} {{ anno }}</div>
            <div class="display">{{ t('home.title') }}</div>
          </div>

          <!-- ── Bento Grid ── -->
          <div class="home-bento">

            <!-- LEFT: balance + bar chart + recent -->
            <div class="bento-main">

              <!-- Riepilogo mese -->
              <div class="card" style="margin-bottom:10px">
                <div class="card-body" style="padding:20px">
                  <!-- Saldo principale -->
                  <div style="margin-bottom:18px">
                    <div class="eyebrow" style="margin-bottom:6px">{{ t('home.balance') }} {{ meseNome }}</div>
                    <div class="mono balance-value" style="font-size:clamp(32px,6vw,44px);font-weight:300;letter-spacing:-.05em;line-height:1" :class="parseFloat(saldoMese)>=0 ? 'balance-pos' : 'balance-neg'" :style="{ color: parseFloat(saldoMese)>=0 ? 'var(--green-kpi)' : 'var(--red-kpi)' }">{{ parseFloat(saldoMese)>=0 ? '+' : '' }}€{{ saldoMese }}</div>
                    <div style="display:flex;gap:14px;margin-top:6px">
                      <div class="kpi-sub">{{ transazioniMese.length }} {{ t('home.transactions') }}</div>
                      <div class="kpi-sub">· {{ t('home.avgDay', {n: mediaGiorno}) }}</div>
                    </div>
                  </div>
                  <!-- Uscite / Entrate -->
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:0;padding-top:16px;border-top:1px solid var(--bdr)">
                    <div style="padding-right:16px">
                      <div class="eyebrow">{{ t('home.expenses') }}</div>
                      <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap">
                        <div class="mono" style="font-size:clamp(18px,3vw,24px);font-weight:300;letter-spacing:-.04em;color:var(--red-kpi);margin-top:4px;line-height:1">−€{{ totUscite }}</div>
                        <span v-if="trendUscite" class="trend-chip" :class="parseFloat(trendUscite)>0 ? 'trend-up' : 'trend-dn'">{{ parseFloat(trendUscite)>0 ? '↑' : '↓' }}{{ Math.abs(parseFloat(trendUscite)) }}%</span>
                      </div>
                    </div>
                    <div style="padding-left:16px;border-left:1px solid var(--bdr);text-align:right">
                      <div class="eyebrow">{{ t('home.income') }}</div>
                      <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;justify-content:flex-end">
                        <span v-if="trendEntrate" class="trend-chip" :class="parseFloat(trendEntrate)>0 ? 'trend-in-up' : 'trend-in-dn'">{{ parseFloat(trendEntrate)>0 ? '↑' : '↓' }}{{ Math.abs(parseFloat(trendEntrate)) }}%</span>
                        <div class="mono" style="font-size:clamp(18px,3vw,24px);font-weight:300;letter-spacing:-.04em;color:var(--green-kpi);margin-top:4px;line-height:1">+€{{ totEntrate }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Bar chart 7 giorni -->
              <div class="section-label">{{ t('home.last7days') }}</div>
              <div class="card" style="margin-bottom:12px">
                <div class="card-body">
                  <div class="row" style="margin-bottom:14px">
                    <span style="font-size:13px;font-weight:500">{{ t('home.expensesByDay') }}</span>
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

              <!-- Recenti -->
              <div class="row" style="margin-bottom:8px">
                <span class="section-label" style="margin:0">{{ t('home.recent') }}</span>
                <button @click="go('spese')" style="font-size:12px;font-weight:500;color:var(--blue);background:none;border:none;cursor:pointer;font-family:inherit">{{ t('home.viewAll') }}</button>
              </div>
              <div class="card" v-if="ultimi.length">
                <div class="tx-list">
                  <div v-for="s in ultimi" :key="s.id" class="tx-row" @click="openEdit(s)">
                    <div class="tx-icon" :class="{ 'tx-icon-in': s.tipo==='entrata' }"
                      v-html="s.tipo==='entrata' ? `<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round' style='width:15px;height:15px'><line x1='12' y1='19' x2='12' y2='5'/><polyline points='5 12 12 5 19 12'/></svg>` : catIconSvg(s.categoria)">
                    </div>
                    <div class="tx-body">
                      <div class="tx-name">{{ s.descrizione || (s.tipo==='entrata' ? t('tx.income') : t('sheet.expense')) }}</div>
                      <div class="tx-sub">{{ s.tipo==='entrata' ? t('tx.income') : s.categoria }} · {{ fmtDate(s.data) }}</div>
                    </div>
                    <div class="tx-amt" :class="{ 'tx-amt-in': s.tipo==='entrata' }">
                      {{ s.tipo==='entrata' ? '+' : '−' }}{{ s.importo.toFixed(2) }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="card" v-else>
                <div class="empty">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                  <div class="empty-title">{{ t('home.noTransactions') }}</div>
                  <div class="empty-sub">{{ t('home.pressPlus') }}</div>
                </div>
              </div>

            </div><!-- /bento-main -->

            <!-- RIGHT: KPI cards + donut chart -->
            <div class="bento-side">

              <!-- Due KPI -->
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                <div class="kpi-card" style="padding:13px 16px 14px">
                  <div style="display:flex;align-items:center;gap:7px;margin-bottom:6px">
                    <div style="width:26px;height:26px;border-radius:7px;background:var(--blue2);color:var(--blue);display:flex;align-items:center;justify-content:center;flex-shrink:0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><circle cx="7" cy="7" r="1.5" fill="currentColor"/></svg>
                    </div>
                    <div class="eyebrow">{{ t('home.topCategory') }}</div>
                  </div>
                  <div style="font-size:14px;font-weight:500">{{ catTop.nome || '—' }}</div>
                  <div class="kpi-sub" v-if="catTop.tot">€{{ catTop.tot }}</div>
                </div>
                <div class="kpi-card" style="padding:13px 16px 14px">
                  <div style="display:flex;align-items:center;gap:7px;margin-bottom:6px">
                    <div style="width:26px;height:26px;border-radius:7px;background:rgba(217,43,43,0.1);color:var(--red-kpi);display:flex;align-items:center;justify-content:center;flex-shrink:0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
                    </div>
                    <div class="eyebrow">{{ t('home.maxExpense') }}</div>
                  </div>
                  <div class="mono" style="font-size:17px;font-weight:300;letter-spacing:-.03em">€{{ uscitaMax.importo?.toFixed(2) || '0.00' }}</div>
                  <div class="kpi-sub" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ uscitaMax.descrizione || '—' }}</div>
                </div>
              </div>

              <!-- Donut chart -->
              <div class="section-label" style="margin-bottom:0">{{ t('home.monthlyDistribution') }}</div>
              <div class="card">
                <div class="card-body">
                  <div v-if="!usciteMese.length" class="empty" style="padding:20px 0">
                    <div class="empty-sub">{{ t('home.noExpensesMonth') }}</div>
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

            </div><!-- /bento-side -->

          </div><!-- /home-bento -->
        </div>
      </div>

      <!-- ────── TRANSAZIONI ────── -->
      <div class="page" :class="{ active: page==='spese' }">
        <div class="page-inner">
          <div class="page-title">
            <button v-if="fromCat" class="back-btn" @click="fromCat='';fCat='';go('categorie')">← {{ t('cat.title') }}</button>
            <div class="display">{{ fromCat ? fromCat : t('tx.title') }}</div>
          </div>
          <div class="filter-bar">
            <select v-model="fMese" class="filter-sel">
              <option value="">{{ t('tx.allMonths') }}</option>
              <option v-for="m in mesiList" :key="m.v" :value="m.v">{{ m.l }}</option>
            </select>
            <select v-model="fTipo" class="filter-sel">
              <option value="">{{ t('tx.all') }}</option>
              <option value="uscita">{{ t('tx.onlyExpenses') }}</option>
              <option value="entrata">{{ t('tx.onlyIncome') }}</option>
            </select>
            <select v-model="fRicorrente" class="filter-sel">
              <option value="">{{ t('tx.allItems') }}</option>
              <option value="si">{{ t('tx.onlyRecurring') }}</option>
              <option value="no">{{ t('tx.onlyNonRecurring') }}</option>
            </select>
            <select v-model="fCat" class="filter-sel">
              <option value="">{{ t('tx.allCategories') }}</option>
              <option v-for="c in catsUsed" :key="c" :value="c">{{ c }}</option>
            </select>
            <select v-model="fMetodo" class="filter-sel">
              <option value="">{{ t('tx.allMethods') }}</option>
              <option v-for="m in metodiUsed" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>
          <div v-if="filtrate.length" style="margin-bottom:8px;font-size:12px;color:var(--ink3)">
            {{ t('tx.count', {n: filtrate.length, tot: totFiltrate}) }}
          </div>
          <div class="card" v-if="filtrate.length">
            <div class="tx-list">
              <div v-for="s in filtrate" :key="s.id" class="tx-row" @click="openEdit(s)">
                <div class="tx-icon" :class="{ 'tx-icon-in': s.tipo==='entrata' }"
                  v-html="s.tipo==='entrata' ? `<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round' style='width:15px;height:15px'><line x1='12' y1='19' x2='12' y2='5'/><polyline points='5 12 12 5 19 12'/></svg>` : catIconSvg(s.categoria)">
                </div>
                <div class="tx-body">
                  <div class="tx-name">{{ s.descrizione || (s.tipo==='entrata' ? t('tx.income') : t('sheet.expense')) }}</div>
                  <div class="tx-sub">{{ s.tipo==='entrata' ? t('tx.income') : s.categoria }} · {{ fmtDate(s.data) }} · <span class="metodo-tag">{{ s.metodoPagamento || t('tx.cash') }}</span><span v-if="s.ricorrenteId" class="ric-tag">{{ t('tx.recurring') }}</span></div>
                </div>
                <div class="tx-amt" :class="{ 'tx-amt-in': s.tipo==='entrata' }">
                  {{ s.tipo==='entrata' ? '+' : '−' }}{{ s.importo.toFixed(2) }}
                </div>
              </div>
            </div>
          </div>
          <div class="card" v-else>
            <div class="empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <div class="empty-title">{{ t('tx.noResults') }}</div>
              <div class="empty-sub">{{ t('tx.tryFilter') }}</div>
            </div>
          </div>

          <!-- Totali -->
          <div v-if="filtrate.length" class="card" style="margin-top:10px">
            <div class="card-body" style="padding:14px 20px">
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0">
                <div>
                  <div class="eyebrow">{{ t('home.expenses') }}</div>
                  <div class="mono" style="font-size:15px;font-weight:400;color:var(--red-kpi);margin-top:4px">−€{{ totFiltrateUscite.toFixed(2) }}</div>
                </div>
                <div style="text-align:center;border-left:1px solid var(--bdr);border-right:1px solid var(--bdr);padding:0 8px">
                  <div class="eyebrow">{{ t('home.income') }}</div>
                  <div class="mono" style="font-size:15px;font-weight:400;color:var(--green-kpi);margin-top:4px">+€{{ totFiltrateEntrate.toFixed(2) }}</div>
                </div>
                <div style="text-align:right">
                  <div class="eyebrow">{{ t('tx.balance') }}</div>
                  <div class="mono" style="font-size:15px;font-weight:400;margin-top:4px" :style="{ color: parseFloat(totFiltrate)>=0 ? 'var(--green-kpi)' : 'var(--red-kpi)' }">{{ parseFloat(totFiltrate)>=0 ? '+' : '' }}€{{ totFiltrate }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ────── STATISTICHE ────── -->
      <div class="page" :class="{ active: page==='stats' }">
        <div class="page-inner">
          <div class="page-title-row">
            <div class="display">{{ t('stats.title') }}</div>
            <select v-model="statsMese" class="filter-sel" style="width:auto">
              <option value="">{{ t('stats.allMonths') }}</option>
              <option v-for="m in mesiList" :key="m.v" :value="m.v">{{ m.l }}</option>
            </select>
          </div>
          <div class="stats-grid">
            <!-- Categorie -->
            <div>
              <div class="section-label">{{ t('stats.byCategory') }}</div>
              <div class="card">
                <div class="card-body">
                  <div v-if="!statsPerCat.length" class="empty" style="padding:20px 0">
                    <div class="empty-sub">{{ t('stats.noData') }}</div>
                  </div>
                  <div v-for="(r,i) in statsPerCat" :key="r.nome" class="prog-item">
                    <div class="prog-row">
                      <div style="display:flex;align-items:center;gap:10px">
                        <div class="tx-icon" style="width:32px;height:32px;border-radius:9px" v-html="catIconSvg(r.nome)"></div>
                        <span style="font-size:13px;font-weight:500">{{ r.nome }}</span>
                      </div>
                      <span class="mono" style="font-size:13px">€{{ r.tot.toFixed(2) }}</span>
                    </div>
                    <div class="prog-bar-bg">
                      <div class="prog-bar" :style="{ width: r.pct+'%', background: PALETTE[i % PALETTE.length] }"></div>
                    </div>
                    <div style="font-size:10px;color:var(--ink3)">{{ t('stats.operations', {n: r.n}).replace('%', r.pct.toFixed(0)+'%') }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Trend + metodi -->
            <div>
              <div class="section-label">{{ t('stats.monthlyTrend') }}</div>
              <div class="card" style="margin-bottom:12px">
                <div class="card-body">
                  <div v-if="trend.length < 2" class="empty" style="padding:16px 0">
                    <div class="empty-sub">{{ t('stats.needMoreData') }}</div>
                  </div>
                  <div v-else>
                    <div class="chart-wrap" style="height:140px">
                      <canvas ref="lineRef"></canvas>
                    </div>
                  </div>
                </div>
              </div>

              <div class="section-label">{{ t('stats.monthlySummary') }}</div>
              <div class="card" style="margin-bottom:12px">
                <div class="tx-list">
                  <div v-for="m in trend.slice().reverse().slice(0,6)" :key="m.key" class="tx-row" style="cursor:default">
                    <div class="tx-body">
                      <div class="tx-name">{{ m.lbl }}</div>
                      <div class="tx-sub">{{ t('stats.expIncome', {nU: m.nU, nE: m.nE}) }}</div>
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px">
                      <div class="mono" style="font-size:12px;color:var(--red)">−€{{ m.totU }}</div>
                      <div class="mono" style="font-size:12px;color:var(--green)">+€{{ m.totE }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="section-label">{{ t('stats.byMethod') }}</div>
              <div class="card">
                <div class="card-body">
                  <div v-if="!perMetodo.length" class="empty" style="padding:16px 0">
                    <div class="empty-sub">{{ t('stats.noData') }}</div>
                  </div>
                  <div v-for="(r,i) in perMetodo" :key="r.nome" class="prog-item">
                    <div class="prog-row">
                      <span style="font-size:13px;font-weight:500">{{ r.nome }}</span>
                      <span class="mono" style="font-size:13px">€{{ r.tot.toFixed(2) }}</span>
                    </div>
                    <div class="prog-bar-bg">
                      <div class="prog-bar" :style="{ width: r.pct+'%', background: PALETTE[i % PALETTE.length] }"></div>
                    </div>
                    <div style="font-size:10px;color:var(--ink3)">{{ t('stats.operations', {n: r.n}).replace('%', r.pct.toFixed(0)+'%') }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ────── CATEGORIE ────── -->
      <div class="page" :class="{ active: page==='categorie' }">
        <div class="page-inner">
          <div class="page-title"><div class="display">{{ t('cat.title') }}</div></div>
          <div class="card" style="margin-bottom:12px">
            <div class="tx-list">
              <div v-for="c in allCats" :key="c.nome" class="tx-row" @click="clickCat(c.nome)" style="cursor:pointer">
                <div class="tx-icon" v-html="catIconSvg(c.nome)"></div>
                <div class="tx-body">
                  <div class="tx-name">{{ c.nome }}</div>
                  <div class="tx-sub">{{ t('cat.stats', {n: c.n, tot: c.tot.toFixed(2)}) }}</div>
                </div>
                <div style="font-size:12px;color:var(--blue);font-weight:500">{{ t('cat.view') }}</div>
              </div>
            </div>
          </div>
          <div class="section-label">{{ t('cat.addLabel') }}</div>
          <div class="card">
            <div class="card-body">
              <div class="field">
                <label>{{ t('cat.nameLabel') }}</label>
                <input v-model="newCat" :placeholder="t('cat.namePlaceholder')" @keyup.enter="addCat" />
              </div>
              <div style="margin-top:12px"><button class="btn-primary" @click="addCat">{{ t('cat.add') }}</button></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ────── METODI PAGAMENTO ────── -->
      <div class="page" :class="{ active: page==='metodi' }">
        <div class="page-inner">
          <div class="page-title"><div class="display">{{ t('methods.title') }}</div></div>
          <div class="card" style="margin-bottom:12px">
            <div class="tx-list">
              <div v-for="(m,i) in allMetodiDisplay" :key="m.nome" class="tx-row" style="cursor:default">
                <div class="tx-icon" :style="{ background: PALETTE[i%PALETTE.length]+'22', color: PALETTE[i%PALETTE.length], borderColor: PALETTE[i%PALETTE.length]+'44' }"
                  v-html="methodIconSvg(m.nome)">
                </div>
                <div class="tx-body">
                  <div class="tx-name">{{ m.nome }}</div>
                  <div class="tx-sub">{{ t('methods.stats', {n: m.n, tot: m.tot.toFixed(2)}) }}</div>
                </div>
                <div class="mono" style="font-size:12px;color:var(--ink3)">{{ m.n>0 ? m.pct.toFixed(0)+'%' : '—' }}</div>
              </div>
            </div>
          </div>
          <div class="section-label">{{ t('methods.addLabel') }}</div>
          <div class="card">
            <div class="card-body">
              <div class="field">
                <label>{{ t('methods.nameLabel') }}</label>
                <input v-model="newMetodo" :placeholder="t('methods.namePlaceholder')" @keyup.enter="addMetodo" />
              </div>
              <div style="margin-top:12px"><button class="btn-primary" @click="addMetodo">{{ t('methods.add') }}</button></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ────── RICORRENTI ────── -->
      <div class="page" :class="{ active: page==='ricorrenti' }">
        <div class="page-inner">
          <div class="page-title-row">
            <div class="display">{{ t('rec.title') }}</div>
            <button class="btn-icon" @click="openNewRicorrente">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              {{ t('rec.add') }}
            </button>
          </div>

          <!-- Riepilogo spreco mensile -->
          <div v-if="ricorrenti.length" class="kpi-grid" style="margin-bottom:16px">
            <div class="kpi-card kpi-hero">
              <div>
                <div class="eyebrow">{{ t('rec.fixedExpenses') }}</div>
                <div class="kpi-num" style="font-size:24px;color:var(--red-kpi)">−€{{ totRicorrentiUsciteAnno }}</div>
              </div>
              <div style="text-align:right">
                <div class="eyebrow">{{ t('rec.fixedIncome') }}</div>
                <div class="kpi-num" style="font-size:24px;color:var(--green-kpi)">+€{{ totRicorrentiEntrateAnno }}</div>
              </div>
            </div>
          </div>

          <!-- Lista ricorrenti attive -->
          <div class="section-label">{{ t('rec.active', {n: ricorrentiAttive.length}) }}</div>
          <div class="card" style="margin-bottom:12px" v-if="ricorrentiAttive.length">
            <div class="tx-list">
              <div v-for="r in ricorrentiAttive" :key="r.id" class="tx-row" @click="openEditRicorrente(r)">
                <div class="tx-icon" :class="{ 'tx-icon-in': r.tipo==='entrata' }" style="border-radius:50%">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
                </div>
                <div class="tx-body">
                  <div class="tx-name">{{ r.nome }}</div>
                  <div class="tx-sub">{{ r.tipoRicorrenza }} · {{ t('rec.day') }} {{ r.giornoMese }} · {{ r.metodoPagamento || t('rec.cash') }}</div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px">
                  <div class="tx-amt" :class="{ 'tx-amt-in': r.tipo==='entrata' }">
                    {{ r.tipo==='entrata' ? '+' : '−' }}{{ r.importo.toFixed(2) }}
                  </div>
                  <div class="ric-tag">{{ t('rec.perMonth') }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="card" style="margin-bottom:12px" v-else>
            <div class="empty" style="padding:28px 20px">
              <div class="empty-sub">{{ t('rec.noActive') }}</div>
            </div>
          </div>

          <!-- Lista ricorrenti sospese -->
          <template v-if="ricorrentiSospese.length">
            <div class="section-label">{{ t('rec.suspended', {n: ricorrentiSospese.length}) }}</div>
            <div class="card">
              <div class="tx-list">
                <div v-for="r in ricorrentiSospese" :key="r.id" class="tx-row" @click="openEditRicorrente(r)" style="opacity:.5">
                  <div class="tx-icon" style="border-radius:50%">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
                  </div>
                  <div class="tx-body">
                    <div class="tx-name">{{ r.nome }}</div>
                    <div class="tx-sub">{{ r.tipoRicorrenza }} · {{ t('rec.day') }} {{ r.giornoMese }}</div>
                  </div>
                  <div class="tx-amt">{{ r.tipo==='entrata' ? '+' : '−' }}{{ r.importo.toFixed(2) }}</div>
                </div>
              </div>
            </div>
          </template>

        </div>
      </div>

      <!-- ────── CONFIG ────── -->
      <div class="page" :class="{ active: page==='config' }">
        <div class="page-inner">
          <div class="page-title"><div class="display">{{ t('config.title') }}</div></div>

          <!-- Profilo attivo -->
          <div class="section-label">{{ t('config.account') }}</div>
          <div class="card" style="margin-bottom:16px">
            <div class="card-body" style="display:flex;align-items:center;gap:12px">
              <div class="nf-circle" style="width:40px;height:40px;font-size:15px;border-radius:8px;flex-shrink:0" :style="!currentProfile?.avatar ? { background: currentProfile?.colore||'#2362e8' } : {}">
                <img v-if="currentProfile?.avatar" :src="currentProfile.avatar" :alt="currentProfile.nome" />
                <span v-else>{{ currentProfile?.nome?.charAt(0).toUpperCase() }}</span>
              </div>
              <div style="flex:1">
                <div style="font-size:14px;font-weight:500">{{ currentProfile?.nome }}</div>
                <div class="kpi-sub">{{ t('config.activeSession') }}</div>
              </div>
              <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
                <button @click="openEditProfile()" style="font-size:12px;padding:6px 14px;border-radius:8px;border:1px solid var(--bdr2);color:var(--ink2);background:none;cursor:pointer;font-family:inherit;font-weight:500">{{ t('config.edit') }}</button>
                <button @click="logout()" style="font-size:12px;padding:6px 14px;border-radius:8px;border:1px solid var(--bdr2);color:var(--blue);background:none;cursor:pointer;font-family:inherit;font-weight:500">{{ t('config.switchProfile') }}</button>
              </div>
            </div>
          </div>

          <!-- Tema -->
          <div class="section-label">{{ t('config.appearance') }}</div>
          <div class="card" style="margin-bottom:16px">
            <div class="card-body" style="display:flex;align-items:center;justify-content:space-between">
              <div>
                <div style="font-size:14px;font-weight:500">{{ isDark ? t('config.darkTheme') : t('config.lightTheme') }}</div>
                <div class="kpi-sub">{{ t('config.appearanceHint') }}</div>
              </div>
              <button @click="toggleTheme" class="toggle-btn" :class="{ on: isDark }">
                <span class="toggle-knob"></span>
              </button>
            </div>
          </div>

          <!-- Lingua -->
          <div class="section-label">{{ t('config.language') }}</div>
          <div class="card" style="margin-bottom:16px">
            <div class="card-body" style="display:flex;align-items:center;justify-content:space-between">
              <div>
                <div style="font-size:14px;font-weight:500">{{ lang==='it' ? '🇮🇹 Italiano' : '🇬🇧 English' }}</div>
                <div class="kpi-sub">{{ t('config.languageHint') }}</div>
              </div>
              <div style="display:flex;gap:6px">
                <button @click="setLang('it')" :style="lang==='it' ? 'background:var(--blue);color:#fff;border-color:var(--blue)' : ''" style="font-size:12px;padding:5px 12px;border-radius:8px;border:1px solid var(--bdr2);cursor:pointer;font-family:inherit;font-weight:500;background:none;color:var(--ink2)">IT</button>
                <button @click="setLang('en')" :style="lang==='en' ? 'background:var(--blue);color:#fff;border-color:var(--blue)' : ''" style="font-size:12px;padding:5px 12px;border-radius:8px;border:1px solid var(--bdr2);cursor:pointer;font-family:inherit;font-weight:500;background:none;color:var(--ink2)">EN</button>
              </div>
            </div>
          </div>

          <!-- Sezioni -->
          <div class="section-label">{{ t('config.navigation') }}</div>
          <div class="card" style="margin-bottom:16px">
            <div class="tx-list">
              <div class="tx-row" @click="openFolder">
                <div class="tx-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
                </div>
                <div class="tx-body"><div class="tx-name">{{ t('config.openFolder') }}</div></div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" style="width:14px;height:14px;color:var(--ink3)"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
              <div class="tx-row" @click="go('stats')">
                <div class="tx-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><rect x="3" y="12" width="4" height="9"/><rect x="10" y="7" width="4" height="14"/><rect x="17" y="3" width="4" height="18"/></svg>
                </div>
                <div class="tx-body"><div class="tx-name">{{ t('nav.statistics') }}</div></div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" style="width:14px;height:14px;color:var(--ink3)"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
              <div class="tx-row" @click="go('ricorrenti')">
                <div class="tx-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
                </div>
                <div class="tx-body"><div class="tx-name">{{ t('nav.recurring') }}</div></div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" style="width:14px;height:14px;color:var(--ink3)"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
              <div class="tx-row" @click="go('categorie')">
                <div class="tx-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><circle cx="7" cy="7" r="1.5" fill="currentColor"/></svg>
                </div>
                <div class="tx-body"><div class="tx-name">{{ t('nav.categories') }}</div></div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" style="width:14px;height:14px;color:var(--ink3)"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
              <div class="tx-row" @click="go('metodi')">
                <div class="tx-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                </div>
                <div class="tx-body"><div class="tx-name">{{ t('nav.methods') }}</div></div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" style="width:14px;height:14px;color:var(--ink3)"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </div>
          </div>

        </div>
      </div>

    </main><!-- /main-area -->

    <!-- ══ SIDEBAR OVERLAY ══ -->
    <div class="mob-overlay" :class="{ open: sideOpen }" @click="sideOpen=false"></div>

    <!-- ══ SIDEBAR ══ -->
    <div class="sidebar" :class="{ open: sideOpen }">

      <!-- Profilo corrente -->
      <div class="sb-logo" style="padding:20px 16px 16px">
        <div class="sb-logomark">{{ t('sidebar.activeProfile') }}</div>
        <div style="display:flex;align-items:center;gap:12px;margin-top:10px">
          <div class="nf-circle" style="width:46px;height:46px;font-size:18px;border-radius:8px;flex-shrink:0"
            :style="!currentProfile?.avatar ? { background: currentProfile?.colore||'#2362e8' } : {}">
            <img v-if="currentProfile?.avatar" :src="currentProfile.avatar" :alt="currentProfile.nome" />
            <span v-else>{{ currentProfile?.nome?.charAt(0).toUpperCase() }}</span>
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-size:15px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ currentProfile?.nome }}</div>
            <button @click="openEditProfile(); sideOpen=false"
              style="font-size:11px;color:var(--blue);background:none;border:none;cursor:pointer;padding:2px 0;font-family:inherit">
              {{ t('sidebar.editProfile') }}
            </button>
          </div>
        </div>
      </div>

      <div class="sb-nav">

        <!-- Cambia profilo -->
        <template v-if="loginProfiles.filter(p=>p.id!==currentProfile?.id).length">
          <div class="sb-section">{{ t('sidebar.switchProfile') }}</div>
          <button v-for="p in loginProfiles.filter(p=>p.id!==currentProfile?.id)" :key="p.id"
            class="sb-link" @click="switchProfile(p)">
            <div class="nf-circle" style="width:26px;height:26px;font-size:11px;font-weight:600;border-radius:4px;flex-shrink:0"
              :style="!p.avatar ? { background: p.colore } : {}">
              <img v-if="p.avatar" :src="p.avatar" :alt="p.nome" />
              <span v-else>{{ p.nome.charAt(0).toUpperCase() }}</span>
            </div>
            <span>{{ p.nome }}</span>
            <span v-if="p.hasPassword" style="font-size:10px;opacity:.5;margin-left:auto">🔒</span>
          </button>
          <button class="sb-link" style="opacity:.65" @click="loginStep='create'; loginError=''; newProfileAvatar=''; sideOpen=false; currentProfile=null; localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_KEY)">
            <div class="nf-circle" style="width:26px;height:26px;border-radius:4px;border:1.5px dashed var(--bdr2);background:transparent;flex-shrink:0;color:var(--ink3)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="width:12px;height:12px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
            <span>{{ t('sidebar.addProfile') }}</span>
          </button>
        </template>
        <template v-else>
          <div class="sb-section">{{ t('sidebar.profiles') }}</div>
          <button class="sb-link" style="opacity:.65" @click="loginStep='create'; loginError=''; newProfileAvatar=''; sideOpen=false; currentProfile=null; localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_KEY)">
            <div class="nf-circle" style="width:26px;height:26px;border-radius:4px;border:1.5px dashed var(--bdr2);background:transparent;flex-shrink:0;color:var(--ink3)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="width:12px;height:12px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
            <span>{{ t('sidebar.addProfile') }}</span>
          </button>
        </template>

        <!-- Navigazione -->
        <div class="sb-section">{{ t('sidebar.navigation') }}</div>
        <button class="sb-link" :class="{ on: page==='config' }" @click="go('config')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          {{ t('sidebar.settings') }}
        </button>

      </div><!-- /sb-nav -->

      <!-- Footer: esci -->
      <div class="sb-foot">
        <button @click="quitOpen=true; sideOpen=false"
          style="display:flex;align-items:center;gap:9px;width:100%;padding:10px 12px;border-radius:var(--r2);border:none;background:none;cursor:pointer;font-family:inherit;font-size:14px;color:var(--red);transition:background .12s"
          onmouseover="this.style.background='rgba(217,43,43,0.08)'" onmouseout="this.style.background='none'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;opacity:.75"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          {{ t('sidebar.exit') }}
        </button>
      </div>

    </div><!-- /sidebar -->

    <!-- ══ DOCK ══ -->
    <div class="dock-wrap">
      <div class="dock">
        <!-- sinistra -->
        <button class="d-btn" :class="{ on: page==='home' }" @click="go('home')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12L12 3l9 9"/><path d="M9 21V12h6v9"/></svg>
        </button>
        <button class="d-btn" :class="{ on: page==='spese' }" @click="go('spese')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/></svg>
        </button>
        <button class="d-btn" :class="{ on: page==='stats' }" @click="go('stats')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="12" width="4" height="9"/><rect x="10" y="7" width="4" height="14"/><rect x="17" y="3" width="4" height="18"/></svg>
        </button>
        <!-- centro -->
        <button class="d-add" @click="openNew">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
        <!-- destra -->
        <button class="d-btn" :class="{ on: page==='categorie' }" @click="go('categorie')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><circle cx="7" cy="7" r="1.5" fill="currentColor"/></svg>
        </button>
        <button class="d-btn" :class="{ on: page==='metodi' }" @click="go('metodi')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
        </button>
        <button class="d-btn" :class="{ on: page==='config' }" @click="go('config')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
        </button>
      </div>
    </div>

    <!-- ══ SHEET UNIFICATO ══ -->
    <div class="sh-overlay" :class="{ open: sheetOpen }" @click="closeSheet"></div>
    <div class="sheet" :class="{ open: sheetOpen }">
      <div class="sh-handle"></div>
      <div class="sh-head">
        <div class="sh-title">{{ editId && editIsRic ? t('sheet.editRecurring') : editId ? t('sheet.editTransaction') : form.ricorrenza ? t('sheet.newRecurring') : t('sheet.newTransaction') }}</div>
      </div>
      <div class="sh-body">

        <div class="tipo-toggle" style="margin-bottom:20px">
          <button class="tipo-btn" :class="{ sel: form.tipo==='uscita' }" @click="form.tipo='uscita'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:14px;height:14px"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
            {{ t('sheet.expense') }}
          </button>
          <button class="tipo-btn tipo-btn-in" :class="{ sel: form.tipo==='entrata' }" @click="form.tipo='entrata'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:14px;height:14px"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
            {{ t('sheet.income') }}
          </button>
        </div>

        <div class="field" style="margin-bottom:16px">
          <label>{{ t('sheet.amount') }}</label>
          <div class="amount-wrap">
            <span class="amount-sym">€</span>
            <input class="amount-input" type="number" min="0" step="0.01" placeholder="0,00" v-model.number="form.importo" />
          </div>
        </div>

        <div class="field" style="margin-bottom:16px" v-if="form.tipo==='uscita'">
          <label>{{ t('sheet.category') }}</label>
          <select v-model="form.categoria">
            <option v-for="c in allCatNames" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <div class="field" style="margin-bottom:16px">
          <label>{{ t('sheet.method') }}</label>
          <select v-model="form.metodoPagamento">
            <option v-for="m in allMetodiOptions" :key="m" :value="m">{{ m }}</option>
          </select>
        </div>

        <div class="field" style="margin-bottom:16px">
          <label>{{ t('sheet.description') }}</label>
          <input type="text" v-model="form.descrizione" :placeholder="form.ricorrenza ? t('sheet.descPlaceholderRecurring') : form.tipo==='entrata' ? t('sheet.descPlaceholderIncome') : t('sheet.descPlaceholderExpense')" />
        </div>

        <div class="field" style="margin-bottom:16px">
          <label>{{ t('sheet.recurrence') }}</label>
          <select v-model="form.ricorrenza">
            <option value="">{{ t('sheet.oneOff') }}</option>
            <option v-for="tp in TIPI_RICORRENZA" :key="tp" :value="tp">{{ tp }}</option>
          </select>
        </div>

        <div class="field" style="margin-bottom:16px" v-if="!form.ricorrenza">
          <label>{{ t('sheet.date') }}</label>
          <input type="date" v-model="form.data" />
        </div>

        <div class="field" style="margin-bottom:16px" v-if="form.ricorrenza">
          <label>{{ t('sheet.dayOfMonth') }}</label>
          <input type="number" min="1" max="28" v-model.number="form.giornoMese" :placeholder="t('sheet.dayPlaceholder')" />
        </div>

        <div class="field" style="margin-bottom:16px">
          <label>{{ t('sheet.notes') }}</label>
          <input type="text" v-model="form.note" :placeholder="t('sheet.notesPlaceholder')" />
        </div>

        <div v-if="form.ricorrenza" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;padding:12px 0;border-top:1px solid var(--bdr)">
          <span style="font-size:14px;font-weight:500">{{ t('sheet.active') }}</span>
          <button @click="form.attivo=!form.attivo" class="toggle-btn" :class="{ on: form.attivo }">
            <span class="toggle-knob"></span>
          </button>
        </div>

        <div style="display:flex;flex-direction:column;gap:8px;margin-top:20px">
          <button class="btn-primary" @click="save" :disabled="!canSave"
            :style="form.tipo==='entrata' ? 'background:var(--green)' : ''">
            {{ editId ? t('sheet.update') : form.ricorrenza ? (form.tipo==='entrata' ? t('sheet.addRecurringIncome') : t('sheet.addRecurringExpense')) : (form.tipo==='entrata' ? t('sheet.addIncome') : t('sheet.addExpense')) }}
          </button>
          <button v-if="editId" class="btn-danger" @click="del">{{ editIsRic ? t('sheet.deleteRecurring') : t('sheet.deleteTransaction') }}</button>
        </div>
      </div>
    </div>

    <!-- ══ EXPORT MODAL ══ -->
    <div class="sh-overlay" :class="{ open: exportOpen }" @click="exportOpen=false"></div>
    <div class="sheet" :class="{ open: exportOpen }">
      <div class="sh-handle"></div>
      <div class="sh-head">
        <div class="sh-title">{{ t('export.title') }}</div>
      </div>
      <div class="sh-body">
        <div class="field" style="margin-bottom:14px">
          <label>{{ t('export.period') }}</label>
          <select v-model="exportPeriodo">
            <option value="mese">{{ t('export.currentMonth') }}</option>
            <option value="intervallo">{{ t('export.dateRange') }}</option>
            <option value="anno">{{ t('export.year') }}</option>
            <option value="tutto">{{ t('export.all') }}</option>
          </select>
        </div>
        <div v-if="exportPeriodo==='intervallo'" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
          <div class="field">
            <label>{{ t('export.from') }}</label>
            <input type="date" v-model="exportDa" />
          </div>
          <div class="field">
            <label>{{ t('export.to') }}</label>
            <input type="date" v-model="exportA" />
          </div>
        </div>
        <div v-if="exportPeriodo==='anno'" class="field" style="margin-bottom:14px">
          <label>{{ t('export.yearLabel') }}</label>
          <input type="number" v-model="exportAnno" min="2020" :max="String(new Date().getFullYear())" />
        </div>
        <div style="margin-top:20px">
          <button class="btn-primary" @click="doExport">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px;margin-right:6px"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            {{ t('export.button') }}
          </button>
        </div>
      </div>
    </div>

    <!-- ══ EDIT PROFILE SHEET ══ -->
    <div class="sh-overlay" :class="{ open: editProfileOpen }" @click="editProfileOpen=false"></div>
    <div class="sheet" :class="{ open: editProfileOpen }">
      <div class="sh-handle"></div>
      <div class="sh-head"><div class="sh-title">{{ t('profile.title') }}</div></div>
      <div class="sh-body">
        <!-- Anteprima -->
        <div style="display:flex;justify-content:center;margin-bottom:16px">
          <div class="nf-circle" style="width:72px;height:72px;font-size:28px;border-radius:10px"
            :style="!editAvatar ? { background: editColore } : {}">
            <img v-if="editAvatar" :src="editAvatar" alt="avatar" />
            <span v-else>{{ editNome.trim().charAt(0).toUpperCase() || '?' }}</span>
          </div>
        </div>
        <!-- Avatar grid -->
        <div class="av-label">{{ t('profile.avatar') }}</div>
        <div class="av-grid" style="margin-bottom:12px">
          <button class="av-opt" :class="{ sel: !editAvatar }" @click="editAvatar=''">
            <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:500;color:#fff;border-radius:6px" :style="{ background: editColore }">
              {{ editNome.trim().charAt(0).toUpperCase() || '?' }}
            </div>
          </button>
          <button v-for="av in avatarList" :key="av.id" class="av-opt" :class="{ sel: editAvatar===av.url }" @click="editAvatar=av.url">
            <img :src="av.url" :alt="av.id" />
          </button>
        </div>
        <!-- Colore (solo senza avatar) -->
        <div v-if="!editAvatar" style="margin-bottom:16px">
          <div class="av-label">{{ t('profile.colorLabel') }}</div>
          <div class="color-picker">
            <button v-for="c in PROFILE_COLORS" :key="c" class="color-dot" :class="{ sel: editColore===c }" :style="{ background: c }" @click="editColore=c"></button>
          </div>
        </div>
        <div class="field" style="margin-bottom:12px">
          <label>{{ t('profile.nameLabel') }}</label>
          <input type="text" v-model="editNome" :placeholder="t('profile.namePlaceholder')" />
        </div>
        <div class="field" style="margin-bottom:20px">
          <label>{{ t('profile.passwordLabel') }} <span style="color:var(--ink3);font-weight:400">{{ t('profile.passwordHint') }}</span></label>
          <input type="password" v-model="editPassword" :placeholder="t('profile.passwordPlaceholder')" />
        </div>
        <button class="btn-primary" @click="saveProfileEdit" :disabled="!editNome.trim()">{{ t('profile.save') }}</button>
      </div>
    </div>

    <!-- ══ SWITCH PROFILE PASSWORD ══ -->
    <div class="quit-overlay" :class="{ open: switchModalOpen }">
      <div class="quit-modal">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
          <div class="nf-circle" style="width:40px;height:40px;font-size:16px;border-radius:6px;flex-shrink:0"
            :style="!switchTarget?.avatar ? { background: switchTarget?.colore } : {}">
            <img v-if="switchTarget?.avatar" :src="switchTarget.avatar" :alt="switchTarget?.nome" />
            <span v-else>{{ switchTarget?.nome?.charAt(0).toUpperCase() }}</span>
          </div>
          <div style="font-size:15px;font-weight:500">{{ switchTarget?.nome }}</div>
        </div>
        <div class="field" style="margin-bottom:10px">
          <label>Password</label>
          <input type="password" v-model="switchPassword" @keyup.enter="confirmSwitch" autofocus />
        </div>
        <div v-if="switchError" class="login-error" style="margin-bottom:8px">{{ switchError }}</div>
        <div class="quit-actions">
          <button class="btn-cancel" @click="switchModalOpen=false; switchPassword=''; switchError=''">{{ t('switch.cancel') }}</button>
          <button class="btn-primary" @click="confirmSwitch">{{ t('switch.enter') }}</button>
        </div>
      </div>
    </div>

    <!-- ══ QUIT CONFIRM ══ -->
    <div class="quit-overlay" :class="{ open: quitOpen }">
      <div class="quit-modal">
        <h2>{{ t('quit.title') }}</h2>
        <p>{{ t('quit.body') }}</p>
        <div class="quit-actions">
          <button class="btn-cancel" @click="quitOpen=false">{{ t('quit.cancel') }}</button>
          <button class="btn-primary" @click="confirmQuit" style="background:var(--red)">{{ t('quit.confirm') }}</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div class="toast" :class="{ show: !!toastTxt }">{{ toastTxt }}</div>

  </div><!-- /app-layout -->
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch, nextTick } from 'vue'
import { translations } from './i18n.js'

// ── i18n ──
const lang = ref(localStorage.getItem('lang') || 'it')
function t(key, params = {}) {
  const dict = translations[lang.value] || translations.it
  let str = dict[key] ?? key
  for (const [k, v] of Object.entries(params)) str = str.replace(`{${k}}`, v)
  return str
}
function setLang(l) { lang.value = l; localStorage.setItem('lang', l) }

// ── SVG Icons (inline v-html, evita problemi con Options API in script setup) ──
const ICON_SVG = {
  utensils: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>`,
  car:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H3v-5l2-5h14l2 5v5h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/></svg>`,
  home:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12L12 3l9 9M5 10v11h14V10M9 21V12h6v9"/></svg>`,
  heart:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
  film:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>`,
  bag:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>`,
  dumbbell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5h11M6.5 17.5h11M2 8.5V6a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1v-2.5M22 8.5V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v12a1 1 0 001 1h2a1 1 0 001-1v-2.5"/></svg>`,
  box:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
}
function catIconSvg(nomeCat) {
  const icon = CATS.find(c=>c.nome===nomeCat)?.icon || 'box'
  return ICON_SVG[icon] || ICON_SVG.box
}
const METHOD_ICONS = {
  'Contanti':      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/></svg>`,
  'Carta Debito':  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/><line x1="5" y1="15" x2="9" y2="15"/></svg>`,
  'Carta Credito': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/><line x1="5" y1="15" x2="9" y2="15"/><line x1="12" y1="15" x2="17" y2="15"/></svg>`,
  'Bonifico':      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/><line x1="5" y1="5" x2="19" y2="5"/></svg>`,
  'PayPal':        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><path d="M7 11c3.5 0 6-1.5 6-5S13.5 2 10 2H5L3 17h3l.5-3H7z"/><path d="M14 17c3.5 0 6-1.5 6-5s-.5-4-4-4h-3l-1.5 9H15z" opacity=".5"/></svg>`,
  'Altro':         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
}
const METHOD_ICON_DEFAULT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`
function methodIconSvg(nome) { return METHOD_ICONS[nome] || METHOD_ICON_DEFAULT }

// ── Costanti ──
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
const METODI          = ['Contanti', 'Carta Debito', 'Carta Credito', 'Bonifico', 'PayPal', 'Altro']
const TIPI_RICORRENZA = ['Abbonamento', 'Rata', 'Affitto', 'Utenza', 'Stipendio', 'Accredito', 'Altro']
const PALETTE = ['#2362e8','#15803d','#b45309','#d92b2b','#7c3aed','#0e7490','#be185d','#65a30d']
const MESI    = computed(() => translations[lang.value]?.months || translations.it.months)
const MESI_SHORT = computed(() => translations[lang.value]?.monthsShort || translations.it.monthsShort)

function catIcon(nome) { return CATS.find(c=>c.nome===nome)?.icon || 'box' } // usata solo per filtri

// ── Auth ──
const SESSION_KEY = 'expenseflow_session'
const PROFILE_COLORS = ['#2362e8','#15803d','#d92b2b','#7c3aed','#0e7490','#be185d','#b45309','#d97706']
const currentProfile  = ref(null)
const loginStep       = ref('select')
const loginProfiles   = ref([])
const selectedLogin   = ref(null)
const loginPassword   = ref('')
const rememberMe      = ref(true)
const loginError      = ref('')
const newProfileNome     = ref('')
const newProfilePassword = ref('')
const newProfileColore   = ref('#2362e8')
const newProfileAvatar   = ref('')
const avatarList         = ref([])

function checkSession() {
  const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY)
  if (!raw) return false
  try { currentProfile.value = JSON.parse(raw); return true } catch { return false }
}
function saveSession(profile, remember) {
  const s = JSON.stringify(profile)
  if (remember) { localStorage.setItem(SESSION_KEY, s); sessionStorage.removeItem(SESSION_KEY) }
  else          { sessionStorage.setItem(SESSION_KEY, s); localStorage.removeItem(SESSION_KEY) }
}
function logout() {
  localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_KEY)
  currentProfile.value = null; loginStep.value = 'select'
  loginPassword.value = ''; loginError.value = ''
  spese.value = []; ricorrenti.value = []; customMetodi.value = []; extraCats.value = []
}
async function loadProfili() {
  try { loginProfiles.value = await (await fetch('/api/profili')).json() } catch(e) { console.warn(e) }
  try { avatarList.value = await (await fetch('/avatars.json')).json() } catch(e) { console.warn('avatars:', e) }
}
function selectProfile(profile) {
  selectedLogin.value = profile; loginError.value = ''; loginPassword.value = ''
  if (!profile.hasPassword) { doLogin(); return }
  loginStep.value = 'password'
}
async function doLogin() {
  const profile = selectedLogin.value; if (!profile) return
  try {
    const r = await fetch('/api/profili/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: profile.id, password: loginPassword.value }) })
    if (!r.ok) { loginError.value = (await r.json()).error || 'Errore'; return }
    const p = await r.json()
    currentProfile.value = p; saveSession(p, rememberMe.value)
    loginPassword.value = ''; loginError.value = ''
    await loadAppData()
  } catch(e) { loginError.value = 'Errore di connessione' }
}
async function doCreateProfile() {
  const nome = newProfileNome.value.trim(); if (!nome) return
  try {
    const r = await fetch('/api/profili', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ nome, password: newProfilePassword.value, colore: newProfileColore.value, avatar: newProfileAvatar.value }) })
    if (!r.ok) { loginError.value = (await r.json()).error || 'Errore'; return }
    const p = await r.json()
    loginProfiles.value.push(p)
    currentProfile.value = p; saveSession(p, rememberMe.value)
    newProfileNome.value = ''; newProfilePassword.value = ''; newProfileAvatar.value = ''; loginError.value = ''
    await loadAppData()
  } catch(e) { loginError.value = 'Errore: ' + e.message }
}
async function loadAppData() {
  await Promise.all([load(), loadRicorrenti(), loadMetodiCustom(), loadCategorie(), loadProfili()])
  await nextTick()
  if (page.value === 'home') renderDonut()
}

// ── Edit profile ──
const editProfileOpen = ref(false)
const editNome     = ref('')
const editAvatar   = ref('')
const editColore   = ref('#2362e8')
const editPassword = ref('')
function openEditProfile() {
  editNome.value     = currentProfile.value?.nome || ''
  editAvatar.value   = currentProfile.value?.avatar || ''
  editColore.value   = currentProfile.value?.colore || '#2362e8'
  editPassword.value = ''
  editProfileOpen.value = true
}
async function saveProfileEdit() {
  if (!editNome.value.trim()) return
  try {
    const body = { nome: editNome.value.trim(), colore: editColore.value, avatar: editAvatar.value }
    if (editPassword.value) body.password = editPassword.value
    const r = await fetch(`/api/profili/${currentProfile.value.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
    if (!r.ok) throw new Error()
    const updated = await r.json()
    currentProfile.value = { ...currentProfile.value, ...updated }
    saveSession(currentProfile.value, !!localStorage.getItem(SESSION_KEY))
    const idx = loginProfiles.value.findIndex(p => p.id === updated.id)
    if (idx !== -1) loginProfiles.value[idx] = updated
    editProfileOpen.value = false
    toast('Profilo aggiornato ✓')
  } catch { toast('Errore salvataggio') }
}

// ── Switch profile ──
const switchModalOpen = ref(false)
const switchTarget    = ref(null)
const switchPassword  = ref('')
const switchError     = ref('')
function switchProfile(profile) {
  sideOpen.value = false
  if (!profile.hasPassword) { doSwitchProfile(profile); return }
  switchTarget.value = profile; switchPassword.value = ''; switchError.value = ''
  switchModalOpen.value = true
}
async function confirmSwitch() {
  try {
    const r = await fetch('/api/profili/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: switchTarget.value.id, password: switchPassword.value }) })
    if (!r.ok) { switchError.value = (await r.json()).error || 'Password errata'; return }
    switchModalOpen.value = false
    doSwitchProfile(await r.json())
  } catch { switchError.value = 'Errore di connessione' }
}
function doSwitchProfile(profile) {
  currentProfile.value = profile
  saveSession(profile, !!localStorage.getItem(SESSION_KEY))
  spese.value = []; ricorrenti.value = []; customMetodi.value = []; extraCats.value = []
  loadAppData()
  toast(`Profilo: ${profile.nome}`)
}
function apiUrl(url) {
  if (!currentProfile.value) return url
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}profilo=${encodeURIComponent(currentProfile.value.id)}`
}

// ── Tema ──
const isDark = ref(
  localStorage.getItem('theme') === 'dark' ||
  (!localStorage.getItem('theme') && matchMedia('(prefers-color-scheme:dark)').matches)
)
function applyTheme() {
  document.documentElement.dataset.theme = isDark.value ? 'dark' : 'light'
}
function toggleTheme() { isDark.value = !isDark.value; localStorage.setItem('theme', isDark.value ? 'dark' : 'light'); applyTheme() }

// ── State ──
const page      = ref('home')
const sideOpen       = ref(false)
const topbarScrolled = ref(false)
const sheetOpen = ref(false)
const editId    = ref(null)
const toastTxt  = ref('')
const quitOpen  = ref(false)
const spese     = ref([])
const newCat    = ref('')
const extraCats = ref([])
const donutRef  = ref(null)
const lineRef   = ref(null)
let donutChart = null
let lineChart  = null

// ── Ricorrenti state ──
const ricorrenti       = ref([])

const form  = reactive({ tipo:'uscita', descrizione:'', importo:'', categoria:'Cibo', metodoPagamento:'Contanti', data:today(), note:'', ricorrenza:'', giornoMese:1, attivo:true })
const editIsRic = ref(false)

function today() { return new Date().toISOString().split('T')[0] }
const now      = new Date()
const anno     = now.getFullYear()
const meseKey  = `${anno}-${String(now.getMonth()+1).padStart(2,'0')}`
const meseNome = computed(() => MESI.value[now.getMonth()])
const giorniMese = new Date(anno, now.getMonth()+1, 0).getDate()

// ── Computed mensili ──
const transazioniMese = computed(() => spese.value.filter(s=>s.data.startsWith(meseKey)))
const usciteMese      = computed(() => transazioniMese.value.filter(s=>s.tipo!=='entrata'))
const entrateMese     = computed(() => transazioniMese.value.filter(s=>s.tipo==='entrata'))
const totUscite       = computed(() => usciteMese.value.reduce((a,s)=>a+s.importo,0).toFixed(2))
const totEntrate      = computed(() => entrateMese.value.reduce((a,s)=>a+s.importo,0).toFixed(2))
const saldoMese       = computed(() => (parseFloat(totEntrate.value)-parseFloat(totUscite.value)).toFixed(2))

// ── Trend vs mese precedente ──
const prevMeseKey = (() => {
  const d = new Date(anno, now.getMonth()-1, 1)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
})()
const prevTotUscite   = computed(() => spese.value.filter(s=>s.data.startsWith(prevMeseKey)&&s.tipo!=='entrata').reduce((a,s)=>a+s.importo,0))
const prevTotEntrate  = computed(() => spese.value.filter(s=>s.data.startsWith(prevMeseKey)&&s.tipo==='entrata').reduce((a,s)=>a+s.importo,0))
const trendUscite     = computed(() => { const p=prevTotUscite.value, c=parseFloat(totUscite.value); return p>0 ? ((c-p)/p*100).toFixed(1) : null })
const trendEntrate    = computed(() => { const p=prevTotEntrate.value, c=parseFloat(totEntrate.value); return p>0 ? ((c-p)/p*100).toFixed(1) : null })
const ultimi          = computed(() => [...transazioniMese.value].sort((a,b)=>b.data.localeCompare(a.data)).slice(0,6))
const mediaGiorno     = computed(() => (parseFloat(totUscite.value)/giorniMese).toFixed(2))
const catTop          = computed(() => {
  const m={}; usciteMese.value.forEach(s=>{m[s.categoria]=(m[s.categoria]||0)+s.importo})
  const t=Object.entries(m).sort((a,b)=>b[1]-a[1])[0]
  return t?{nome:t[0],tot:t[1].toFixed(2)}:{}
})
const uscitaMax = computed(() => usciteMese.value.reduce((max,s)=>s.importo>(max.importo||0)?s:max,{}))

// ── 7 giorni (solo uscite) ──
const week = computed(() => {
  const L=['Do','Lu','Ma','Me','Gi','Ve','Sa'], days=[]
  for(let i=6;i>=0;i--){
    const d=new Date(); d.setDate(d.getDate()-i)
    const k=d.toISOString().split('T')[0]
    const tot=spese.value.filter(s=>s.data===k&&s.tipo!=='entrata').reduce((a,s)=>a+s.importo,0)
    days.push({lbl:L[d.getDay()],tot,isToday:i===0})
  }
  const max=Math.max(...days.map(d=>d.tot),1)
  const maxTot=Math.max(...days.map(d=>d.tot))
  return days.map(d=>({...d,pct:Math.max(Math.round((d.tot/max)*100),d.tot>0?5:2),isMax:d.tot===maxTot&&d.tot>0}))
})
const tot7g = computed(() => week.value.reduce((a,g)=>a+g.tot,0).toFixed(2))

// ── Per categoria (solo uscite mese) ──
const perCat = computed(() => {
  const m={}
  usciteMese.value.forEach(s=>{if(!m[s.categoria])m[s.categoria]={tot:0,n:0};m[s.categoria].tot+=s.importo;m[s.categoria].n++})
  const tot=parseFloat(totUscite.value)||1
  return Object.entries(m).sort((a,b)=>b[1].tot-a[1].tot).map(([nome,r])=>({nome,tot:r.tot,n:r.n,pct:(r.tot/tot)*100}))
})

// ── Trend (entrambi) ──
const trend = computed(() => {
  const m={}
  spese.value.forEach(s=>{
    const k=s.data.substring(0,7)
    if(!m[k]) m[k]={totU:0,totE:0,nU:0,nE:0}
    if(s.tipo==='entrata'){m[k].totE+=s.importo;m[k].nE++}
    else{m[k].totU+=s.importo;m[k].nU++}
  })
  const sorted=Object.entries(m).sort((a,b)=>a[0].localeCompare(b[0])).slice(-12)
  return sorted.map(([k,r])=>{const[,mn]=k.split('-');return{key:k,lbl:MESI_SHORT.value[parseInt(mn)-1]+' '+k.split('-')[0],totU:r.totU.toFixed(0),totE:r.totE.toFixed(0),nU:r.nU,nE:r.nE}})
})

// ── Filtri Stats ──
const statsMese = ref(meseKey)
const statsPerCat = computed(() => {
  const base = statsMese.value
    ? spese.value.filter(s=>s.data.startsWith(statsMese.value)&&s.tipo!=='entrata')
    : spese.value.filter(s=>s.tipo!=='entrata')
  const m={}; base.forEach(s=>{if(!m[s.categoria])m[s.categoria]={tot:0,n:0};m[s.categoria].tot+=s.importo;m[s.categoria].n++})
  const tot=Object.values(m).reduce((a,r)=>a+r.tot,0)||1
  return Object.entries(m).sort((a,b)=>b[1].tot-a[1].tot).map(([nome,r])=>({nome,tot:r.tot,n:r.n,pct:(r.tot/tot)*100}))
})

// ── Per metodo pagamento ──
const perMetodo = computed(() => {
  const base = statsMese.value
    ? spese.value.filter(s=>s.data.startsWith(statsMese.value)&&s.tipo!=='entrata')
    : spese.value.filter(s=>s.tipo!=='entrata')
  const m={}; base.forEach(s=>{const k=s.metodoPagamento||'Contanti';if(!m[k])m[k]={tot:0,n:0};m[k].tot+=s.importo;m[k].n++})
  const tot=Object.values(m).reduce((a,r)=>a+r.tot,0)||1
  return Object.entries(m).sort((a,b)=>b[1].tot-a[1].tot).map(([nome,r])=>({nome,tot:r.tot,n:r.n,pct:(r.tot/tot)*100}))
})

// ── Filtri Transazioni ──
const fromCat     = ref('')
const fMese       = ref('')
const fTipo       = ref('')
const fRicorrente = ref('')
const fCat        = ref('')
const fMetodo     = ref('')

function clickCat(nome) { fromCat.value = nome; fCat.value = nome; go('spese') }
const mesiList = computed(() => {
  const s=new Set(spese.value.map(s=>s.data.substring(0,7)))
  return [...s].sort().reverse().map(v=>{const[y,m]=v.split('-');return{v,l:MESI_SHORT.value[parseInt(m)-1]+' '+y}})
})
const catsUsed   = computed(() => [...new Set(spese.value.filter(s=>s.tipo!=='entrata').map(s=>s.categoria))])
const metodiUsed = computed(() => [...new Set(spese.value.map(s=>s.metodoPagamento||'Contanti'))])
const filtrate   = computed(() => {
  let l=[...spese.value]
  if(fMese.value)       l=l.filter(s=>s.data.startsWith(fMese.value))
  if(fTipo.value)       l=l.filter(s=>(s.tipo||'uscita')===fTipo.value)
  if(fRicorrente.value==='si') l=l.filter(s=>!!s.ricorrenteId)
  if(fRicorrente.value==='no') l=l.filter(s=>!s.ricorrenteId)
  if(fCat.value)        l=l.filter(s=>s.categoria===fCat.value)
  if(fMetodo.value)     l=l.filter(s=>(s.metodoPagamento||'Contanti')===fMetodo.value)
  return l.sort((a,b)=>b.data.localeCompare(a.data))
})
const totFiltrateUscite  = computed(() => filtrate.value.filter(s=>s.tipo!=='entrata').reduce((a,s)=>a+s.importo,0))
const totFiltrateEntrate = computed(() => filtrate.value.filter(s=>s.tipo==='entrata').reduce((a,s)=>a+s.importo,0))
const totFiltrate = computed(() => (totFiltrateEntrate.value - totFiltrateUscite.value).toFixed(2))

// ── Categorie page ──
const allCatNames = computed(() => [...new Set([...CATS.map(c=>c.nome),...extraCats.value])])
const allCats = computed(() => {
  return allCatNames.value.map(nome=>{
    const r=spese.value.filter(s=>s.categoria===nome&&s.tipo!=='entrata')
    return{nome,n:r.length,tot:r.reduce((a,s)=>a+s.importo,0)}
  })
})

// ── Metodi page ──
const customMetodi = ref([])
const newMetodo    = ref('')
const allMetodiDisplay = computed(() => {
  const allNames = [...METODI, ...customMetodi.value.filter(m=>!METODI.includes(m))]
  const used = {}
  spese.value.filter(s=>s.tipo!=='entrata').forEach(s=>{const k=s.metodoPagamento||'Contanti';if(!used[k])used[k]={tot:0,n:0};used[k].tot+=s.importo;used[k].n++})
  const tot = Object.values(used).reduce((a,r)=>a+r.tot,0)||1
  return allNames.map(nome=>({nome,tot:(used[nome]?.tot||0),n:(used[nome]?.n||0),pct:((used[nome]?.tot||0)/tot)*100}))
})
const allMetodiOptions = computed(() => [...METODI, ...customMetodi.value.filter(m=>!METODI.includes(m))])

// ── Ricorrenti computed ──
const ricorrentiAttive  = computed(() => ricorrenti.value.filter(r=>r.attivo))
const ricorrentiSospese = computed(() => ricorrenti.value.filter(r=>!r.attivo))
const totRicorrentiUsciteAnno  = computed(() => ricorrentiAttive.value.filter(r=>r.tipo!=='entrata').reduce((a,r)=>a+r.importo,0).toFixed(2))
const totRicorrentiEntrateAnno = computed(() => ricorrentiAttive.value.filter(r=>r.tipo==='entrata').reduce((a,r)=>a+r.importo,0).toFixed(2))
// ricorrenti inserite questo mese (tramite ricorrenteId)
const nRicorrentiMese    = computed(() => usciteMese.value.filter(s=>s.ricorrenteId).length)
const totRicorrentiMese  = computed(() => usciteMese.value.filter(s=>s.ricorrenteId).reduce((a,s)=>a+s.importo,0).toFixed(2))

// ── Navigation ──
function go(p) { page.value=p; sideOpen.value=false }


// ── Form ──
const canSave = computed(() => {
  if (!(form.importo > 0)) return false
  if (form.tipo !== 'entrata' && !form.categoria) return false
  if (form.ricorrenza) return form.descrizione.trim().length > 0 && form.giornoMese >= 1 && form.giornoMese <= 28
  return !!form.data
})
function openNew() {
  editId.value=null; editIsRic.value=false
  Object.assign(form,{tipo:'uscita',descrizione:'',importo:'',categoria:'Cibo',metodoPagamento:'Contanti',data:today(),note:'',ricorrenza:'',giornoMese:1,attivo:true})
  sheetOpen.value=true
}
function openEdit(s) {
  editId.value=s.id; editIsRic.value=false
  Object.assign(form,{tipo:s.tipo||'uscita',descrizione:s.descrizione,importo:s.importo,categoria:s.categoria||'Cibo',metodoPagamento:s.metodoPagamento||'Contanti',data:s.data,note:s.note||'',ricorrenza:'',giornoMese:1,attivo:true})
  sheetOpen.value=true
}
function closeSheet() { sheetOpen.value=false; editId.value=null; editIsRic.value=false }

// ── Ricorrenti form ──
function openNewRicorrente() {
  editId.value=null; editIsRic.value=false
  Object.assign(form,{tipo:'uscita',descrizione:'',importo:'',categoria:'Cibo',metodoPagamento:'Contanti',data:today(),note:'',ricorrenza:'Abbonamento',giornoMese:1,attivo:true})
  sheetOpen.value=true
}
function openEditRicorrente(r) {
  editId.value=r.id; editIsRic.value=true
  Object.assign(form,{tipo:r.tipo||'uscita',descrizione:r.nome,importo:r.importo,categoria:r.categoria||'Cibo',metodoPagamento:r.metodoPagamento||'Contanti',data:today(),note:r.note||'',ricorrenza:r.tipoRicorrenza||'Abbonamento',giornoMese:r.giornoMese||1,attivo:r.attivo!==false})
  sheetOpen.value=true
}

// ── API ──
async function apiGet(url) {
  const r = await fetch(apiUrl(url))
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  const ct = r.headers.get('content-type') || ''
  if (!ct.includes('application/json')) throw new Error('Risposta non JSON dal server')
  return r.json()
}
async function load() {
  try { spese.value = await apiGet('/api/spese') } catch(e){ console.warn('load:', e.message) }
}
async function loadRicorrenti() {
  try { ricorrenti.value = await apiGet('/api/ricorrenti') } catch(e){ console.warn('loadRicorrenti:', e.message) }
}
async function loadCategorie() {
  try {
    const cats = await apiGet('/api/categorie')
    extraCats.value = cats.filter(c => !CATS.map(cc => cc.nome).includes(c))
  } catch(e){ console.warn('loadCategorie:', e.message) }
}
async function save() {
  if(!canSave.value) return
  try {
    if(form.ricorrenza) {
      const body={tipo:form.tipo,nome:form.descrizione,importo:Number(form.importo),tipoRicorrenza:form.ricorrenza,categoria:form.tipo==='entrata'?'':form.categoria,metodoPagamento:form.metodoPagamento,giornoMese:Number(form.giornoMese),attivo:form.attivo,note:form.note}
      if(editIsRic.value&&editId.value) {
        const res=await fetch(apiUrl(`/api/ricorrenti/${editId.value}`),{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
        if(!res.ok) throw new Error(`HTTP ${res.status}`)
        const u=await res.json(); const i=ricorrenti.value.findIndex(r=>r.id===editId.value); ricorrenti.value[i]=u; toast('Ricorrente aggiornata ✓')
      } else {
        const res=await fetch(apiUrl('/api/ricorrenti'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
        if(!res.ok) throw new Error(`HTTP ${res.status}`)
        const n=await res.json(); ricorrenti.value.push(n); toast('Ricorrente aggiunta ✓')
      }
    } else {
      const body={tipo:form.tipo,descrizione:form.descrizione,importo:parseFloat(form.importo),categoria:form.tipo==='entrata'?'':form.categoria,metodoPagamento:form.metodoPagamento,data:form.data,note:form.note}
      if(editId.value&&!editIsRic.value) {
        const u=await fetch(apiUrl(`/api/spese/${editId.value}`),{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(r=>r.json())
        const i=spese.value.findIndex(s=>s.id===editId.value); spese.value[i]=u; toast('Aggiornata ✓')
      } else {
        const n=await fetch(apiUrl('/api/spese'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(r=>r.json())
        spese.value.push(n); toast(form.tipo==='entrata'?'Entrata aggiunta ✓':'Uscita aggiunta ✓')
      }
    }
    closeSheet()
  } catch(e){console.error(e); toast('Errore: '+e.message)}
}
async function del() {
  if(!editId.value||!confirm('Eliminare?')) return
  if(editIsRic.value) {
    await fetch(apiUrl(`/api/ricorrenti/${editId.value}`),{method:'DELETE'})
    ricorrenti.value=ricorrenti.value.filter(r=>r.id!==editId.value)
  } else {
    await fetch(apiUrl(`/api/spese/${editId.value}`),{method:'DELETE'})
    spese.value=spese.value.filter(s=>s.id!==editId.value)
  }
  closeSheet(); toast('Eliminata')
}
async function addCat() {
  if(!newCat.value.trim()) return
  extraCats.value.push(newCat.value.trim())
  await fetch(apiUrl('/api/categorie'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nome:newCat.value})})
  toast('Categoria aggiunta'); newCat.value=''
}
async function loadMetodiCustom() {
  try { customMetodi.value = await apiGet('/api/metodi-custom') } catch(e){ console.warn('loadMetodiCustom:', e.message) }
}
async function addMetodo() {
  const nome=newMetodo.value.trim(); if(!nome) return
  try {
    const res=await fetch(apiUrl('/api/metodi-custom'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nome})})
    const ct=res.headers.get('content-type')||''
    if(!ct.includes('application/json')) throw new Error('Server non aggiornato — riavvialo')
    customMetodi.value=await res.json(); newMetodo.value=''; toast('Metodo aggiunto')
  } catch(e){ toast('Errore: '+e.message) }
}
// ── Excel Export ──
const exportOpen    = ref(false)
const exportPeriodo = ref('mese')
const exportDa      = ref(meseKey + '-01')
const exportA       = ref(meseKey + '-' + String(giorniMese).padStart(2,'0'))
const exportAnno    = ref(String(anno))
async function loadXLSX() {
  if(window.XLSX) return
  await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s)})
}
async function doExport() {
  await loadXLSX()
  let data = [...spese.value]
  if(exportPeriodo.value==='mese')        data=data.filter(s=>s.data.startsWith(meseKey))
  else if(exportPeriodo.value==='intervallo') data=data.filter(s=>s.data>=exportDa.value&&s.data<=exportA.value)
  else if(exportPeriodo.value==='anno')   data=data.filter(s=>s.data.startsWith(exportAnno.value))
  data=data.sort((a,b)=>a.data.localeCompare(b.data))
  const rows=data.map(s=>({Data:s.data,Tipo:s.tipo||'uscita',Descrizione:s.descrizione,Categoria:s.categoria||'',Metodo:s.metodoPagamento||'Contanti',Importo:parseFloat(s.importo.toFixed(2)),Note:s.note||''}))
  const ws=XLSX.utils.json_to_sheet(rows)
  const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,'Transazioni')
  XLSX.writeFile(wb,'transazioni.xlsx')
  exportOpen.value=false; toast('Export completato')
}
async function openFolder() {
  await fetch('/api/apri-cartella',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({profilo:currentProfile.value?.id||'default'})})
  toast('Cartella aperta')
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
  const dark=isDark.value
  const gridColor=dark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)'
  const textColor=dark?'#48483f':'#a5a49c'
  if(lineChart) lineChart.destroy()
  lineChart=new Chart(lineRef.value,{
    type:'line',
    data:{
      labels:trend.value.map(m=>m.lbl),
      datasets:[
        {label:'Uscite',data:trend.value.map(m=>parseFloat(m.totU)),borderColor:'#d92b2b',backgroundColor:'rgba(217,43,43,0.06)',borderWidth:2,pointRadius:3,pointBackgroundColor:'#d92b2b',fill:true,tension:0.35},
        {label:'Entrate',data:trend.value.map(m=>parseFloat(m.totE)),borderColor:'#15803d',backgroundColor:'rgba(21,128,61,0.06)',borderWidth:2,pointRadius:3,pointBackgroundColor:'#15803d',fill:true,tension:0.35}
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:true,labels:{color:textColor,font:{size:10}}},tooltip:{callbacks:{label:ctx=>`${ctx.dataset.label}: €${ctx.raw.toFixed(0)}`}}},
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
  applyTheme()
  window.addEventListener('scroll', () => { topbarScrolled.value = window.scrollY > 20 }, { passive: true })
  // Carica sempre avatarList (usata anche nel picker impostazioni in futuro)
  try { avatarList.value = await (await fetch('/avatars.json')).json() } catch {}
  if (checkSession()) {
    await loadAppData()
  } else {
    await loadProfili()
    if (loginProfiles.value.length === 0) loginStep.value = 'create'
  }
})
</script>
