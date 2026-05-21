/* reports.js */

/* ═══════════════════════════════════════
   GENERAR REPORTE
═══════════════════════════════════════ */

function generateReport(){

    const startDate =
      document.getElementById('start-date').value;
  
    const endDate =
      document.getElementById('end-date').value;
  
    if(!startDate || !endDate){
  
      alert('Debe seleccionar ambas fechas');
      return;
  
    }
  
    // OBTENER DATOS
    const parkingRecords =
      JSON.parse(localStorage.getItem('parkingRecords')) || [];
  
    // FILTRAR REGISTROS
    const filteredRecords = parkingRecords.filter(record => {
  
      const recordDate = new Date(record.entry);
  
      return recordDate >= new Date(startDate)
          && recordDate <= new Date(endDate + 'T23:59:59');
  
    });
  
    if(filteredRecords.length === 0){
  
      alert('No existen registros en ese rango');
  
    }
  
    let totalVehicles = filteredRecords.length;
    let totalIncome = 0;
  
    const groupedVehicles = {};
  
    filteredRecords.forEach(record => {
  
      const plate = record.plate;
  
      if(!groupedVehicles[plate]){
  
        groupedVehicles[plate] = {
  
          plate : record.plate,
          type  : record.type,
          hours : 0,
          total : 0
  
        };
  
      }
  
      const hours =
        parseFloat(record.hours || 0);
  
      const total =
        parseFloat(record.total || 0);
  
      groupedVehicles[plate].hours += hours;
      groupedVehicles[plate].total += total;
  
      totalIncome += total;
  
    });
  
    // ACTUALIZAR TARJETAS
    document.getElementById('total-vehicles')
      .textContent = totalVehicles;
  
    document.getElementById('total-income')
      .textContent = `Q${totalIncome.toFixed(2)}`;
  
    // TABLA
    const tbody =
      document.getElementById('report-body');
  
    tbody.innerHTML = '';
  
    Object.values(groupedVehicles).forEach(vehicle => {
  
      tbody.innerHTML += `
  
        <tr>
  
          <td>${vehicle.plate}</td>
  
          <td>${vehicle.type}</td>
  
          <td>${vehicle.hours.toFixed(1)} hrs</td>
  
          <td>Q${vehicle.total.toFixed(2)}</td>
  
        </tr>
  
      `;
  
    });
  
  }