/**
 * Renders the Rooie Jaap equipment table and note into the designated container.
 * @param {Object} contentEquipment
 * @param {string} lang
 * @param {Object} fundraisersData
 */
export function renderRooieJaapEquipment(contentEquipment, lang, fundraisersData) {
  const container = document.getElementById('rooie-jaap-equipment-container');
  if (!container || !contentEquipment) return;

  const rooieJaapFundraiser = fundraisersData?.fundraisers?.find(f => f.id === 'rooie-jaap-knives');
  const equipmentRef = rooieJaapFundraiser?.equipmentReferences;

  if (!equipmentRef || !equipmentRef.items) return;

  const locale = lang === 'en' ? 'en-US' : 'nl-NL';
  const formatPrice = (val) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(val);

  const totalAmount = equipmentRef.items.reduce((sum, item) => sum + item.price, 0);

  const rowsHTML = equipmentRef.items.map(item => `
    <tr>
      <td>${item.name[lang] || item.name.nl}</td>
      <td class="price-cell">${formatPrice(item.price)}</td>
    </tr>
  `).join('');

  container.innerHTML = `
    <table class="equipment-table">
      <thead>
        <tr>
          <th scope="col">${contentEquipment.tableHeaders.item[lang]}</th>
          <th scope="col" class="price-cell">${contentEquipment.tableHeaders.price[lang]}</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHTML}
      </tbody>
      <tfoot>
        <tr class="total-row">
          <th scope="row">${contentEquipment.totalLabel[lang]}</th>
          <td class="price-cell"><strong>${formatPrice(totalAmount)}</strong></td>
        </tr>
      </tfoot>
    </table>
    <p class="equipment-note">${contentEquipment.note[lang]}</p>
  `;
}
