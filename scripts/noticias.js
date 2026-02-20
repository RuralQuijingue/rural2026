/* scripts/news.js
   Página de Notícias — carrossel, lista, filtros, pesquisa, paginação e modal.
*/

const sampleNews = [
  {
    id: 101,
    title: "A Copa Rural 2026 promete!",
    date: "2026-01-12T11:45:00",
    excerpt: "A comissão organizadora da 2ª Copa Rural do município de Quijingue já começou os preparativos para um campeonato que promete entrar na história. Em breve divulgaremos tabela de jogos, locais, horários e a cobertura completa dos confrontos, fique ligado para não perder nenhuma novidade!",
    content: "<p>A organização já está trabalhando na definição do regulamento, confirmação das equipes participantes e estrutura do campeonato. Em breve serão divulgados a tabela de jogos, locais das partidas, horários e todas as informações oficiais. A 2ª Copa Rural de Quijingue vem para fortalecer o esporte local e valorizar o futebol das comunidades rurais.</p>",
    image: "imgs/comissão1.jpeg",
    tag: "Destaque"
  },
  {
    id: 102,
    title: "Expectativa em alta para a Copa Rural 2026!",
    date: "2026-01-12T12:00:00",
    excerpt: "A Copa Rural de Quijingue 2026 será gigante!",
    content: "<p>A edição 2026 da Copa Rural irá movimenta atletas, torcedores e comunidades. A expectativa é de grandes jogos disputados, participação ativa  das equipes e um campeonato ainda mais organizado e competitivo. Em breve, a comissão organizadora divulgará todas as novidades, mantendo viva a tradição e a paixão pelo futebol rural em Quijingue.</p>",
    image: "imgs/LOGORURAL.png",
    tag: "Destaque"
  },
  
];

let newsItems = sampleNews.slice();
let filtered = newsItems.slice();
let featuredIndex = 0;
let newsTimer = null;
const PAGE_SIZE = 6;
let currentPage = 1;

/* helpers */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

function escapeHtml(s){
  if(!s && s!==0) return '';
  return String(s)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}

/* render featured + list (paginated) */
function renderNews(){
  const featured = filtered[featuredIndex] || filtered[0] || null;
  const featEl = $("#newsFeatured");
  if(featEl){
    if(featured){
      featEl.innerHTML = `
        <div class="img">${ featured.image ? `<img src="${featured.image}" alt="${escapeHtml(featured.title)}">` : `<div style="padding:12px;color:var(--muted)">${escapeHtml(featured.tag)}</div>` }</div>
        <div class="meta">
          <h3>${escapeHtml(featured.title)}</h3>
          <p>${escapeHtml(featured.excerpt)}</p>
          <div style="margin-top:10px">
            <button class="btn read-news" data-id="${featured.id}">Ler notícia</button>
          </div>
        </div>
      `;
    } else {
      featEl.innerHTML = `<div style="padding:18px;color:var(--muted)">Nenhuma notícia disponível.</div>`;
    }
  }

  // paginated list
  const listEl = $("#newsList");
  if(!listEl) return;
  const start = (currentPage-1)*PAGE_SIZE;
  const slice = filtered.slice(start, start+PAGE_SIZE);

  listEl.innerHTML = slice.map(n => `
    <article class="news-card" data-id="${n.id}">
      <div class="thumb">${ n.image ? `<img src="${n.image}" alt="${escapeHtml(n.title)}">` : '' }</div>
      <div class="news-body">
        <div class="meta">${new Date(n.date).toLocaleDateString()} • <strong>${escapeHtml(n.tag)}</strong></div>
        <h4>${escapeHtml(n.title)}</h4>
        <p>${escapeHtml(n.excerpt)}</p>
        <button class="btn read-btn read-news" data-id="${n.id}">Ler mais</button>
      </div>
    </article>
  `).join("") || `<div style="padding:18px;color:var(--muted)">Nenhuma notícia encontrada.</div>`;

  renderNewsPagination();
  attachNewsEvents();
}

function renderNewsPagination(){
  const total = Math.ceil(filtered.length / PAGE_SIZE);
  const el = $("#newsPagination");
  if(!el) return;
  if(total <= 1){ el.innerHTML = ""; return; }
  let html = "";
  for(let i=1;i<=total;i++){
    html += `<button class="btn ghost page-btn ${i===currentPage?'active':''}" data-page="${i}">${i}</button>`;
  }
  el.innerHTML = html;
  $$(".page-btn").forEach(b => b.addEventListener("click", e => {
    currentPage = Number(e.currentTarget.dataset.page);
    renderNews();
    window.scrollTo({top: 0, behavior: "smooth"});
  }));
}

/* events: open modal with article */
function attachNewsEvents(){
  $$(".read-news").forEach(b => b.onclick = (e) => {
    const id = Number(b.dataset.id);
    openNewsModal(id);
  });
}

/* modal open/close */
function openNewsModal(id){
  const n = newsItems.find(x => x.id === id);
  if(!n) return;
  const modal = $("#newsModal");
  const body = $("#modalBody");
  body.innerHTML = `
    <div style="display:flex;gap:12px;flex-direction:column">
      ${ n.image ? `<div style="width:100%;height:220px;overflow:hidden;border-radius:8px"><img src="${n.image}" style="width:100%;height:100%;object-fit:cover" alt="${escapeHtml(n.title)}"></div>` : '' }
      <h2 style="margin:6px 0 0 0">${escapeHtml(n.title)}</h2>
      <div style="color:var(--muted);font-size:13px;margin-bottom:8px">${new Date(n.date).toLocaleString()}</div>
      <div style="color:var(--muted)">${n.content}</div>
      <div style="margin-top:12px"><button class="btn" id="closeNewsModal">Fechar</button></div>
    </div>
  `;
  modal.classList.remove("hidden"); modal.setAttribute("aria-hidden","false");
  $("#closeNewsModal").onclick = closeNewsModal;
}
function closeNewsModal(){
  const modal = $("#newsModal"); modal.classList.add("hidden"); modal.setAttribute("aria-hidden","true");
}

/* carousel controls */
function newsNext(){
  if(filtered.length === 0) return;
  featuredIndex = (featuredIndex + 1) % filtered.length;
  renderNews();
}
function newsPrev(){
  if(filtered.length === 0) return;
  featuredIndex = (featuredIndex - 1 + filtered.length) % filtered.length;
  renderNews();
}
function startNewsAuto(){ clearInterval(newsTimer); newsTimer = setInterval(newsNext, 6000); }
function stopNewsAuto(){ clearInterval(newsTimer); }

/* filtering & search */
function applyNewsFilters(){
  const activeTab = document.querySelector(".tabs .tab.active");
  const tagFilter = activeTab ? activeTab.dataset.filter : "all";
  const q = $("#searchInput").value.trim().toLowerCase();
  const dateFilter = $("#dateFilter").value;
  const sort = $("#sortSelect").value;

  filtered = newsItems.filter(n => {
    if(tagFilter && tagFilter !== "all" && n.tag !== tagFilter) return false;
    if(dateFilter){
      const d = new Date(n.date); const sd = new Date(dateFilter);
      if(d.getFullYear()!==sd.getFullYear() || d.getMonth()!==sd.getMonth() || d.getDate()!==sd.getDate()) return false;
    }
    if(q){
      const text = (n.title + " " + n.excerpt + " " + n.content + " " + n.tag).toLowerCase();
      if(!text.includes(q)) return false;
    }
    return true;
  });

  if(sort === "date_asc") filtered.sort((a,b)=> new Date(a.date) - new Date(b.date));
  else filtered.sort((a,b)=> new Date(b.date) - new Date(a.date));

  featuredIndex = 0;
  currentPage = 1;
  renderNews();
}

/* debounce */
function debounce(fn, ms=200){ let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), ms); }; }

/* wire up UI */
document.addEventListener("DOMContentLoaded", ()=> {
  // init data
  newsItems = sampleNews.slice();
  filtered = newsItems.slice();

  // attach filter tab events
  $$(".tabs .tab").forEach(t => t.addEventListener("click", (e)=>{
    $$(".tabs .tab").forEach(x=>x.classList.remove("active"));
    t.classList.add("active");
    applyNewsFilters();
  }));

  $("#sortSelect").addEventListener("change", applyNewsFilters);
  $("#searchInput").addEventListener("input", debounce(applyNewsFilters, 220));
  $("#dateFilter").addEventListener("change", applyNewsFilters);

  // carousel controls
  $("#news-next")?.addEventListener("click", ()=>{ newsNext(); startNewsAuto(); });
  $("#news-prev")?.addEventListener("click", ()=>{ newsPrev(); startNewsAuto(); });

  // modal close
  $("#modalClose")?.addEventListener("click", closeNewsModal);
  window.addEventListener("click", (e)=> { if(e.target === $("#newsModal")) closeNewsModal(); });

  // initial render
  renderNews();
  startNewsAuto();
});
