export function getDonateUrl(item) {
  if (!item) return '';
  if (item.donateUrl) return item.donateUrl;
  if (item.slug) {
    return `https://whydonate.com/nl/donate/${item.slug}`;
  }
  if (item.url && item.url.includes('/fundraising/')) {
    return item.url.replace('/fundraising/', '/donate/');
  }
  return item.url || '';
}
