// scripts/players_noexport.js
// suporta fontes separadas por temporada (JSON + link da planilha)

const DEFAULT_DATA_URL = 'players_data.json'; // fallback se temporada não tiver fonte
// mapeie aqui as temporadas para seus JSONs e (opcional) URLs das planilhas
const SEASON_SOURCES = {
  "2026": {
    json: "players_2026.json", // coloque esse arquivo no mesmo diretório
    sheet: "https://docs.google.com/spreadsheets/d/ID_DA_PLANILHA_2026/htmlview"
  },
  "2025": {
    json: "players_data.json",
    sheet: "https://docs.google.com/spreadsheets/d/1AGNqeY21fvCs26rZq-J6jjYVwcB_skh5v8XHeKoBsLY/htmlview?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAb21jcAPvodtleHRuA2FlbQIxMQBzcnRjBmFwcF9pZA81NjcwNjczNDMzNTI0MjcAAafBDxnX-LFuZr0Z_PzBqSj_g6ot9kMpn3wPgJQGJuGODqSI-OSbSNzqwv3z4Q_aem_NSfG8ny_YpzE15RqKsa73g"
  }
  // adicione mais temporadas aqui
};

const $ = s => document.querySelector(s);
const playersGrid = $("#playersGrid");
const noDataEl = $("#noData");
const searchInput = $("#searchInput");
const teamFilter = $("#teamFilter");
const posFilter = $("#posFilter");
const openSheet = $("#open-sheet");
const seasonSelect = $("#season");

let raw = []; // raw rows from JSON (todas as linhas da temporada atual)
let teamsMap = {}; // { teamName: [playerObj, ...] }
let allPlayers = []; // flattened list
let cachedSeasonRows = {}; // cache: season -> rows

/* -----------------------
   Helpers para temporada
   ----------------------- */

function getSourceForSeason(season){
  if(!season) return null;
  return SEASON_SOURCES[season] || null;
}

/* -----------------------
   (SEU PARSER / LÓGICA EXISTENTE)
   ----------------------- */

function isHeaderRow(row){
  const v = (row['Unnamed: 1'] || '').toString().trim().toUpperCase();
  return v.includes('NOME');
}

function isTeamRow(row){
  const v = (row['BID PRIMEIRA COPA RURAL QUIJINGUENSE'] || '').toString().trim();
  if(!v) return false;
  const up = v.toUpperCase();
  if(up.includes('LOCAL') || up.includes('GOLS') || up.includes('N°')) return false;
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
   UI builders (seu código)
   ----------------------- */

function buildTeamList(){
  const teams = Object.keys(teamsMap).sort((a,b)=> a.localeCompare(b,'pt'));
  teamFilter.innerHTML = `<option value="all">Todos os times</option>` + teams.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)} (${teamsMap[t].length})</option>`).join('');
  renderTeams(teams);
}

function renderTeams(teams){
  if(!teams || teams.length === 0){
    playersGrid.innerHTML = '';
    noDataEl.style.display = 'block';
    return;
  }
  noDataEl.style.display = 'none';
  const html = teams.map(team => {
    const players = teamsMap[team];
    const rows = players.map(p => `
      <tr>
        <td style="width:70px">${escapeHtml(p.number)}</td>
        <td>${escapeHtml(p.name)}</td>
        <td>${escapeHtml(p.apelido)}</td>
        <td style="width:110px">${escapeHtml(p.idade)}</td>
        <td>${escapeHtml(p.localidade)}</td>
        <td>${escapeHtml(p.situacao)}</td>
        <td style="width:90px">${escapeHtml(p.gols)}</td>
        <td style="width:120px">${escapeHtml(p.cartoes_a)} ${p.cartoes_v?'/ '+escapeHtml(p.cartoes_v):''}</td>
      </tr>`).join('');
    return `
      <section class="team-card">
        <div class="team-header" data-team="${escapeAttr(team)}">
          <h3>${escapeHtml(team)}</h3>
          <div class="count-pill">${players.length}</div>
        </div>
        <div class="team-body">
          <div style="overflow:auto">
            <table class="players-table">
              <thead><tr><th>Nº</th><th>Nome</th><th>Apelido</th><th>Idade</th><th>Localidade</th><th>Situação</th><th>Gols</th><th>Cartões</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>
      </section>`;
  }).join('');
  playersGrid.innerHTML = html;
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

function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escapeAttr(s){ return String(s||'').replace(/"/g,'&quot;'); }

/* -----------------------
   Filter (seu código)
   ----------------------- */

function applyFilters(){
  const q = (searchInput.value || '').trim().toLowerCase();
  const team = teamFilter.value;
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
  if(teams.length === 0){ playersGrid.innerHTML=''; noDataEl.style.display='block'; return;}
  noDataEl.style.display='none';
  const html = teams.map(team => {
    const players = map[team];
    const rows = players.map(p => `
      <tr>
        <td style="width:70px">${escapeHtml(p.number)}</td>
        <td>${escapeHtml(p.name)}</td>
        <td>${escapeHtml(p.apelido)}</td>
        <td style="width:110px">${escapeHtml(p.idade)}</td>
        <td>${escapeHtml(p.localidade)}</td>
        <td>${escapeHtml(p.situacao)}</td>
        <td style="width:90px">${escapeHtml(p.gols)}</td>
        <td style="width:120px">${escapeHtml(p.cartoes_a)} ${p.cartoes_v?'/ '+escapeHtml(p.cartoes_v):''}</td>
      </tr>`).join('');
    return `
      <section class="team-card">
        <div class="team-header" data-team="${escapeAttr(team)}">
          <h3>${escapeHtml(team)}</h3>
          <div class="count-pill">${players.length}</div>
        </div>
        <div class="team-body" style="display:block">
          <div style="overflow:auto">
            <table class="players-table">
              <thead><tr><th>Nº</th><th>Nome</th><th>Apelido</th><th>Idade</th><th>Localidade</th><th>Situação</th><th>Gols</th><th>Cartões</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>
      </section>`;
  }).join('');
  playersGrid.innerHTML = html;
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
   Carregamento por temporada (fetch dinâmico + cache)
   ----------------------- */

async function loadSeasonRows(season){
  // se já temos em cache, retorna
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
    // retornar array vazio para evitar quebrar página
    return [];
  }
}

async function updateForSeason(season){
  // atualizar link da planilha (se existir no mapa)
  const src = getSourceForSeason(season);
  if(src && src.sheet && openSheet) openSheet.href = src.sheet;
  else if(openSheet) openSheet.href = '#';

  // carregar rows para a temporada (com cache)
  const rows = await loadSeasonRows(season);
  raw = rows.slice(); // set raw para a temporada atual
  parseRows(raw);
  buildTeamList();
  // reset filtros visuais ao trocar temporada (opcional)
  searchInput.value = '';
  teamFilter.value = 'all';
  applyFilters();
}

/* -----------------------
   Inicialização
   ----------------------- */

async function init(){
  try{
    // popular seasonSelect com as chaves de SEASON_SOURCES, respeitando a ordem
    if(seasonSelect){
      const seasons = Object.keys(SEASON_SOURCES);
      if(seasons.length){
        seasonSelect.innerHTML = seasons.map(s => `<option value="${s}">${s}</option>`).join('');
      }
    }

    // temporada inicial (select ou primeira do mapa ou 'all')
    const initialSeason = (seasonSelect && seasonSelect.value) ? seasonSelect.value : (Object.keys(SEASON_SOURCES)[0] || 'all');

    if(seasonSelect){
      seasonSelect.addEventListener('change', (e) => {
        updateForSeason(e.target.value);
      });
    }

    // carrega primeira temporada
    await updateForSeason(initialSeason);

  }catch(err){
    console.error(err);
    playersGrid.innerHTML = `<div style="padding:18px;color:var(--muted)">Erro ao iniciar o módulo de jogadores.</div>`;
  }
}

/* -----------------------
   Listeners
   ----------------------- */

searchInput.addEventListener('input', ()=> applyFilters());
teamFilter.addEventListener('change', ()=> applyFilters());
if(posFilter) posFilter.addEventListener('change', ()=> applyFilters());

document.addEventListener('DOMContentLoaded', ()=> init());
