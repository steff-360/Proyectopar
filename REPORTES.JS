/* ======================================
   REPORTES — Generación de reporte visible
   ====================================== */

function _parseTimeToMinutes(time) {
  if (!time) return 0;
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function _getNowMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function _parseDateString(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
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

function generateReport() {
  const startDateVal = document.getElementById('start-date').value;
  const endDateVal = document.getElementById('end-date').value;
  const tbody = document.getElementById('report-body');
  const totalVehiclesEl = document.getElementById('total-vehicles');
  const totalIncomeEl = document.getElementById('total-income');
  const statusEl = document.getElementById('report-status');

  tbody.innerHTML = '';
  totalVehiclesEl.textContent = '0';
  totalIncomeEl.textContent = 'Q 0.00';
  if (statusEl) statusEl.textContent = 'Cargando...';

  const records = JSON.parse(localStorage.getItem('cp_parking')) || [];
  const types = JSON.parse(localStorage.getItem('cp_vehicle_types')) || [];

  if (records.length === 0) {
    if (statusEl) statusEl.textContent = 'No existen registros en el sistema.';
    return;
  }

  const startDateISO = startDateVal || null;
  const endDateISO = endDateVal || null;

  const filteredRecords = records.filter(r => {
    if (!r) return false;
    const recordDate = _dateToISO(r.date) || _dateToISO(r.createdAt);
    if (!recordDate) return false;
    if (startDateISO && recordDate < startDateISO) return false;
    if (endDateISO && recordDate > endDateISO) return false;
    return true;
  });

  if (filteredRecords.length === 0) {
    const validCount = records.filter(r => _dateToISO(r.date) || _dateToISO(r.createdAt)).length;
    if (statusEl) {
      statusEl.textContent = `No hay registros en el rango. Registros totales: ${records.length}. Registros con fecha válida: ${validCount}.`;
    }
    return;
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const nowMin = _getNowMinutes();
  let grandTotalIncome = 0;
  const summaryMap = {};

  filteredRecords.forEach(r => {
    const plate = (r.plate || '').toString().toUpperCase();
    const typeName = (types.find(t => t.id === r.typeId) || {}).name || 'Desconocido';
    const entryMin = _parseTimeToMinutes(r.entryTime);
    const exitMin = r.exitTime
      ? _parseTimeToMinutes(r.exitTime)
      : (r.date === todayStr ? nowMin : 23 * 60 + 59);

    let diffMins = exitMin - entryMin;
    if (diffMins < 0) diffMins = 0;
    const hours = Math.max(0, Math.ceil(diffMins / 60));
    const cost = r.exitTime ? Number(r.cost || 0) : 0;
    grandTotalIncome += cost;

    if (!summaryMap[plate]) {
      summaryMap[plate] = { plate, typeName, hours: 0, total: 0 };
    }
    summaryMap[plate].hours += hours;
    summaryMap[plate].total += cost;
  });

  totalVehiclesEl.textContent = filteredRecords.length;
  totalIncomeEl.textContent = `Q ${grandTotalIncome.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`;

  Object.values(summaryMap).forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><span class="plate-tag">${item.plate}</span></td>
      <td>${item.typeName}</td>
      <td>${item.hours} h</td>
      <td style="font-weight: bold; color: #2dd686;">Q ${item.total.toFixed(2)}</td>
    `;
    tbody.appendChild(row);
  });

  if (statusEl) {
    statusEl.textContent = `Registros mostrados: ${filteredRecords.length}`;
  }

  console.log('Reporte generado con éxito.');
}

window.generateReport = generateReport;
window.addEventListener('DOMContentLoaded', generateReport);
