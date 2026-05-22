/* ═══════════════════════════════════════════
   NEW PARKING GUATEMALA 
═══════════════════════════════════════════ */
'use strict';

/* ─── IMAGES No fue facil ─── */
const IMAGES = {
  loginHero: [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80',
    'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=1400&q=80',
    'https://images.unsplash.com/photo-1470224114660-3f6686c562eb?w=1400&q=80',
  ],
  dashHero: [
    'https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?w=1200&q=80',
    'https://images.unsplash.com/photo-1548168671-5c2f11f7f16c?w=1200&q=80',
    'https://images.unsplash.com/photo-1572635148818-ef6fd45eb394?w=1200&q=80',
  ],
  gallery: [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=75',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=75',
    'https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?w=600&q=75',
    'https://images.unsplash.com/photo-1472289065668-ce650ac443d2?w=600&q=75',
    'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=600&q=75',
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=75',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=75',
    'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&q=75',
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&q=75',
    'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=75',
  ],
};

/* ─── STORAGE KEYS ─── */
const K = {
  USER:    'cp_user',
  TYPES:   'cp_vehicle_types',
  PARKING: 'cp_parking',
  SPACES:  'cp_spaces_config',
};

/* ─── HELPERS ─── */
const el  = id  => document.getElementById(id);
const rand = arr => arr[Math.floor(Math.random() * arr.length)];
const uid  = ()  => '_' + Math.random().toString(36).slice(2, 10);

/* Guatemala: GTQ (Quetzal) */
function formatCurrency(n) {
  return 'Q ' + Number(n).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatDate(d) {
  return new Intl.DateTimeFormat('es-GT', { dateStyle: 'medium' }).format(new Date(d + 'T00:00'));
}
function _parseTimeToMinutes(time) {
  if (!time) return 0;
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}
function _getNowMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}
function _dateToISO(value) {
  if (!value) return null;
  if (typeof value === 'number') {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 10);
  }
  if (typeof value === 'string' && /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value)) {
    return value;
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

/* ─── LOCAL STORAGE ─── */
function load(key, def) {
  try { return JSON.parse(localStorage.getItem(key)) ?? def; }
  catch { return def; }
}
function save(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

/* ─── INITIAL DATA ─── */
function initData() {
  if (!load(K.USER, null)) {
    save(K.USER, {
      name:     'admin',
      email:    'admin@newparking.com.gt',
      password: 'Admin123',
    });
  }
  if (!load(K.TYPES, null)) {
    save(K.TYPES, [
      { id: uid(), code: 'MOT',  name: 'Motocicleta (M)', rate: 5 },
      { id: uid(), code: 'AUTO', name: 'Particular (P)',   rate: 8 },
      { id: uid(), code: 'CAM',  name: 'Comercial/Carga (C)',   rate: 10 },
      { id: uid(), code: 'BUS',  name: 'Alquiler (A)', rate: 15 },
      { id: uid(), code: 'OFC',  name: 'Oficial (O)', rate: 12 },
    ]);
  }
  if (!load(K.PARKING, null)) {
    save(K.PARKING, []);
  }
  if (!load(K.SPACES, null)) {
    // Default: sections A, B, C with 8 spaces each
    save(K.SPACES, [
      { section: 'A', count: 8 },
      { section: 'B', count: 8 },
      { section: 'C', count: 6 },
    ]);
  }
}

/* ══════════════════════════════════════════
   AUTH
══════════════════════════════════════════ */
el('login-form').addEventListener('submit', e => {
  e.preventDefault();
  const email = el('l-email').value.trim();
  const pass  = el('l-pass').value;
  let ok = true;

  clearErr('l-email-err'); clearErr('l-pass-err');
  el('login-global-err').classList.add('hidden');

  if (!email) { setErr('l-email-err', 'El correo es obligatorio.'); ok = false; }
  else if (!isValidEmail(email)) { setErr('l-email-err', 'Formato de correo inválido.'); ok = false; }
  if (!pass) { setErr('l-pass-err', 'La contraseña es obligatoria.'); ok = false; }
  if (!ok) return;

  const user = load(K.USER, {});
  if (user.email !== email || user.password !== pass) {
    el('login-global-err').textContent = 'Credenciales incorrectas. Inténtalo nuevamente.';
    el('login-global-err').classList.remove('hidden');
    return;
  }
  sessionStorage.setItem('cp_auth', '1');
  goToApp();
});

function logout() {
  sessionStorage.removeItem('cp_auth');
  el('view-app').classList.remove('active');
  el('view-login').classList.add('active');
  el('l-email').value = '';
  el('l-pass').value  = '';
}

function goToApp() {
  el('view-login').classList.remove('active');
  el('view-app').classList.add('active');
  updateUserUI();
  renderDashboard();
}

function togglePassword(inputId, btn) {
  const inp = el(inputId);
  inp.type  = inp.type === 'password' ? 'text' : 'password';
  btn.textContent = inp.type === 'password' ? '👁' : '🙈';
}

/* ══════════════════════════════════════════
   NAVIGATION
══════════════════════════════════════════ */
document.querySelectorAll('.sidebar__nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sidebar__nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const section = btn.dataset.section;
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    el('section-' + section).classList.add('active');
    if (section === 'dashboard')     renderDashboard();
    if (section === 'spaces')        renderSpaces();
    if (section === 'vehicle-types') renderVehicleTypes();
    if (section === 'parking')       renderParking();
    if (section === 'reports')       generateReport();
    closeSidebar();
  });
});

function toggleSidebar() {
  el('sidebar').classList.toggle('open');
  el('sidebar-overlay').classList.toggle('open');
}
function closeSidebar() {
  el('sidebar').classList.remove('open');
  el('sidebar-overlay').classList.remove('open');
}

/* ══════════════════════════════════════════
   USER / PROFILE
══════════════════════════════════════════ */
function updateUserUI() {
  const u = load(K.USER, {});
  el('sidebar-name').textContent   = u.name  || 'Usuario';
  el('sidebar-email').textContent  = u.email || '';
  el('sidebar-avatar').textContent = (u.name || 'U')[0].toUpperCase();
}

el('open-profile').addEventListener('click', openProfileModal);

function openProfileModal() {
  const u = load(K.USER, {});
  el('pr-name').value  = u.name  || '';
  el('pr-email').value = u.email || '';
  el('pr-pass').value  = '';
  el('profile-avatar-big').textContent = (u.name || 'U')[0].toUpperCase();
  ['pr-name-err','pr-email-err','pr-pass-err'].forEach(clearErr);
  el('profile-alert').classList.add('hidden');
  openModal('modal-profile');
}

function saveProfile() {
  const name  = el('pr-name').value.trim();
  const email = el('pr-email').value.trim();
  const pass  = el('pr-pass').value;
  let ok = true;
  ['pr-name-err','pr-email-err','pr-pass-err'].forEach(clearErr);
  if (!name)  { setErr('pr-name-err', 'El nombre es obligatorio.'); ok = false; }
  if (!email) { setErr('pr-email-err', 'El correo es obligatorio.'); ok = false; }
  else if (!isValidEmail(email)) { setErr('pr-email-err', 'Formato de correo inválido.'); ok = false; }
  if (pass && pass.length < 6) { setErr('pr-pass-err', 'Mínimo 6 caracteres.'); ok = false; }
  if (!ok) return;
  const u = load(K.USER, {});
  u.name = name; u.email = email;
  if (pass) u.password = pass;
  save(K.USER, u);
  updateUserUI();
  toast('Perfil actualizado', 'success');
  setTimeout(() => closeModal('modal-profile'), 1400);
}

/* ══════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════ */
function renderDashboard() {
  el('dash-date').textContent = new Intl.DateTimeFormat('es-GT', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }).format(new Date());
  el('dash-hero-img').src = rand(IMAGES.dashHero);

  const types   = load(K.TYPES, []);
  const records = load(K.PARKING, []);
  const active  = records.filter(r => !r.exitTime);
  const closed  = records.filter(r =>  r.exitTime);
  const revenue = closed.reduce((a, r) => a + (r.cost || 0), 0);

  // Total spaces
  const spacesConf = load(K.SPACES, []);
  const totalSpaces = spacesConf.reduce((a, s) => a + s.count, 0);
  const availSpaces = totalSpaces - active.length;

  const statsGrid = el('stats-grid');
  statsGrid.innerHTML = '';
  const stats = [
    { label: 'Vehículos activos',   value: active.length,           sub: 'En este momento',        icon: '🚘' },
    { label: 'Espacios disponibles',value: Math.max(0, availSpaces), sub: `De ${totalSpaces} totales`, icon: '🅿️' },
    { label: 'Registros totales',   value: records.length,          sub: 'Histórico',               icon: '📋' },
    { label: 'Ingresos totales',    value: formatCurrency(revenue), sub: 'Servicios finalizados',   icon: '💰' },
  ];
  stats.forEach(s => {
    const c = document.createElement('div');
    c.className = 'stat-card';
    c.innerHTML = `
      <div class="stat-card__label">${s.label}</div>
      <div class="stat-card__value">${s.value}</div>
      <div class="stat-card__sub">${s.sub}</div>
      <div class="stat-card__icon">${s.icon}</div>
    `;
    statsGrid.appendChild(c);
  });

  // Active vehicles
  const avl = el('active-vehicles-list');
  avl.innerHTML = '';
  if (active.length === 0) {
    avl.innerHTML = '<p class="vehicle-list-empty">No hay vehículos en el parqueadero.</p>';
  } else {
    active.slice(0, 8).forEach(r => {
      const t = types.find(x => x.id === r.typeId);
      const d = document.createElement('div');
      d.className = 'vehicle-list-item';
      d.innerHTML = `
        <span class="vehicle-list-item__plate">${r.plate}</span>
        <span class="vehicle-list-item__info">${t ? t.name : '—'}</span>
        <span class="vehicle-list-item__slot">Slot ${r.slot}</span>
        <span class="badge badge--green">Activo</span>
      `;
      avl.appendChild(d);
    });
  }

  // Recent entries
  const rel = el('recent-entries-list');
  rel.innerHTML = '';
  const recent = [...records].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6);
  if (recent.length === 0) {
    rel.innerHTML = '<p class="vehicle-list-empty">Sin registros recientes.</p>';
  } else {
    recent.forEach(r => {
      const t = types.find(x => x.id === r.typeId);
      const d = document.createElement('div');
      d.className = 'vehicle-list-item';
      d.innerHTML = `
        <span class="vehicle-list-item__plate">${r.plate}</span>
        <span class="vehicle-list-item__info">${t ? t.name : '—'}</span>
        <span class="vehicle-list-item__slot">${r.entryTime}</span>
        ${r.exitTime ? '<span class="badge badge--gray">Fin.</span>' : '<span class="badge badge--green">Activo</span>'}
      `;
      rel.appendChild(d);
    });
  }

  // Gallery
  const gg = el('gallery-grid');
  gg.innerHTML = '';
  IMAGES.gallery.forEach(src => {
    const img = document.createElement('img');
    img.src = src; img.alt = 'Parking'; img.loading = 'lazy';
    gg.appendChild(img);
  });
}

/* ══════════════════════════════════════════
   SPACES
══════════════════════════════════════════ */
let _spacesFilter = 'all';

function filterSpaces(filter, btn) {
  _spacesFilter = filter;
  document.querySelectorAll('.spaces-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderSpaces();
}

function renderSpaces() {
  const spacesConf = load(K.SPACES, []);
  const records    = load(K.PARKING, []);
  const types      = load(K.TYPES, []);

  // Build a set of occupied slots
  const occupiedSlots = {};
  records.filter(r => !r.exitTime).forEach(r => {
    occupiedSlots[r.slot.toUpperCase()] = r;
  });

  // Summary
  const totalSpaces = spacesConf.reduce((a, s) => a + s.count, 0);
  const occupiedCount = Object.keys(occupiedSlots).length;
  const availCount = Math.max(0, totalSpaces - occupiedCount);

  const summaryEl = el('spaces-summary');
  summaryEl.innerHTML = `
    <div class="spaces-summary-card">
      <div class="spaces-summary-card__icon spaces-summary-card__icon--total">🅿️</div>
      <div class="spaces-summary-card__info">
        <span class="spaces-summary-card__num spaces-summary-card__num--total">${totalSpaces}</span>
        <span class="spaces-summary-card__label">Total espacios</span>
      </div>
    </div>
    <div class="spaces-summary-card">
      <div class="spaces-summary-card__icon spaces-summary-card__icon--avail">✅</div>
      <div class="spaces-summary-card__info">
        <span class="spaces-summary-card__num spaces-summary-card__num--avail">${availCount}</span>
        <span class="spaces-summary-card__label">Disponibles</span>
      </div>
    </div>
    <div class="spaces-summary-card">
      <div class="spaces-summary-card__icon spaces-summary-card__icon--occ">🚗</div>
      <div class="spaces-summary-card__info">
        <span class="spaces-summary-card__num spaces-summary-card__num--occ">${occupiedCount}</span>
        <span class="spaces-summary-card__label">Ocupados</span>
      </div>
    </div>
  `;

  // Grid
  const grid = el('spaces-grid');
  grid.innerHTML = '';

  if (spacesConf.length === 0) {
    grid.innerHTML = `<div class="spaces-empty">No hay espacios configurados.<br>Haz clic en <strong>Configurar</strong> para agregar secciones.</div>`;
    return;
  }

  spacesConf.forEach(sec => {
    // Section label
    const label = document.createElement('div');
    label.className = 'spaces-section-label';
    label.innerHTML = `<span>Sección ${escH(sec.section)}</span> — ${sec.count} espacios`;
    grid.appendChild(label);

    for (let i = 1; i <= sec.count; i++) {
      const slotId = `${sec.section}-${String(i).padStart(2, '0')}`;
      const rec = occupiedSlots[slotId.toUpperCase()] || null;
      const isOccupied = !!rec;
      const state = isOccupied ? 'occupied' : 'available';

      // Filter logic
      let hidden = false;
      if (_spacesFilter === 'available' && isOccupied)  hidden = true;
      if (_spacesFilter === 'occupied'  && !isOccupied) hidden = true;

      const card = document.createElement('div');
      card.className = `space-card space-card--${state}${hidden ? ' space-card--hidden' : ''}`;
      card.dataset.slot = slotId;
      card.onclick = () => showSpaceDetail(slotId, rec);

      let typeLabel = '';
      if (rec) {
        const t = types.find(x => x.id === rec.typeId);
        typeLabel = t ? t.name : '';
      }

      card.innerHTML = `
        <div class="space-card__status-dot"></div>
        <div class="space-card__icon">${isOccupied ? '🚗' : '⬜'}</div>
        <div class="space-card__slot">${slotId}</div>
        ${isOccupied ? `
          <div class="space-card__plate">${escH(rec.plate)}</div>
          <div class="space-card__time">${rec.entryTime} · ${typeLabel}</div>
        ` : `<div class="space-card__time" style="color:var(--green);font-size:.72rem">Libre</div>`}
      `;
      grid.appendChild(card);
    }
  });
}

function showSpaceDetail(slotId, rec) {
  el('space-detail-title').textContent = `Espacio ${slotId}`;
  const body   = el('space-detail-body');
  const footer = el('space-detail-footer');

  if (!rec) {
    body.innerHTML = `
      <div style="text-align:center;padding:1.5rem 0">
        <div style="font-size:3rem;margin-bottom:1rem">✅</div>
        <p style="color:var(--green);font-family:var(--font-display);font-size:1.1rem;font-weight:700">Espacio disponible</p>
        <p style="color:var(--text3);font-size:.875rem;margin-top:.5rem">Este espacio está libre para ser asignado.</p>
      </div>
    `;
    footer.innerHTML = `
      <button class="btn btn--ghost" onclick="closeModal('modal-space-detail')">Cerrar</button>
      <button class="btn btn--primary" onclick="closeModal('modal-space-detail');openParkingModalWithSlot('${slotId}')">Registrar aquí</button>
    `;
  } else {
    const types = load(K.TYPES, []);
    const t = types.find(x => x.id === rec.typeId);
    const mins  = timeDiffMinutes(rec.entryTime, nowTime());
    const hours = Math.ceil(mins / 60);
    const estCost = hours * (t ? t.rate : 0);

    body.innerHTML = `
      <div class="cost-card">
        <div class="cost-row">
          <span class="cost-row__label">Placa</span>
          <span class="cost-row__value"><span class="plate-tag">${escH(rec.plate)}</span></span>
        </div>
        <div class="cost-row">
          <span class="cost-row__label">Tipo</span>
          <span class="cost-row__value">${t ? escH(t.name) : '—'}</span>
        </div>
        <div class="cost-row">
          <span class="cost-row__label">Fecha</span>
          <span class="cost-row__value">${formatDate(rec.date)}</span>
        </div>
        <div class="cost-row">
          <span class="cost-row__label">Entrada</span>
          <span class="cost-row__value">${rec.entryTime}</span>
        </div>
        <div class="cost-row">
          <span class="cost-row__label">Tiempo (aprox.)</span>
          <span class="cost-row__value">${hours} hora${hours !== 1 ? 's' : ''} (${mins} min)</span>
        </div>
        <div class="cost-row">
          <span class="cost-row__label">Costo estimado</span>
          <span class="cost-row__value" style="color:var(--accent)">${formatCurrency(estCost)}</span>
        </div>
      </div>
    `;
    footer.innerHTML = `
      <button class="btn btn--ghost" onclick="closeModal('modal-space-detail')">Cerrar</button>
      <button class="btn btn--primary" onclick="closeModal('modal-space-detail');registerExit('${rec.id}')">Registrar salida</button>
    `;
  }
  openModal('modal-space-detail');
}

function openParkingModalWithSlot(slotId) {
  openParkingModal();
  setTimeout(() => { el('pk-slot').value = slotId; }, 50);
}

function normalizeSlotId(value) {
  if (!value) return '';
  const normalized = value.trim().toUpperCase().replace(/\s+/g, '').replace(/_/g, '-');
  const match = normalized.match(/^([A-Z]+)[-]?0*([1-9][0-9]?)$/);
  return match ? `${match[1]}-${String(match[2]).padStart(2, '0')}` : value.trim().toUpperCase();
}

/* ─── Space Config Modal ─── */
function openSpaceConfigModal() {
  const conf = load(K.SPACES, []);
  renderSpaceConfigRows(conf);
  openModal('modal-space-config');
}

function renderSpaceConfigRows(conf) {
  const container = el('space-config-rows');
  container.innerHTML = '';
  conf.forEach((s, i) => {
    const row = document.createElement('div');
    row.className = 'space-config-row';
    row.innerHTML = `
      <input type="text" placeholder="Ej: A" value="${escH(s.section)}" data-idx="${i}" data-field="section" oninput="updateSpaceConfigRow(this)" maxlength="10" />
      <input type="number" placeholder="8" value="${s.count}" min="1" max="99" data-idx="${i}" data-field="count" oninput="updateSpaceConfigRow(this)" />
      <button class="btn-rm" onclick="removeSpaceRow(${i})" title="Eliminar">✕</button>
    `;
    container.appendChild(row);
  });
}

let _spaceConfigData = [];

function openSpaceConfigModalFull() {
  _spaceConfigData = JSON.parse(JSON.stringify(load(K.SPACES, [])));
  renderSpaceConfigRows(_spaceConfigData);
  openModal('modal-space-config');
}

function updateSpaceConfigRow(inp) {
  const idx   = parseInt(inp.dataset.idx);
  const field = inp.dataset.field;
  const conf  = load(K.SPACES, []);
  if (!conf[idx]) return;
  conf[idx][field] = field === 'count' ? Math.max(1, parseInt(inp.value) || 1) : inp.value;
  save(K.SPACES, conf);
}

function addSpaceRow() {
  const conf = load(K.SPACES, []);
  conf.push({ section: '', count: 8 });
  save(K.SPACES, conf);
  renderSpaceConfigRows(conf);
}

function removeSpaceRow(idx) {
  const conf = load(K.SPACES, []);
  conf.splice(idx, 1);
  save(K.SPACES, conf);
  renderSpaceConfigRows(conf);
}

function saveSpaceConfig() {
  // Validate all sections have a name
  const conf = load(K.SPACES, []);
  for (const s of conf) {
    if (!s.section.trim()) {
      toast('Todas las secciones deben tener nombre.', 'error');
      return;
    }
  }
  // Check duplicates
  const names = conf.map(s => s.section.trim().toUpperCase());
  if (new Set(names).size !== names.length) {
    toast('Hay secciones con el mismo nombre.', 'error');
    return;
  }
  save(K.SPACES, conf.map(s => ({ section: s.section.trim().toUpperCase(), count: Math.max(1, s.count) })));
  closeModal('modal-space-config');
  renderSpaces();
  toast('Espacios configurados', 'success');
}

/* ══════════════════════════════════════════
   VEHICLE TYPES
══════════════════════════════════════════ */
function renderVehicleTypes() {
  const q = (el('vt-search')?.value || '').toLowerCase();
  const all = load(K.TYPES, []);
  const filtered = all.filter(t =>
    t.code.toLowerCase().includes(q) || t.name.toLowerCase().includes(q)
  );

  el('vt-count').textContent = `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''}`;
  const tbody = el('vt-tbody');
  tbody.innerHTML = '';
  const empty = el('vt-empty');

  if (filtered.length === 0) {
    el('vt-table').style.display = 'none';
    empty.classList.remove('hidden');
    return;
  }
  el('vt-table').style.display = '';
  empty.classList.add('hidden');

  filtered.forEach(t => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="mono">${escH(t.code)}</span></td>
      <td>${escH(t.name)}</td>
      <td><span class="mono">${formatCurrency(t.rate)}/hr</span></td>
      <td>
        <div class="actions">
          <button class="btn-icon btn-icon--blue" title="Editar" onclick="openVehicleTypeModal('${t.id}')">✏️</button>
          <button class="btn-icon btn-icon--danger" title="Eliminar" onclick="deleteVehicleType('${t.id}')">🗑</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openVehicleTypeModal(id) {
  el('vt-id').value = id || '';
  el('vt-code').value = ''; el('vt-name').value = ''; el('vt-rate').value = '';
  ['vt-code-err','vt-name-err','vt-rate-err'].forEach(clearErr);
  el('modal-vt-title').textContent = id ? 'Editar tipo de vehículo' : 'Nuevo tipo de vehículo';
  if (id) {
    const t = load(K.TYPES, []).find(x => x.id === id);
    if (t) { el('vt-code').value = t.code; el('vt-name').value = t.name; el('vt-rate').value = t.rate; }
  }
  openModal('modal-vt');
}

function saveVehicleType() {
  const id   = el('vt-id').value;
  const code = el('vt-code').value.trim().toUpperCase();
  const name = el('vt-name').value.trim();
  const rate = parseFloat(el('vt-rate').value);
  let ok = true;
  ['vt-code-err','vt-name-err','vt-rate-err'].forEach(clearErr);
  if (!code) { setErr('vt-code-err', 'El código es obligatorio.'); ok = false; }
  if (!name) { setErr('vt-name-err', 'El nombre es obligatorio.'); ok = false; }
  if (!el('vt-rate').value || isNaN(rate) || rate < 0) {
    setErr('vt-rate-err', 'Ingresa una tarifa válida.'); ok = false;
  }
  if (!ok) return;
  const types = load(K.TYPES, []);
  if (types.find(t => t.code === code && t.id !== id)) {
    setErr('vt-code-err', 'Ese código ya existe.'); return;
  }
  if (id) {
    const i = types.findIndex(t => t.id === id);
    if (i >= 0) types[i] = { ...types[i], code, name, rate };
  } else {
    types.push({ id: uid(), code, name, rate });
  }
  save(K.TYPES, types);
  renderVehicleTypes();
  closeModal('modal-vt');
  toast(id ? 'Tipo actualizado' : 'Tipo creado', 'success');
}

function deleteVehicleType(id) {
  const t = load(K.TYPES, []).find(x => x.id === id);
  if (!t) return;
  if (load(K.PARKING, []).some(r => r.typeId === id)) {
    toast('No se puede eliminar: tipo en uso en parqueo.', 'error'); return;
  }
  confirmDialog(`¿Eliminar el tipo "${t.name}"? Esta acción no se puede deshacer.`, () => {
    save(K.TYPES, load(K.TYPES, []).filter(x => x.id !== id));
    renderVehicleTypes();
    toast('Tipo eliminado', 'success');
  });
}

/* ══════════════════════════════════════════
   PARKING SERVICE
══════════════════════════════════════════ */
function renderParking() {
  const q      = (el('pk-search')?.value || '').toLowerCase();
  const status = el('pk-status')?.value || '';
  const types  = load(K.TYPES, []);
  const all    = load(K.PARKING, []);

  const filtered = all.filter(r => {
    const matchQ = r.plate.toLowerCase().includes(q) || r.slot.toLowerCase().includes(q);
    const matchS = !status || (status === 'active' ? !r.exitTime : !!r.exitTime);
    return matchQ && matchS;
  }).sort((a, b) => b.createdAt - a.createdAt);

  el('pk-count').textContent = `${filtered.length} registro${filtered.length !== 1 ? 's' : ''}`;
  const tbody = el('pk-tbody');
  tbody.innerHTML = '';
  const empty = el('pk-empty');

  if (filtered.length === 0) {
    el('pk-table').style.display = 'none';
    empty.classList.remove('hidden');
    return;
  }
  el('pk-table').style.display = '';
  empty.classList.add('hidden');

  filtered.forEach(r => {
    const t = types.find(x => x.id === r.typeId);
    const isActive = !r.exitTime;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="plate-tag">${escH(r.plate)}</span></td>
      <td>${t ? escH(t.name) : '<span style="color:var(--text3)">—</span>'}</td>
      <td><span class="mono">${escH(r.slot)}</span></td>
      <td>${formatDate(r.date)}</td>
      <td><span class="mono">${r.entryTime}</span></td>
      <td>${r.exitTime ? `<span class="mono">${r.exitTime}</span>` : '<span class="badge badge--green">En curso</span>'}</td>
      <td>${r.cost != null ? `<span class="mono" style="color:var(--accent)">${formatCurrency(r.cost)}</span>` : '—'}</td>
      <td>${isActive ? '<span class="badge badge--green">Activo</span>' : '<span class="badge badge--gray">Finalizado</span>'}</td>
      <td>
        <div class="actions">
          ${isActive ? `<button class="btn-icon btn-icon--green" title="Registrar salida" onclick="registerExit('${r.id}')">✅</button>` : ''}
          <button class="btn-icon btn-icon--blue" title="Editar" onclick="openParkingModal('${r.id}')">✏️</button>
          <button class="btn-icon btn-icon--danger" title="Eliminar" onclick="deleteParking('${r.id}')">🗑</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openParkingModal(id) {
  el('pk-id').value    = id || '';
  el('pk-plate').value = '';
  el('pk-slot').value  = '';
  el('pk-date').value  = today();
  el('pk-entry').value = nowTime();
  el('pk-exit').value  = '';
  ['pk-plate-err','pk-slot-err','pk-type-err','pk-date-err','pk-entry-err','pk-exit-err'].forEach(clearErr);
  el('modal-pk-title').textContent = id ? 'Editar registro' : 'Registrar entrada';

  const types = load(K.TYPES, []);
  const sel = el('pk-type');
  sel.innerHTML = '<option value="">Seleccionar…</option>';
  types.forEach(t => {
    const o = document.createElement('option');
    o.value = t.id; o.textContent = `${t.name} (${formatCurrency(t.rate)}/hr)`;
    sel.appendChild(o);
  });

  if (id) {
    const r = load(K.PARKING, []).find(x => x.id === id);
    if (r) {
      el('pk-plate').value = r.plate;
      el('pk-slot').value  = r.slot;
      el('pk-date').value  = r.date;
      el('pk-entry').value = r.entryTime;
      el('pk-exit').value  = r.exitTime || '';
      sel.value = r.typeId;
    }
  }
  openModal('modal-pk');
}

function saveParking() {
  const id     = el('pk-id').value;
  const plate  = el('pk-plate').value.trim().toUpperCase();
  const slot   = normalizeSlotId(el('pk-slot').value);
  const typeId = el('pk-type').value;
  const date   = el('pk-date').value;
  const entry  = el('pk-entry').value;
  const exit   = el('pk-exit').value;
  let ok = true;

  ['pk-plate-err','pk-slot-err','pk-type-err','pk-date-err','pk-entry-err','pk-exit-err'].forEach(clearErr);

  if (!plate) {
    setErr('pk-plate-err', 'La placa es obligatoria.');
    ok = false;
  }
  
  if (
    plate &&
    typeId &&
    !isValidPlate(
      plate,
      load(K.TYPES, []).find(t => t.id === typeId)?.code
    )
  ) {
    setErr('pk-plate-err', 'Formato inválido (Ej: P001BBB). Use 3 números (001-999) y 3 consonantes.');
    ok = false;
  }

  if (!slot) {
    setErr('pk-slot-err', 'La ranura es obligatoria.');
    ok = false;
  } else if (!isSlotDefined(slot)) {
    setErr('pk-slot-err', 'La ranura no existe en la configuración.');
    ok = false;
  }

  if (!typeId) { setErr('pk-type-err', 'Selecciona el tipo de vehículo.'); ok = false; }
  if (!date)   { setErr('pk-date-err', 'La fecha es obligatoria.'); ok = false; }
  if (!entry)  { setErr('pk-entry-err', 'La hora de entrada es obligatoria.'); ok = false; }
  if (exit && entry && exit <= entry) {
    setErr('pk-exit-err', 'La salida debe ser posterior a la entrada.'); ok = false;
  }

  const records = load(K.PARKING, []);
  // Validar duplicados de placa activa
  if (ok && records.some(r => r.plate.toUpperCase() === plate && !r.exitTime && r.id !== id)) {
    setErr('pk-plate-err', 'Este vehículo ya se encuentra en el parqueo.');
    ok = false;
  }
  
  // Validar duplicados de ranura ocupada
  if (ok && records.some(r => r.slot.toUpperCase() === slot && !r.exitTime && r.id !== id)) {
    setErr('pk-slot-err', 'Esta ranura ya está siendo utilizada.');
    ok = false;
  }

  if (!ok) return;

  const t = load(K.TYPES, []).find(x => x.id === typeId);
  let cost = null;
  if (exit && entry) {
    const mins = timeDiffMinutes(entry, exit);
    cost = Math.ceil(mins / 60) * (t ? t.rate : 0);
  }

  if (id) {
    const i = records.findIndex(r => r.id === id);
    if (i >= 0) records[i] = { ...records[i], plate, slot, typeId, date, entryTime: entry, exitTime: exit || null, cost };
  } else {
    records.push({ id: uid(), plate, slot, typeId, date, entryTime: entry, exitTime: exit || null, cost, createdAt: Date.now() });
  }
  save(K.PARKING, records);
  renderDashboard();
  renderParking();
  // Refresh spaces if visible
  if (el('section-spaces').classList.contains('active')) renderSpaces();
  closeModal('modal-pk');
  toast(id ? 'Registro actualizado' : 'Vehículo registrado', 'success');
}

function registerExit(id) {
  const records = load(K.PARKING, []);
  const r = records.find(x => x.id === id);
  if (!r) return;
  const types = load(K.TYPES, []);
  const t = types.find(x => x.id === r.typeId);
  const exitTime = nowTime();

  if (exitTime <= r.entryTime) {
    toast('La hora de salida debe ser posterior a la entrada.', 'error'); return;
  }

  const mins  = timeDiffMinutes(r.entryTime, exitTime);
  const hours = Math.ceil(mins / 60);
  const cost  = hours * (t ? t.rate : 0);

  el('cost-body').innerHTML = `
    <div class="cost-card">
      <div class="cost-row"><span class="cost-row__label">Placa</span><span class="cost-row__value plate-tag">${escH(r.plate)}</span></div>
      <div class="cost-row"><span class="cost-row__label">Tipo</span><span class="cost-row__value">${t ? escH(t.name) : '—'}</span></div>
      <div class="cost-row"><span class="cost-row__label">Ranura</span><span class="cost-row__value mono">${escH(r.slot)}</span></div>
      <div class="cost-row"><span class="cost-row__label">Hora entrada</span><span class="cost-row__value mono">${r.entryTime}</span></div>
      <div class="cost-row"><span class="cost-row__label">Hora salida</span><span class="cost-row__value mono">${exitTime}</span></div>
      <div class="cost-row"><span class="cost-row__label">Tiempo</span><span class="cost-row__value mono">${hours} hora${hours !== 1 ? 's' : ''} (${mins} min)</span></div>
      <div class="cost-row"><span class="cost-row__label">Tarifa</span><span class="cost-row__value mono">${formatCurrency(t ? t.rate : 0)}/hr</span></div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;background:var(--bg3);border:1px solid var(--border2);border-radius:var(--radius);padding:1.25rem 1.5rem;">
      <span style="font-size:.85rem;color:var(--text3);text-transform:uppercase;letter-spacing:.1em;">Total a cobrar</span>
      <span class="cost-total">${formatCurrency(cost)}</span>
    </div>
  `;

  el('cost-confirm-btn').onclick = () => {
    const i = records.findIndex(x => x.id === id);
    if (i >= 0) { records[i].exitTime = exitTime; records[i].cost = cost; }
    save(K.PARKING, records);
    renderParking();
    renderDashboard();
    if (el('section-spaces').classList.contains('active')) renderSpaces();
    closeModal('modal-cost');
    toast(`Servicio finalizado: ${formatCurrency(cost)}`, 'success');
  };
  openModal('modal-cost');
}

function deleteParking(id) {
  const r = load(K.PARKING, []).find(x => x.id === id);
  if (!r) return;
  confirmDialog(`¿Eliminar el registro de la placa "${r.plate}" (Slot ${r.slot})?`, () => {
    save(K.PARKING, load(K.PARKING, []).filter(x => x.id !== id));
    renderParking();
    if (el('section-spaces').classList.contains('active')) renderSpaces();
    toast('Registro eliminado', 'success');
  });
}

/* ══════════════════════════════════════════
   MODAL HELPERS
══════════════════════════════════════════ */
function openModal(id)  { el(id).classList.remove('hidden'); document.body.style.overflow = 'hidden'; }
function closeModal(id) { el(id).classList.add('hidden');    document.body.style.overflow = ''; }

document.querySelectorAll('.modal-backdrop').forEach(bd => {
  bd.addEventListener('click', e => { if (e.target === bd) closeModal(bd.id); });
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-backdrop:not(.hidden)').forEach(m => closeModal(m.id));
  }
});

let _confirmCb = null;
function confirmDialog(msg, cb) {
  el('confirm-message').textContent = msg;
  _confirmCb = cb;
  openModal('modal-confirm');
}
el('confirm-ok-btn').addEventListener('click', () => {
  if (_confirmCb) _confirmCb();
  _confirmCb = null;
  closeModal('modal-confirm');
});

/* ══════════════════════════════════════════
   TOAST
══════════════════════════════════════════ */
function toast(msg, type = 'info') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const t = document.createElement('div');
  t.className = `toast toast--${type}`;
  t.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  el('toast-container').appendChild(t);
  setTimeout(() => { t.classList.add('toast--out'); setTimeout(() => t.remove(), 350); }, 3500);
}

/* ══════════════════════════════════════════
   VALIDATION
══════════════════════════════════════════ */
function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

function isSlotDefined(slotId) {
  const config = load(K.SPACES, []);
  for (const sec of config) {
    for (let i = 1; i <= sec.count; i++) {
      if (`${sec.section}-${String(i).padStart(2, '0')}` === slotId) return true;
    }
  }
  return false;
}

function isValidPlate(plate, typeCode) {
  plate = plate.trim().toUpperCase();
  // Consonantes permitidas: Sin vocales (A,E,I,O,U) y sin Ñ
  const c = "BCDFGHJKLMNPQRSTVWXYZ";
  // Formato: 3 dígitos (001-999) + 3 consonantes
  const suffix = `(?!000)\\d{3}[${c}]{3}$`;

  switch(typeCode) {
    case 'MOT':  return new RegExp('^M' + suffix).test(plate);  // Motocicleta
    case 'AUTO': return new RegExp('^P' + suffix).test(plate);  // Particular
    case 'CAM':  return new RegExp('^C' + suffix).test(plate);  // Comercial/Carga
    case 'BUS':  return new RegExp('^A' + suffix).test(plate);  // Alquiler
    case 'OFC':  return new RegExp('^O' + suffix).test(plate);  // Oficial
    default:
      return true;
  }
}function setErr(id, msg)  { const e = el(id); if (e) e.textContent = msg; }
function clearErr(id)     { const e = el(id); if (e) e.textContent = ''; }
function escH(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function timeDiffMinutes(t1, t2) {
  const [h1, m1] = t1.split(':').map(Number);
  const [h2, m2] = t2.split(':').map(Number);
  return (h2 * 60 + m2) - (h1 * 60 + m1);
}

/* ══════════════════════════════════════════
   DATE / TIME
══════════════════════════════════════════ */
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
/* BLOQUEO DE FECHA */
document.addEventListener('DOMContentLoaded', () => {

  const dateInput = el('pk-date');

  if (dateInput) {

    dateInput.readOnly = true;

    dateInput.addEventListener('keydown', e => {
      e.preventDefault();
    });

    dateInput.addEventListener('paste', e => {
      e.preventDefault();
    });
  }
});

/* ══════════════════════════════════════════
   BOOT
══════════════════════════════════════════ */
(function boot() {
  initData();
  el('login-hero-img').src = rand(IMAGES.loginHero);
  if (sessionStorage.getItem('cp_auth') === '1') goToApp();
})();

/* ABRIR REPORTES */

function openEntryReport() {
  document.querySelectorAll('.sidebar__nav-item').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const reportSection = document.getElementById('section-entry-report');
  if (reportSection) reportSection.classList.add('active');
  generateReport();
}

function openDashboard() {
  document.querySelectorAll('.sidebar__nav-item').forEach(b => b.classList.remove('active'));
  const dashboardBtn = document.querySelector('.sidebar__nav-item[data-section="dashboard"]');
  if (dashboardBtn) dashboardBtn.classList.add('active');
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const dashboardSection = document.getElementById('section-dashboard');
  if (dashboardSection) dashboardSection.classList.add('active');
  renderDashboard();
}

function clearReportView() {
  const tbody = document.getElementById('report-body');
  const totalVehiclesEl = document.getElementById('total-vehicles');
  const totalIncomeEl = document.getElementById('total-income');
  const statusEl = document.getElementById('report-status');

  if (tbody) tbody.innerHTML = '';
  if (totalVehiclesEl) totalVehiclesEl.textContent = '0';
  if (totalIncomeEl) totalIncomeEl.textContent = 'Q 0.00';
  if (statusEl) statusEl.textContent = 'Seleccione un rango de fechas y presione Generar reporte.';
}

function generateReport() {
  const startDate = document.getElementById('report-start-date').value;
  const endDate = document.getElementById('report-end-date').value;
  const tbody = document.getElementById('report-body');
  const totalVehiclesEl = document.getElementById('total-vehicles');
  const totalIncomeEl = document.getElementById('total-income');
  const statusEl = document.getElementById('report-status');

  tbody.innerHTML = '';
  totalVehiclesEl.textContent = '0';
  totalIncomeEl.textContent = 'Q 0.00';
  if (statusEl) statusEl.textContent = '';

  const records = load(K.PARKING, []);
  const types = load(K.TYPES, []);

  if (!startDate || !endDate) {
    if (statusEl) {
      statusEl.textContent = 'Seleccione fecha inicial y fecha final para generar el reporte.';
    }
    return;
  }

  if (startDate > endDate) {
    if (statusEl) {
      statusEl.textContent = 'La fecha inicial no puede ser posterior a la fecha final.';
    }
    return;
  }

  if (!records.length) {
    if (statusEl) statusEl.textContent = 'No existen registros de parqueo en el sistema.';
    return;
  }

  const filteredRecords = records.filter(record => {
    const recDate = _dateToISO(record.date) || _dateToISO(record.createdAt);
    if (!recDate) return false;
    return recDate >= startDate && recDate <= endDate;
  });

  if (!filteredRecords.length) {
    if (statusEl) statusEl.textContent = `No hay servicios entre ${startDate} y ${endDate}.`;
    return;
  }

  const summaryByPlate = {};
  let totalRevenue = 0;

  filteredRecords.forEach(record => {
    const plate = (record.plate || '').toString().toUpperCase();
    const typeName = (types.find(type => type.id === record.typeId) || {}).name || 'Desconocido';
    const entryMin = _parseTimeToMinutes(record.entryTime);
    const exitMin = record.exitTime ? _parseTimeToMinutes(record.exitTime) : _getNowMinutes();
    const elapsedMinutes = Math.max(0, exitMin - entryMin);
    const hours = Math.ceil(elapsedMinutes / 60);
    const value = Number(record.cost || 0);

    totalRevenue += value;

    if (!summaryByPlate[plate]) {
      summaryByPlate[plate] = {
        plate,
        typeName,
        hours: 0,
        total: 0,
      };
    }

    summaryByPlate[plate].hours += hours;
    summaryByPlate[plate].total += value;
  });

  if (totalVehiclesEl) totalVehiclesEl.textContent = filteredRecords.length;
  if (totalIncomeEl) totalIncomeEl.textContent = formatCurrency(totalRevenue);

  Object.values(summaryByPlate).forEach(entry => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><span class="plate-tag">${entry.plate}</span></td>
      <td>${entry.typeName}</td>
      <td>${entry.hours} h</td>
      <td style="font-weight: bold; color: #2dd686;">${formatCurrency(entry.total)}</td>
    `;
    if (tbody) tbody.appendChild(row);
  });

  if (statusEl) {
    statusEl.textContent = `Se encontraron ${filteredRecords.length} servicios.`;
  }
}
