/* scripts.js — lógica de partidas (versão com árbitro no card e no modal) */

/* amostra de partidas com campo referee (árbitro) */
const sampleMatches = [
  { id:1, round:"1", date:"2026-01-12T16:00:00", home:"TESTE1", away:"TESTE2",
    homeLogo:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Palmeiras_logo.svg/500px-Palmeiras_logo.svg.png",
    awayLogo:"", homeScore:2, awayScore:1, status:"finished", venue:"Allianz Parque", referee: "Clécio Pereira" },

  // { id:2, round:1, date:"2026-01-12T18:30:00", home:"Corinthians", away:"São Paulo",
  //   homeLogo:"https://upload.wikimedia.org/wikipedia/pt/b/b4/Corinthians_simbolo.png",
  //   awayLogo:"imgs/ALGODOESESCUDO.png", homeScore:null, awayScore:null, status:"finished", venue:"Neo Química Arena", referee: "Rogério Gomes" },

  // { id:3, round:1, date:"2026-01-10T20:00:00", home:"Atlético-MG", away:"Internacional",
  //   homeLogo:"", awayLogo:"", homeScore:1, awayScore:1, status:"finished", venue:"Mineirão", referee: "Marcelo Duarte" },

  // { id:4, round:1, date:"2026-01-09T16:00:00", home:"Fluminense", away:"Santos",
  //   homeLogo:"", awayLogo:"", homeScore:2, awayScore:1, status:"finished", venue:"Maracanã", referee: "André Pires" },

  // { id:1, round:1, date:"2026-01-12T16:00:00", home:"Teste", away:"Teste2",
  //   homeLogo:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Palmeiras_logo.svg/500px-Palmeiras_logo.svg.png",
  //   awayLogo:"", homeScore:null, awayScore:null, status:"upcoming", venue:"Allianz Parque", referee: "Clécio Pereira" },

  // { id:2, round:1, date:"2026-01-12T18:30:00", home:"Teste3", away:"Teste4",
  //   homeLogo:"https://upload.wikimedia.org/wikipedia/pt/b/b4/Corinthians_simbolo.png",
  //   awayLogo:"imgs/ALGODOESESCUDO.png", homeScore:null, awayScore:null, status:"upcoming", venue:"Neo Química Arena", referee: "Rogério Gomes" },

  // { id:3, round:1, date:"2026-01-10T20:00:00", home:"Teste-MG", away:"Teste5",
  //   homeLogo:"", awayLogo:"", homeScore:1, awayScore:1, status:"finished", venue:"Mineirão", referee: "Marcelo Duarte" },

  // { id:4, round:1, date:"2026-01-09T16:00:00", home:"Teste6", away:"Teste7",
  //   homeLogo:"", awayLogo:"", homeScore:2, awayScore:1, status:"finished", venue:"Maracanã", referee: "André Pires" }



  ];

let matches = sampleMatches.slice();
let filtered = [];
let currentPage = 1;
const PAGE_SIZE = 6;
const favoritesKey = "br_partidas_favs";

/* helpers */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

function formatDate(iso){
  const d = new Date(iso);
  const opts = { weekday:'short', day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' };
  return d.toLocaleString('pt-BR', opts);
}

function isSameDay(iso, dateStr){
  if(!dateStr) return true;
  const d1 = new Date(iso); const d2 = new Date(dateStr);
  return d1.getFullYear()===d2.getFullYear() && d1.getMonth()===d2.getMonth() && d1.getDate()===d2.getDate();
}

function loadFavorites(){
  try{ return JSON.parse(localStorage.getItem(favoritesKey)) || []; } catch(e){ return []; }
}
function saveFavorites(arr){ localStorage.setItem(favoritesKey, JSON.stringify(arr)); }

function toggleFavorite(teamName){
  const favs = loadFavorites();
  const idx = favs.indexOf(teamName);
  if(idx === -1) favs.push(teamName); else favs.splice(idx,1);
  saveFavorites(favs);
  renderMatches();
}

/* safely render logo: if url provided use <img>, otherwise fallback initial */
function renderLogoHtml(name, logoUrl){
  if(logoUrl && logoUrl.trim()){
    // image with onerror fallback to initials
    return `<img class="logo-img" src="${logoUrl}" alt="${name}" onerror="this.style.display='none'; this.insertAdjacentHTML('afterend', '<div class=\\'logo-img\\' title=\\'${name}\\'>${name[0]}<\\/div>')">`;
  }
  return `<div class="logo-img" title="${name}">${name[0]}</div>`;
}

/* render single match card (most changes here: mostra árbitro) */
function renderCard(m){
  const favs = loadFavorites();
  const dateStr = formatDate(m.date);
  const statusBadge = m.status === "finished" ? `<span class="badge finished">FINAL</span>` : `<span class="badge upcoming">PRÓXIMO</span>`;
  const scoreHtml = (m.status === "upcoming") ? "vs" : `${m.homeScore} : ${m.awayScore}`;

  return `
  <article class="match-card" data-id="${m.id}">
    <div class="match-row">
      <div class="teams">
        <div class="team">
          ${ renderLogoHtml(m.home, m.homeLogo) }
          <div>
            <div class="team-name">${m.home}</div>
            <div style="font-size:12px;color:var(--muted)">${m.venue}</div>
          </div>
        </div>

        <div class="score">${scoreHtml}</div>

        <div class="team" style="justify-content:flex-end;text-align:right;">
          <div style="margin-right:10px">
            <div class="team-name">${m.away}</div>
            <div style="font-size:12px;color:var(--muted)">${new Date(m.date).toLocaleDateString()}</div>
          </div>
          ${ renderLogoHtml(m.away, m.awayLogo) }
        </div>
      </div>

      <div class="match-meta">
        ${statusBadge}
        <div style="font-size:13px">${dateStr}</div>
        <div style="font-size:13px;color:var(--muted)">Rodada ${m.round}ª</div>
        <div style="font-size:12px;color:var(--muted);margin-top:6px"><strong>Árbitro:</strong> ${m.referee || '—'}</div>
      </div>
    </div>

    <div class="match-footer">
      <div>
        <button class="btn view-detail" data-id="${m.id}">Ver detalhes</button>
      </div>

      
  </article>`;
}

/* main render with pagination */
function renderMatches(){
  const container = $("#matchesList");
  if(!container) return;
  const start = (currentPage-1)*PAGE_SIZE;
  const slice = filtered.slice(start, start+PAGE_SIZE);
  container.innerHTML = slice.map(renderCard).join("") || `<div style="padding:20px;color:var(--muted)">Nenhuma partida encontrada.</div>`;
  renderPagination();
  attachCardEvents();
}

/* pagination controls */
function renderPagination(){
  const total = Math.ceil(filtered.length / PAGE_SIZE);
  const el = $("#pagination");
  if(!el) return;
  if(total <= 1){ el.innerHTML = ""; return; }
  let html = "";
  for(let i=1;i<=total;i++){
    html += `<button class="btn ghost page-btn ${i===currentPage?'active':''}" data-page="${i}">${i}</button>`;
  }
  el.innerHTML = html;
  $$(".page-btn").forEach(b => b.addEventListener("click", e => {
    currentPage = Number(e.currentTarget.dataset.page); renderMatches();
  }));
}

/* attach card events (view/detail and favorite toggles) */
function attachCardEvents(){
  $$(".view-detail").forEach(b => b.onclick = (e) => openModal(Number(b.dataset.id)));
  $$(".fav-btn").forEach(b => b.onclick = (e) => { toggleFavorite(b.dataset.team); });
}

/* filtering & sorting */
function applyFilters(){
  // safety: if elements don't exist, fallback sensible defaults
  const statusTab = document.querySelector(".tabs .tab.active");
  const status = statusTab ? statusTab.dataset.status : "all";
  const round = $("#roundSelect") ? $("#roundSelect").value : "all";
  const q = $("#searchInput") ? $("#searchInput").value.trim().toLowerCase() : "";
  const dateFilter = $("#dateFilter") ? $("#dateFilter").value : "";

  filtered = matches.filter(m => {
    if(status === "upcoming" && m.status !== "upcoming") return false;
    if(status === "finished" && m.status !== "finished") return false;
    if(round !== "all" && String(m.round) !== round) return false;
    if(dateFilter && !isSameDay(m.date, dateFilter)) return false;
    if(q){
      const s = (m.home + " " + m.away + " " + m.venue + " " + (m.referee||"")).toLowerCase();
      if(!s.includes(q)) return false;
    }
    return true;
  });

  const sortEl = $("#sortSelect");
  const sort = sortEl ? sortEl.value : "date_asc";
  if(sort === "date_asc") filtered.sort((a,b)=> new Date(a.date)-new Date(b.date));
  if(sort === "date_desc") filtered.sort((a,b)=> new Date(b.date)-new Date(a.date));
  if(sort === "status") filtered.sort((a,b)=> a.status === b.status ? 0 : (a.status === "upcoming"? -1:1));

  currentPage = 1;
  renderMatches();
}

/* modal detail (mostre árbitro aqui também) */
function openModal(id){
  const m = matches.find(x=>x.id===id);
  if(!m) return;
  const modal = $("#matchModal");
  const body = $("#modalBody");
  if(!modal || !body) return;

  const scoreHtml = (m.status === "upcoming") ? "vs" : `${m.homeScore} x ${m.awayScore}`;
  body.innerHTML = `
    <div style="display:flex;gap:12px;align-items:center;justify-content:space-between">
      <div style="display:flex;gap:12px;align-items:center">
        ${ renderLogoHtml(m.home, m.homeLogo) }
        <div>
          <h3 style="margin:0">${m.home}</h3>
          <div style="color:var(--muted)">${m.venue}</div>
        </div>
      </div>
      <div style="text-align:center">
        <div style="font-weight:800;font-size:28px">${scoreHtml}</div>
        <div style="color:var(--muted)">${formatDate(m.date)}</div>
      </div>
      <div style="display:flex;gap:12px;align-items:center;flex-direction:row-reverse">
        ${ renderLogoHtml(m.away, m.awayLogo) }
        <div style="text-align:right">
          <h3 style="margin:0">${m.away}</h3>
        </div>
      </div>
    </div>
    <hr style="margin:12px 0"/>
    <p><strong>Rodada:</strong> ${m.round}</p>
    <p><strong>Local:</strong> ${m.venue}</p>
    <p><strong>Status:</strong> ${m.status === "upcoming" ? "Próxima" : "Finalizada"}</p>
    <p><strong>Árbitro:</strong> ${m.referee || '—'}</p>
    <div style="margin-top:12px"><button class="btn" id="closeModalFromAction">Fechar</button></div>
  `;
  modal.classList.remove("hidden"); modal.setAttribute("aria-hidden","false");
  $("#closeModalFromAction").onclick = closeModal;
}

function closeModal(){
  const modal = $("#matchModal");
  if(!modal) return;
  modal.classList.add("hidden"); modal.setAttribute("aria-hidden","true");
}

/* event wiring */
function attachUI(){
  // tabs
  $$(".tabs .tab").forEach(t=>{
    t.addEventListener("click", (e)=>{
      $$(".tabs .tab").forEach(x=>x.classList.remove("active"));
      t.classList.add('active');
      applyFilters();
    });
  });

  if($("#roundSelect")) $("#roundSelect").addEventListener("change", applyFilters);
  if($("#sortSelect")) $("#sortSelect").addEventListener("change", applyFilters);
  if($("#searchInput")) $("#searchInput").addEventListener("input", debounce(applyFilters, 220));
  if($("#dateFilter")) $("#dateFilter").addEventListener("change", applyFilters);
  if($("#seasonSelect")) $("#seasonSelect").addEventListener("change", (e)=>{ applyFilters(); });

  if($("#modalClose")) $("#modalClose").onclick = closeModal;
  window.addEventListener("click", (e)=>{
    if(e.target === $("#matchModal")) closeModal();
  });
}

/* debounce helper */
function debounce(fn, ms=200){
  let t;
  return (...args)=>{ clearTimeout(t); t = setTimeout(()=>fn(...args), ms); };
}

/* initial */
document.addEventListener("DOMContentLoaded", ()=>{
  matches = sampleMatches.map(m => Object.assign({},m));
  filtered = matches.slice();
  attachUI();
  applyFilters();
});
