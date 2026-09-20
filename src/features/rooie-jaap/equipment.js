/**
 * Generates HTML for Rooie Jaap equipment reference documentation.
 */

/**
 * Returns HTML string for Jaap's equipment reference documentation table and notes.
 * @param {Object} contentEquipment - rooieJaapEquipment object from contentData
 * @param {string} lang - Current language ('nl'|'en')
 * @param {Object} equipmentRef - equipmentReferences object from fundraiser item in fundraisers.json
 * @returns {string} HTML string
 */
export function createRooieJaapEquipmentHTML(contentEquipment, lang, equipmentRef) {
  if (!contentEquipment || !equipmentRef || !equipmentRef.items) return '';

  const locale = lang === 'en' ? 'en-US' : 'nl-NL';
  const formatPrice = (val) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(val);

  const totalAmount = equipmentRef.items.reduce((sum, item) => sum + item.price, 0);

  const rowsHTML = equipmentRef.items.map(item => `
    <tr>
      <td>${item.name[lang] || item.name.nl}</td>
      <td class="price-cell">${formatPrice(item.price)}</td>
    </tr>
  `).join('');

  const titleText = contentEquipment.title ? (contentEquipment.title[lang] || contentEquipment.title.nl) : '';
  const introText = contentEquipment.intro ? (contentEquipment.intro[lang] || contentEquipment.intro.nl) : '';
  const totalLabelText = contentEquipment.totalLabel ? (contentEquipment.totalLabel[lang] || contentEquipment.totalLabel.nl) : '';
  const noteText = contentEquipment.note ? (contentEquipment.note[lang] || contentEquipment.note.nl) : '';
  const itemHeader = contentEquipment.tableHeaders?.item ? (contentEquipment.tableHeaders.item[lang] || contentEquipment.tableHeaders.item.nl) : '';
  const priceHeader = contentEquipment.tableHeaders?.price ? (contentEquipment.tableHeaders.price[lang] || contentEquipment.tableHeaders.price.nl) : '';

  return `
    <div class="equipment-documentation-wrapper">
      <h4 class="equipment-section-title">${titleText}</h4>
      <p class="equipment-section-intro">${introText}</p>
      <div class="equipment-table-wrapper">
        <table class="equipment-table">
          <thead>
            <tr>
              <th scope="col">${itemHeader}</th>
              <th scope="col" class="price-cell">${priceHeader}</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHTML}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <th scope="row">${totalLabelText}</th>
              <td class="price-cell"><strong>${formatPrice(totalAmount)}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p class="equipment-note">${noteText}</p>
    </div>
  `;
}
