/**
 * Escapes special characters in a string to prevent XSS attacks
 * when inserting data into HTML sinks (like Leaflet popups).
 */
export const escapeHTML = (str: string | undefined): string => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};
