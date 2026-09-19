/**
 * Owns loading of application data files:
 * - data/fundraisers.json
 * - data/content.json
 * - data/donors.json
 */
export async function loadAppData() {
  const [fundraisersRes, contentRes, donorsRes] = await Promise.all([
    fetch('data/fundraisers.json'),
    fetch('data/content.json'),
    fetch('data/donors.json').catch(err => {
      console.warn('Could not fetch donors.json:', err);
      return { ok: false };
    })
  ]);

  if (!fundraisersRes.ok || !contentRes.ok) {
    throw new Error('Failed to load application data files');
  }

  const fundraisersData = await fundraisersRes.json();
  const contentData = await contentRes.json();
  let donorsData = { donors: [] };

  if (donorsRes && donorsRes.ok) {
    donorsData = await donorsRes.json();
  }

  return { fundraisersData, contentData, donorsData };
}
