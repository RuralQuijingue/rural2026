// players_noexport.js
// Versão corrigida e estável — substitua seu arquivo atual por este.
// Coloque a pasta "imgs" ao lado do HTML e inclua imgs/default.png como fallback.

// -----------------------
// Config
// -----------------------
const LOGOS_FOLDER = 'imgs'; // pasta relativa onde estão os escudos (sem barra inicial)
const DEFAULT_JSON_CANDIDATES = [
  'players_data.json',
  'players_data (1).json',
  'players_2025.json',
  'players_2026.json'
];

// -----------------------
// Mapeamento EXATO nome-do-time -> nome-do-arquivo (como estão na pasta)
// Ajuste se algum nome/arquivo estiver diferente
// -----------------------
const TEAM_LOGOS = {
  "ADESTRU": "ADESTRU.png",
  "ALGODÕES": "ALGODOESESCUDO.png",
  "ALTO": "ALTO.png",
  "ANACONDA": "ANACONDA.png",
  "BARAÚNAS": "BARAÚNAS.png",
  "BARRA": "BARRA.png",
  "BOA VISTA DO MEIO": "BOA VISTA DO MEIO.png",
  "BOA VISTA": "BOA VISTA.png",
  "CAPIM GROSSO": "CAPIM GROSSO.png",
  "Com1 (1)": "Com1 (1).jpeg",
  "Com1 (3)": "Com1 (3).jpeg",
  "Comissão1": "Comissão1.jpeg",
  "ESCUDO NG": "ESCUDO NG.png",
  "GARROTE": "GARROTE.png",
  "JUREMA": "JUREMA.png",
  "JUREMA.jpeg": "JUREMA.jpeg",
  "JUVENTUS FECHADO": "JUVENTUS FECHADO.png",
  "LAGOA DA EMA": "LAGOA DA EMA.png",
  "LAGOA DO CAPIM": "LAGOA DO CAPIM.png",
  "LAGOA DO OLIMPIO": "LAGOA DO OLIMPIO.png",
  "LAGOA DOS CAGADOS": "LAGOA DOS CAGADOS.png",
  "LAGOINHA DAS PEDRAS": "LAGOINHA DAS PEDRAS.png",
  "LOGORURAL": "LOGORURAL.png",
  "MACETE": "MACETE.png",
  "MONTE CRUZEIRO": "MONTE CRUZEIRO.png",
  "MURIÇOCA": "MURIÇOCA.png",
  "NOVO TRIUNFO": "NOVO TRIUNFO.png",
  "OURICURI": "OURICURI.png",
  "PASCOAL": "PASCOAL.png",
  "PAU DE RATO": "PAU DE RATO.png",
  "PINHEIRÃO": "PINHEIRÃO.png",
  "SERROTE DO MEIO": "SERROTE DO MEIO.png",
  "SITIO": "SITIO.png",
  "SOBARA": "SOBARA.png",
  "TABUA": "TABUA.png",
  "TATU": "TATU.png",
  "TERRA NOVA": "TERRA NOVA.png",
  "UNIÃO LUVENSE": "UNIÃO LUVENSE.png",
  "VILA MANANCIAL": "VILA MANANCIAL.png",
  "a": "a", // se "a" for um arquivo válido, ajuste; caso contrário remova
  "capoeira.jpeg": "capoeira.jpeg"
};

// -----------------------
// Utilitários
// -----------------------
function escapeHtml(s){
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function stripAccents(str){
  if(!str || !str.normalize) return str || '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function normalizeKey(key){
  return stripAccents(String(key||'')).trim().replace(/\s+/g, ' ').toUpperCase();
}

// mapa normalizado (chave normalizada -> arquivo)
const NORMALIZED_MAP = (function(){
  const m = {};
  Object.keys(TEAM_LOGOS).forEach(k => {
    m[ normalizeKey(k) ] = TEAM_LOGOS[k];
  });
  return m;
})();

// -----------------------
// DOM selectors (IDs esperados no HTML)
// -----------------------
const $ = s => document.querySelector(s);
const playersGrid = $("#playersGrid");
const noDataEl = $("#noData");
const searchInput = $("#searchInput");
const teamFilter = $("#teamFilter");

// -----------------------
// createLogoImg: tenta MAPA direto → normalized map → default.
// NÃO faz fallback recursivo nem tenta várias extensões (evita loops/stack overflow).
// -----------------------
function createLogoImg(team, opts = {}){
  const size = opts.size || 60;
  const img = document.createElement('img');
  img.width = size;
  img.height = size;
  img.loading = 'lazy';
  img.style.objectFit = 'contain';
  img.style.borderRadius = opts.rounded ? '8px' : '0';
  img.alt = `${team} escudo`;

  // se não houver time, retorna default
  if(!team){
    img.src = `${LOGOS_FOLDER}/default.png`;
    return img;
  }

  // 1) chave exata
  const direct = TEAM_LOGOS[team];
  if(direct){
    img.src = `${LOGOS_FOLDER}/${direct}`;
    // onerror único → troca para default (não recursivo)
    img.onerror = function(){
      console.warn(`Escudo não encontrado (arquivo mapeado faltando): ${direct} — usando default.png`);
      this.onerror = null;
      this.src = `${LOGOS_FOLDER}/default.png`;
    };
    return img;
  }

  // 2) chave normalizada (ex.: acentos/caixa/espaços diferentes)
  const normFile = NORMALIZED_MAP[ normalizeKey(team) ];
  if(normFile){
    img.src = `${LOGOS_FOLDER}/${normFile}`;
    img.onerror = function(){
      console.warn(`Escudo (normalizado) não encontrado: ${normFile} — usando default.png`);
      this.onerror = null;
      this.src = `${LOGOS_FOLDER}/default.png`;
    };
    return img;
  }

  // 3) fallback direto para default (sem tentativas extras)
  console.debug(`Nenhum mapeamento para time: "${team}" → usando default.png`);
  img.src = `${LOGOS_FOLDER}/default.png`;
  return img;
}

// -----------------------
// Parser / estruturas
// -----------------------
let rawRows = [];
let teamsMap = {}; // { teamName: [player,...] }
let allPlayers = [];

// tenta extrair campos comuns do JSON
function buildTeamsFromRows(rows){
  teamsMap = {};
  allPlayers = [];

  rows.forEach(r => {
    const name = (r.name || r['Unnamed: 1'] || r['NOME'] || r['Nome'] || '').toString().trim();
    const team = (r.team || r['BID PRIMEIRA COPA RURAL QUIJINGUENSE'] || r['TIME'] || r['time'] || r['Clube'] || '').toString().trim();

    if(!name) return;

    const player = {
      team: team || 'Sem time',
      number: (r.number || r['BID PRIMEIRA COPA RURAL QUIJINGUENSE'] || r['Número'] || r['Nº'] || '').toString(),
      name: name,
      apelido: (r.apelido || r['Unnamed: 4'] || '').toString(),
      cpf: (r.cpf || r['Unnamed: 5'] || '').toString(),
      localidade: (r.localidade || r['Unnamed: 6'] || '').toString(),
      situacao: (r.situacao || r['Unnamed: 8'] || '').toString(),
      idade: (r.idade || r['Unnamed: 10'] || '').toString(),
      gols: (r.gols || r['Unnamed: 11'] || '').toString(),
      cartoes_a: (r.cartoes_a || r['Unnamed: 12'] || '').toString(),
      cartoes_v: (r.cartoes_v || r['Unnamed: 13'] || '').toString(),
      raw: r
    };

    if(!teamsMap[player.team]) teamsMap[player.team] = [];
    teamsMap[player.team].push(player);
    allPlayers.push(player);
  });
}

// -----------------------
// Render UI (lista de times com escudos e contagem; clique abre lista de jogadores)
// -----------------------
function renderTeamList(){
  const teams = Object.keys(teamsMap).sort((a,b) => a.localeCompare(b,'pt'));

  // popula select de times (se existir)
  if(teamFilter){
    teamFilter.innerHTML = `<option value="all">Todos os times</option>` + teams.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)} (${teamsMap[t].length})</option>`).join('');
  }

  if(!playersGrid) return;

  if(teams.length === 0){
    playersGrid.innerHTML = '';
    if(noDataEl) noDataEl.style.display = 'block';
    return;
  }
  if(noDataEl) noDataEl.style.display = 'none';

  const container = document.createElement('div');
  container.className = 'teams-container';

  teams.forEach(team => {
    const section = document.createElement('section');
    section.className = 'team-card';
    section.style.border = '1px solid rgba(0,0,0,0.06)';
    section.style.borderRadius = '10px';
    section.style.padding = '8px';
    section.style.marginBottom = '10px';
    section.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(250,250,250,0.98))';

    const header = document.createElement('div');
    header.className = 'team-header';
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.gap = '12px';
    header.style.cursor = 'pointer';

    const logo = createLogoImg(team, { size: 56 });
    logo.style.width = '56px';
    logo.style.height = '56px';

    const titleWrap = document.createElement('div');
    titleWrap.style.display = 'flex';
    titleWrap.style.alignItems = 'center';
    titleWrap.style.gap = '8px';

    const title = document.createElement('h3');
    title.style.margin = '0';
    title.style.fontSize = '15px';
    title.textContent = team;

    const pill = document.createElement('div');
    pill.textContent = teamsMap[team].length;
    pill.style.background = 'linear-gradient(90deg,#b85a25,#2b2f3a)';
    pill.style.color = '#fff';
    pill.style.padding = '6px 10px';
    pill.style.borderRadius = '20px';
    pill.style.fontSize = '13px';

    titleWrap.appendChild(title);
    titleWrap.appendChild(pill);

    header.appendChild(logo);
    header.appendChild(titleWrap);

    const body = document.createElement('div');
    body.className = 'team-body';
    body.style.display = 'none';
    body.style.padding = '8px 6px';

    // tabela simples de jogadores
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    const thead = document.createElement('thead');
    thead.innerHTML = `<tr style="text-align:left"><th style="padding:6px">Nº</th><th>Nome</th><th>Apelido</th><th>Idade</th><th>Localidade</th><th>Situação</th><th>Gols</th><th>Cartões</th></tr>`;
    table.appendChild(thead);
    const tbody = document.createElement('tbody');

    teamsMap[team].forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="padding:6px; width:70px">${escapeHtml(p.number)}</td>
        <td>${escapeHtml(p.name)}</td>
        <td>${escapeHtml(p.apelido)}</td>
        <td style="width:90px">${escapeHtml(p.idade)}</td>
        <td>${escapeHtml(p.localidade)}</td>
        <td>${escapeHtml(p.situacao)}</td>
        <td style="width:80px">${escapeHtml(p.gols)}</td>
        <td style="width:110px">${escapeHtml(p.cartoes_a)} ${p.cartoes_v?'/ '+escapeHtml(p.cartoes_v):''}</td>
      `;
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    body.appendChild(table);

    header.addEventListener('click', () => {
      const open = body.style.display === 'block';
      document.querySelectorAll('.team-body').forEach(b => b.style.display = 'none');
      body.style.display = open ? 'none' : 'block';
      if(!open) header.scrollIntoView({behavior: 'smooth', block: 'center'});
    });

    section.appendChild(header);
    section.appendChild(body);
    container.appendChild(section);
  });

  playersGrid.innerHTML = '';
  playersGrid.appendChild(container);
}

// -----------------------
// Filtros (busca e filtro por time)
// -----------------------
function applyFilters(){
  const q = (searchInput && searchInput.value) ? searchInput.value.trim().toLowerCase() : '';
  const teamSelected = (teamFilter && teamFilter.value) ? teamFilter.value : 'all';
  let filtered = allPlayers.slice();

  if(teamSelected && teamSelected !== 'all'){
    filtered = filtered.filter(p => p.team === teamSelected);
  }

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

  // se vazio, mostra mensagem
  if(Object.keys(map).length === 0){
    if(playersGrid) playersGrid.innerHTML = '';
    if(noDataEl) noDataEl.style.display = 'block';
    return;
  }
  if(noDataEl) noDataEl.style.display = 'none';

  // renderiza times filtrados
  teamsMap = map;
  renderTeamList();
}

// -----------------------
// Carrega JSON (tenta múltiplos nomes)
// -----------------------
async function loadPlayersJson(){
  for(const url of DEFAULT_JSON_CANDIDATES){
    try {
      const res = await fetch(url);
      if(!res.ok) continue;
      const data = await res.json();
      console.info('players JSON carregado de', url);
      return data;
    } catch(e){
      // tentar próximo
      continue;
    }
  }
  console.error('Não foi possível carregar o JSON de jogadores. Verifique o nome do arquivo e o path.');
  return [];
}

// -----------------------
// Inicialização
// -----------------------
async function init(){
  try {
    rawRows = await loadPlayersJson();
    buildTeamsFromRows(rawRows);
    renderTeamList();

    // inicializa listeners de filtro
    if(searchInput) searchInput.addEventListener('input', applyFilters);
    if(teamFilter) teamFilter.addEventListener('change', applyFilters);
  } catch(e){
    console.error('Erro ao inicializar players module', e);
    if(playersGrid) playersGrid.innerHTML = `<div style="padding:18px;color:#666">Erro ao iniciar módulo de jogadores.</div>`;
  }
}

document.addEventListener('DOMContentLoaded', init);
