// Hex to RGB converter
export function hexToRgb(hex) {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(char => char + char).join('');
  }
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

// Adjust lightness of hex color
export function adjustLightness(hex, percent) {
  const { r, g, b } = hexToRgb(hex);
  const factor = percent / 100;

  const newR = Math.min(255, Math.max(0, Math.round(r + (percent > 0 ? (255 - r) * factor : r * factor))));
  const newG = Math.min(255, Math.max(0, Math.round(g + (percent > 0 ? (255 - g) * factor : g * factor))));
  const newB = Math.min(255, Math.max(0, Math.round(b + (percent > 0 ? (255 - b) * factor : b * factor))));

  return `#${((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1)}`;
}

// Get contrasting text color (white or dark) based on background luminance
export function getContrastColor(hex) {
  const { r, g, b } = hexToRgb(hex);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq >= 128 ? '#111827' : '#ffffff';
}

// Apply colors directly to root document styles
export function applyThemeToDOM(primary, secondary) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // Primary variations
  const primaryHover = adjustLightness(primary, -15);
  const primaryLight = adjustLightness(primary, 25);
  const primarySoft = adjustLightness(primary, 85);
  const primaryContrast = getContrastColor(primary);

  // Secondary variations
  const secondaryHover = adjustLightness(secondary, -15);
  const secondaryLight = adjustLightness(secondary, 25);
  const secondarySoft = adjustLightness(secondary, 85);
  const secondaryContrast = getContrastColor(secondary);

  root.style.setProperty('--color-primary', primary);
  root.style.setProperty('--color-primary-hover', primaryHover);
  root.style.setProperty('--color-primary-light', primaryLight);
  root.style.setProperty('--color-primary-soft', primarySoft);
  root.style.setProperty('--color-primary-contrast', primaryContrast);

  root.style.setProperty('--color-secondary', secondary);
  root.style.setProperty('--color-secondary-hover', secondaryHover);
  root.style.setProperty('--color-secondary-light', secondaryLight);
  root.style.setProperty('--color-secondary-soft', secondarySoft);
  root.style.setProperty('--color-secondary-contrast', secondaryContrast);
}
