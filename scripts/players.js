// scripts/players_noexport.js
// Versão final criada para carregar jogadores + escudos da pasta /imgs
// - Preencha TEAM_LOGOS para mapear nomes exatamente -> arquivo (mais confiável)
// - Se não preencher, o script tentará variantes automáticas (normalize + extensões)
// - Fallback: /imgs/default.png

const DEFAULT_DATA_URL = 'players_data.json'; // JSON padrão (coloque na mesma pasta do site)
const LOGOS_FOLDER = '/imgs'; // <--- sua pasta de imagens (você pediu "imgs")

/*
  Se quiser máxima confiabilidade, preencha TEAM_LOGOS com as chaves EXACTAS
  que aparecem no seu JSON (por ex: "CÁGADOS" em maiúsculas). O valor é o
  nome do arquivo dentro de /imgs (ex: "cagados.png").

  Exemplo:
  const TEAM_LOGOS = {
    "CÁGADOS": "cagados.png",
    "OURICURI": "ouricuri.png",
    ...
  };
*/
const TEAM_LOGOS = {
  "CÁGADOS": "CAGADOS.png",
  "BOA VISTA": "BOA_VISTA.png",
  "OURICURI": "OURICURI.png",
  "LAGOA DA EMA": "LAGOA_DA_EMA.png",
  "JUVENTUDE": "JUVENTUDE.png",
  "SANTA RITA": "SANTA_RITA.png"
};

/* -----------------------
   QuerySelectors (assuma que existam estes IDs no HTML)
   ----------------------- */
const $ = s => document.querySelector(s);
const playersGrid = $("#playersGrid");
const noDataEl = $("#noData");
const searchInput = $("#searchInput");
const teamFilter = $("#teamFilter");
const posFilter = $("#posFilter");
const openSheet = $("#open-sheet");
const seasonSelect = $("#season");

let raw = []; // linhas brutas do JSON
let teamsMap = {}; // { teamName: [playerObj...] }
let allPlayers = []; // lista achatada
let cachedSeasonRows = {}; // cache season -> rows

/* -----------------------
   Helpers utilitários
   ----------------------- */
function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escapeAttr(s){ return String(s||'').replace(/"/g,'&quot;'); }

function stripAccents(str){
  if(!str || !str.normalize) return str;
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function normalizeForFilename(team){
  if(!team) return '';
  let t = team.toString().trim();
  // remove leading/trailing, remove punctuation except space/underscore/hyphen
  t = t.replace(/[^\w\s-À-ÿ]/g, '');
  t = stripAccents(t);
  t = t.replace(/\s+/g, '_'); // underscores by default
  return t.toLowerCase();
}

/* -----------------------
   Funções para tentar múltiplas imagens (fallback automático)
   ----------------------- */

/*
  makeCandidatesForTeam(team):
    Gera uma lista de URLs candidatas (em ordem) para o escudo do time.
    Primeiro usa mapeamento manual TEAM_LOGOS se existir.
    Caso contrário, gera variantes normalizadas.
*/
function makeCandidatesForTeam(team){
  const candidates = [];
  if(!team) return candidates;

  // 1) se há mapeamento manual (use diretamente)
  if(TEAM_LOGOS[team]){
    candidates.push(`${LOGOS_FOLDER}/${TEAM_LOGOS[team]}`);
  }

  // 2) variantes derivadas (mais chances)
  const raw = team.toString().trim();
  const variants = new Set();

  // originais e sem acento
  variants.add(raw);
  variants.add(stripAccents(raw));
  variants.add(raw.toLowerCase());
  variants.add(stripAccents(raw).toLowerCase());

  // underscores / hyphen / no-space
  variants.add(raw.replace(/\s+/g, '_'));
  variants.add(raw.replace(/\s+/g, '-'));
  variants.add(stripAccents(raw).replace(/\s+/g, '_').toLowerCase());
  variants.add(stripAccents(raw).replace(/\s+/g, '-').toLowerCase());

  // sanitized (remoção de chars especiais) e lower
  variants.add(raw.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').toLowerCase());
  variants.add(stripAccents(raw).replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').toLowerCase());

  // produce file candidates with common extensions
  const exts = ['png','webp','jpg','jpeg','svg'];
  for(const v of variants){
    if(!v) continue;
    for(const e of exts){
      candidates.push(`${LOGOS_FOLDER}/${encodeURIComponent(v)}.${e}`);
      candidates.push(`${LOGOS_FOLDER}/${v}.${e}`); // without encode
    }
  }

  // finally fallback defaults
  candidates.push(`${LOGOS_FOLDER}/default.png`);
  candidates.push(`${LOGOS_FOLDER}/default.jpg`);
  // dedupe keeping order
  return [...new Map(candidates.map(c => [c, c])).values()];
}

/*
  createLogoImg(team, {className='logo', size: number (optional)})
  - cria <img> que percorre candidatos até encontrar um que carregue
  - se nenhum carregar, esconde a imagem para não quebrar layout (ou mostra default)
*/
function createLogoImg(team, opts = {}){
  const size = opts.size || 60;
  const className = opts.className || 'logo';
  const candidates = makeCandidatesForTeam(team);
  let idx = 0;
  const img = document.createElement('img');
  img.className = className;
  img.alt = `${team} escudo`;
  img.loading = 'lazy';
  img.width = size;
  img.height = size;
  img.style.objectFit = 'contain';
  img.style.display = 'inline-block';
  img.style.verticalAlign = 'middle';

  if(candidates.length === 0){
    img.style.display = 'none';
    return img;
  }

  img.src = candidates[idx];

  img.onerror = function(){
    idx++;
    if(idx < candidates.length){
      // switch to next candidate
      // remove current onerror to avoid possible recursive issues, then reassign after src change
      this.onerror = null;
      const that = this;
      setTimeout(() => {
        that.onerror = function(){ img.onerror(); };
        that.src = candidates[idx];
      }, 0);
    } else {
      // nenhum candidato funcionou
      // preferimos esconder para evitar "imagem quebrada" no layout
      // se você preferir mostrar default, remova a linha abaixo e coloque src = '/imgs/default.png'
      this.style.display = 'none';
      console.warn('Logo não encontrada para time:', team);
    }
  };

  return img;
}

/* -----------------------
   Parser (reaproveitado / adaptado do seu original)
   ----------------------- */

function isHeaderRow(row){
  const v = (row['Unnamed: 1'] || '').toString().trim().toUpperCase();
  return v.includes('NOME') || v === 'NOME DO ATLETA' || v === 'NOME';
}

function isTeamRow(row){
  const v = (row['BID PRIMEIRA COPA RURAL QUIJINGUENSE'] || '').toString().trim();
  if(!v) return false;
  const up = v.toUpperCase();
  if(up.includes('LOCAL') || up.includes('GOLS') || up.includes('N°') || up.includes('Nº')) return false;
  // se o campo for não-numérico, consideramos nome de time
  return isNaN(Number(v));
}

function parseRows(rows){
  teamsMap = {};
  allPlayers = [];
  for(let i=0;i<rows.length;i++){
    const row = rows[i];
    if(isHeaderRow(row)){
      let team = 'Sem time';
      for(let j=i-1;j>=0;j--){
        if(isTeamRow(rows[j])){ team = rows[j]['BID PRIMEIRA COPA RURAL QUIJINGUENSE'].toString().trim(); break; }
      }
      let k = i+1;
      while(k < rows.length){
        const r = rows[k];
        if(isHeaderRow(r) || isTeamRow(r)) break;
        const name = (r['Unnamed: 1'] || '').toString().trim();
        if(name !== '' && name.toUpperCase() !== 'NOME' ){
          const player = {
            team: team,
            number: r['BID PRIMEIRA COPA RURAL QUIJINGUENSE'] || '',
            name: name || '',
            apelido: (r['Unnamed: 4'] || '').toString(),
            cpf: (r['Unnamed: 5'] || '').toString(),
            localidade: (r['Unnamed: 6'] || '').toString(),
            situacao: (r['Unnamed: 8'] || '').toString(),
            idade: (r['Unnamed: 10'] || '').toString(),
            gols: (r['Unnamed: 11'] || '').toString(),
            cartoes_a: (r['Unnamed: 12'] || '').toString(),
            cartoes_v: (r['Unnamed: 13'] || '').toString(),
            raw: r
          };
          if(!teamsMap[team]) teamsMap[team] = [];
          teamsMap[team].push(player);
          allPlayers.push(player);
          k++;
        } else {
          k++;
        }
      }
      i = k-1;
    }
  }
  // fallback caso o formato seja "linha por jogador" sem headers
  if(Object.keys(teamsMap).length === 0){
    rows.forEach(r => {
      const name = (r['Unnamed: 1'] || '').toString().trim();
      if(!name) return;
      const team = (r['BID PRIMEIRA COPA RURAL QUIJINGUENSE'] && isNaN(Number(r['BID PRIMEIRA COPA RURAL QUIJINGUENSE'])) ) ? r['BID PRIMEIRA COPA RURAL QUIJINGUENSE'] : (r['Unnamed: 6'] || 'Sem time');
      const player = {
        team: team.toString(),
        number: r['BID PRIMEIRA COPA RURAL QUIJINGUENSE'] || '',
        name,
        apelido: (r['Unnamed: 4'] || '').toString(),
        cpf: (r['Unnamed: 5'] || '').toString(),
        localidade: (r['Unnamed: 6'] || '').toString(),
        situacao: (r['Unnamed: 8'] || '').toString(),
        idade: (r['Unnamed: 10'] || '').toString(),
        gols: (r['Unnamed: 11'] || '').toString(),
        cartoes_a: (r['Unnamed: 12'] || '').toString(),
        cartoes_v: (r['Unnamed: 13'] || '').toString(),
        raw: r
      };
      if(!teamsMap[player.team]) teamsMap[player.team] = [];
      teamsMap[player.team].push(player);
      allPlayers.push(player);
    });
  }
}

/* -----------------------
   UI Builders (cards de times + tabelas)
   ----------------------- */

function buildTeamList(){
  const teams = Object.keys(teamsMap).sort((a,b)=> a.localeCompare(b,'pt'));
  if(teamFilter){
    teamFilter.innerHTML = `<option value="all">Todos os times</option>` + teams.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)} (${teamsMap[t].length})</option>`).join('');
  }
  renderTeams(teams);
}

function renderTeams(teams){
  if(!playersGrid) return;
  if(!teams || teams.length === 0){
    playersGrid.innerHTML = '';
    if(noDataEl) noDataEl.style.display = 'block';
    return;
  }
  if(noDataEl) noDataEl.style.display = 'none';

  const container = document.createElement('div');
  container.className = 'teams-container';

  teams.forEach(team => {
    const players = teamsMap[team];

    const section = document.createElement('section');
    section.className = 'team-card';

    const header = document.createElement('div');
    header.className = 'team-header';
    header.setAttribute('data-team', team);

    const logoWrap = document.createElement('div');
    logoWrap.className = 'team-logo-wrap';
    logoWrap.style.display = 'flex';
    logoWrap.style.alignItems = 'center';
    logoWrap.style.gap = '12px';

    const logoImg = createLogoImg(team, {size: 60, className: 'team-logo-img'});
    logoImg.style.width = '60px';
    logoImg.style.height = '60px';
    logoImg.style.borderRadius = '10px';
    logoWrap.appendChild(logoImg);

    const title = document.createElement('div');
    title.style.display = 'flex';
    title.style.alignItems = 'center';
    title.style.gap = '8px';
    title.innerHTML = `<h3 style="margin:0; font-size:16px;">${escapeHtml(team)}</h3> <div class="count-pill" style="margin-left:6px;">${players.length}</div>`;
    logoWrap.appendChild(title);

    header.appendChild(logoWrap);
    section.appendChild(header);

    // corpo (tabela)
    const body = document.createElement('div');
    body.className = 'team-body';
    body.style.display = 'none';
    body.style.padding = '12px';

    const tableWrap = document.createElement('div');
    tableWrap.style.overflow = 'auto';

    const table = document.createElement('table');
    table.className = 'players-table';
    table.style.width = '100%';
    table.innerHTML = `<thead><tr><th>Nº</th><th>Nome</th><th>Apelido</th><th>Idade</th><th>Localidade</th><th>Situação</th><th>Gols</th><th>Cartões</th></tr></thead>`;
    const tbody = document.createElement('tbody');

    players.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="width:70px">${escapeHtml(p.number)}</td>
        <td>${escapeHtml(p.name)}</td>
        <td>${escapeHtml(p.apelido)}</td>
        <td style="width:110px">${escapeHtml(p.idade)}</td>
        <td>${escapeHtml(p.localidade)}</td>
        <td>${escapeHtml(p.situacao)}</td>
        <td style="width:90px">${escapeHtml(p.gols)}</td>
        <td style="width:120px">${escapeHtml(p.cartoes_a)} ${p.cartoes_v?'/ '+escapeHtml(p.cartoes_v):''}</td>
      `;
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    tableWrap.appendChild(table);
    body.appendChild(tableWrap);
    section.appendChild(body);
    container.appendChild(section);
  });

  playersGrid.innerHTML = '';
  playersGrid.appendChild(container);

  // listeners para abrir/fechar
  document.querySelectorAll('.team-header').forEach(h => {
    h.onclick = () => {
      const body = h.nextElementSibling;
      const isOpen = body.style.display === 'block';
      document.querySelectorAll('.team-body').forEach(b=>b.style.display='none');
      if(!isOpen) body.style.display = 'block';
      else body.style.display = 'none';
      h.scrollIntoView({behavior:'smooth', block:'center'});
    };
  });
}

/* -----------------------
   Filtros
   ----------------------- */
function applyFilters(){
  const q = (searchInput && searchInput.value) ? searchInput.value.trim().toLowerCase() : '';
  const team = (teamFilter && teamFilter.value) ? teamFilter.value : 'all';
  let filtered = allPlayers.slice();
  if(team && team !== 'all') filtered = filtered.filter(p => p.team === team);
  if(q){
    filtered = filtered.filter(p => {
      return (p.name || '').toLowerCase().includes(q) ||
             (p.apelido || '').toLowerCase().includes(q) ||
             (p.localidade || '').toLowerCase().includes(q) ||
             (p.situacao || '').toLowerCase().includes(q) ||
             (p.number || '').toString().toLowerCase().includes(q);
    });
  }
  const map = {};
  filtered.forEach(p => {
    if(!map[p.team]) map[p.team] = [];
    map[p.team].push(p);
  });
  const teams = Object.keys(map).sort((a,b)=> a.localeCompare(b,'pt'));
  if(teams.length === 0){
    if(playersGrid) playersGrid.innerHTML='';
    if(noDataEl) noDataEl.style.display='block';
    return;
  }
  if(noDataEl) noDataEl.style.display='none';

  // renderiza somente os times filtrados (reaproveita lógica)
  const container = document.createElement('div');
  container.className = 'teams-container';

  teams.forEach(team => {
    const players = map[team];
    const section = document.createElement('section');
    section.className = 'team-card';

    const header = document.createElement('div');
    header.className = 'team-header';
    header.setAttribute('data-team', team);

    const logoWrap = document.createElement('div');
    logoWrap.className = 'team-logo-wrap';
    logoWrap.style.display = 'flex';
    logoWrap.style.alignItems = 'center';
    logoWrap.style.gap = '12px';

    const logoImg = createLogoImg(team, {size:56});
    logoImg.style.width = '56px';
    logoImg.style.height = '56px';
    logoWrap.appendChild(logoImg);

    const title = document.createElement('div');
    title.style.display = 'flex';
    title.style.alignItems = 'center';
    title.style.gap = '8px';
    title.innerHTML = `<h3 style="margin:0; font-size:15px;">${escapeHtml(team)}</h3> <div class="count-pill" style="margin-left:6px;">${players.length}</div>`;
    logoWrap.appendChild(title);

    header.appendChild(logoWrap);
    section.appendChild(header);

    const body = document.createElement('div');
    body.className = 'team-body';
    body.style.display = 'block';
    body.style.padding = '12px';

    const tableWrap = document.createElement('div');
    tableWrap.style.overflow = 'auto';

    const table = document.createElement('table');
    table.className = 'players-table';
    table.style.width = '100%';
    table.innerHTML = `<thead><tr><th>Nº</th><th>Nome</th><th>Apelido</th><th>Idade</th><th>Localidade</th><th>Situação</th><th>Gols</th><th>Cartões</th></tr></thead>`;
    const tbody = document.createElement('tbody');

    players.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="width:70px">${escapeHtml(p.number)}</td>
        <td>${escapeHtml(p.name)}</td>
        <td>${escapeHtml(p.apelido)}</td>
        <td style="width:110px">${escapeHtml(p.idade)}</td>
        <td>${escapeHtml(p.localidade)}</td>
        <td>${escapeHtml(p.situacao)}</td>
        <td style="width:90px">${escapeHtml(p.gols)}</td>
        <td style="width:120px">${escapeHtml(p.cartoes_a)} ${p.cartoes_v?'/ '+escapeHtml(p.cartoes_v):''}</td>
      `;
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    tableWrap.appendChild(table);
    body.appendChild(tableWrap);
    section.appendChild(body);
    container.appendChild(section);
  });

  playersGrid.innerHTML = '';
  playersGrid.appendChild(container);

  document.querySelectorAll('.team-header').forEach(h => {
    h.onclick = () => {
      const body = h.nextElementSibling;
      const isOpen = body.style.display === 'block';
      document.querySelectorAll('.team-body').forEach(b=>b.style.display='none');
      if(!isOpen) body.style.display = 'block';
      h.scrollIntoView({behavior:'smooth', block:'center'});
    };
  });
}

/* -----------------------
   Carregamento de temporadas (fetch + cache)
   ----------------------- */

const SEASON_SOURCES = {
  "2026": {
    json: "players_2026.json",
    sheet: ""
  },
  "2025": {
    json: "players_data.json",
    sheet: ""
  }
};

function getSourceForSeason(season){
  if(!season) return null;
  return SEASON_SOURCES[season] || null;
}

async function loadSeasonRows(season){
  if(cachedSeasonRows[season]) return cachedSeasonRows[season];
  const src = getSourceForSeason(season);
  const url = src && src.json ? src.json : DEFAULT_DATA_URL;
  try{
    const res = await fetch(url);
    if(!res.ok) throw new Error('Falha ao carregar JSON: ' + url);
    const rows = await res.json();
    cachedSeasonRows[season] = rows;
    return rows;
  }catch(err){
    console.error(err);
    return [];
  }
}

async function updateForSeason(season){
  const src = getSourceForSeason(season);
  if(src && src.sheet && openSheet) openSheet.href = src.sheet;
  else if(openSheet) openSheet.href = '#';

  const rows = await loadSeasonRows(season);
  raw = rows.slice();
  parseRows(raw);
  buildTeamList();
  // reset filters
  if(searchInput) searchInput.value = '';
  if(teamFilter) teamFilter.value = 'all';
  applyFilters();
}

/* -----------------------
   Inicialização
   ----------------------- */

async function init(){
  try{
    if(seasonSelect){
      const seasons = Object.keys(SEASON_SOURCES);
      if(seasons.length){
        seasonSelect.innerHTML = seasons.map(s => `<option value="${s}">${s}</option>`).join('');
      }
      seasonSelect.addEventListener('change', (e)=> updateForSeason(e.target.value));
    }

    const initialSeason = (seasonSelect && seasonSelect.value) ? seasonSelect.value : (Object.keys(SEASON_SOURCES)[0] || '2025');
    await updateForSeason(initialSeason);
  }catch(err){
    console.error(err);
    if(playersGrid) playersGrid.innerHTML = `<div style="padding:18px;color:var(--muted)">Erro ao iniciar o módulo de jogadores.</div>`;
  }
}

/* -----------------------
   Listeners
   ----------------------- */
if(searchInput) searchInput.addEventListener('input', ()=> applyFilters());
if(teamFilter) teamFilter.addEventListener('change', ()=> applyFilters());
if(posFilter) posFilter.addEventListener('change', ()=> applyFilters());

document.addEventListener('DOMContentLoaded', ()=> init());

/* -----------------------
   FIM DO ARQUIVO
   ----------------------- */
