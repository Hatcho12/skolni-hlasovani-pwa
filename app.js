// ZDE vlož adresu svého Apps Script backendu, zakončenou ?path=
const API_BASE = 'TVŮJ_APPS_SCRIPT_URL/exec?path=';

const els = {
  pwaStatus: document.getElementById('pwaStatus'),
  authCard: document.getElementById('authCard'),
  voteCard: document.getElementById('voteCard'),
  authMsg: document.getElementById('authMsg'),
  voteMsg: document.getElementById('voteMsg'),
  code: document.getElementById('code'),
  btnLogin: document.getElementById('btnLogin'),
  presenter: document.getElementById('presenter'),
  score: document.getElementById('score'),
  scoreOut: document.getElementById('scoreOut'),
  note: document.getElementById('note'),
  btnSubmit: document.getElementById('btnSubmit'),
  btnSync: document.getElementById('btnSync')
};

let state = {
  token: localStorage.getItem('token') || null,
  queue: JSON.parse(localStorage.getItem('queue') || '[]')
};

function saveQueue() {
  localStorage.setItem('queue', JSON.stringify(state.queue));
}

async function api(path, body) {
  try {
    const res = await fetch(API_BASE + path, {
      method: body ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    return await res.json();
  } catch (e) {
    console.error(e);
    return { error: e.message };
  }
}

// Přihlášení pomocí kódu
els.btnLogin.onclick = async () => {
  els.authMsg.textContent = '⏳ Ověřuji kód...';
  const code = els.code.value.trim();
  const res = await api('/login', { code });
  if (res.token) {
    state.token = res.token;
    localStorage.setItem('token', state.token);
    els.authMsg.textContent = '✅ Přihlášeno.';
    els.authCard.hidden = true;
    els.voteCard.hidden = false;
    loadPresenters();
  } else {
    els.authMsg.textContent = '❌ Kód je neplatný.';
  }
};

// Načtení prezentujících
async function loadPresenters() {
  const res = await api('/presenters');
  if (res.presenters) {
    els.presenter.innerHTML = '';
    res.presenters.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p;
      opt.textContent = p;
      els.presenter.appendChild(opt);
    });
  }
}

// Odeslání hlasu
els.btnSubmit.onclick = () => {
  const vote = {
    presenter: els.presenter.value,
    score: els.score.value,
    note: els.note.value,
    token: state.token,
    ts: new Date().toISOString()
  };
  state.queue.push(vote);
  saveQueue();
  els.voteMsg.textContent = '⏳ Hlas uložen, odesílám...';
  syncQueue();
};

// Synchronizace fronty
async function syncQueue() {
  if (!state.queue.length) {
    els.voteMsg.textContent = 'Žádné hlasy k synchronizaci.';
    return;
  }
  const batch = [...state.queue];
  try {
    const res = await api('/submit', { votes: batch });
    if (res.success) {
      state.queue = [];
      saveQueue();
      els.voteMsg.textContent = '✅ Hlasy odeslány.';
    } else {
      els.voteMsg.textContent = '⚠️ Chyba při odesílání.';
    }
  } catch {
    els.voteMsg.textContent = '⚠️ Offline – hlasy zůstanou ve frontě.';
  }
}
els.btnSync.onclick = syncQueue;

// Automatická synchronizace po připojení k internetu
window.addEventListener('online', syncQueue);

// Service Worker pro offline provoz
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(() => {
    els.pwaStatus.textContent = '✅ Aplikace připravena (PWA)';
  });
}

// Auto-login pokud máme token
if (state.token) {
  els.authCard.hidden = true;
  els.voteCard.hidden = false;
  loadPresenters();
}
