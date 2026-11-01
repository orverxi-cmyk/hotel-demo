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
export function applyThemeToDOM(themeOrPrimary, secondaryArg) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  let primary = '#0f2b48';
  let secondary = '#c5a059';
  let primaryHover = null;
  let primaryActive = null;
  let secondaryHover = null;
  let secondaryActive = null;
  let backgroundColor = '#fdfbf7';
  let surfaceColor = '#ffffff';
  let activeColor = null;

  if (typeof themeOrPrimary === 'object' && themeOrPrimary !== null) {
    primary = themeOrPrimary.primaryColor || '#0f2b48';
    secondary = themeOrPrimary.secondaryColor || '#c5a059';
    primaryHover = themeOrPrimary.primaryHoverColor || null;
    primaryActive = themeOrPrimary.primaryActiveColor || null;
    secondaryHover = themeOrPrimary.secondaryHoverColor || themeOrPrimary.hoverColor || null;
    secondaryActive = themeOrPrimary.secondaryActiveColor || themeOrPrimary.activeColor || null;
    backgroundColor = themeOrPrimary.backgroundColor || '#fdfbf7';
    surfaceColor = themeOrPrimary.surfaceColor || '#ffffff';
    activeColor = themeOrPrimary.activeColor || secondaryActive || null;
  } else {
    primary = themeOrPrimary || '#0f2b48';
    secondary = secondaryArg || '#c5a059';
  }

  // Fallbacks if custom hover/active not specified
  if (!primaryHover) primaryHover = adjustLightness(primary, -15);
  if (!primaryActive) primaryActive = adjustLightness(primary, -25);
  if (!secondaryHover) secondaryHover = adjustLightness(secondary, -15);
  if (!secondaryActive) secondaryActive = activeColor || adjustLightness(secondary, -25);
  if (!activeColor) activeColor = secondaryActive;

  // Primary variations
  const primaryLight = adjustLightness(primary, 25);
  const primarySoft = adjustLightness(primary, 85);
  const primaryContrast = getContrastColor(primary);

  // Secondary variations
  const secondaryLight = adjustLightness(secondary, 25);
  const secondarySoft = adjustLightness(secondary, 85);
  const secondaryContrast = getContrastColor(secondary);

  // Background contrast
  const bgContrast = getContrastColor(backgroundColor);
  const surfaceContrast = getContrastColor(surfaceColor);

  // Primary variables
  root.style.setProperty('--color-primary', primary);
  root.style.setProperty('--color-primary-hover', primaryHover);
  root.style.setProperty('--color-primary-active', primaryActive);
  root.style.setProperty('--color-primary-light', primaryLight);
  root.style.setProperty('--color-primary-soft', primarySoft);
  root.style.setProperty('--color-primary-contrast', primaryContrast);

  // Secondary / Accent variables
  root.style.setProperty('--color-secondary', secondary);
  root.style.setProperty('--color-secondary-hover', secondaryHover);
  root.style.setProperty('--color-secondary-active', secondaryActive);
  root.style.setProperty('--color-secondary-light', secondaryLight);
  root.style.setProperty('--color-secondary-soft', secondarySoft);
  root.style.setProperty('--color-secondary-contrast', secondaryContrast);

  // Background & Surface variables
  root.style.setProperty('--color-background', backgroundColor);
  root.style.setProperty('--color-bg', backgroundColor);
  root.style.setProperty('--color-surface', surfaceColor);
  root.style.setProperty('--color-text-main', bgContrast);
  root.style.setProperty('--color-text-surface', surfaceContrast);

  // General Hover & Active aliases
  root.style.setProperty('--color-hover', secondaryHover);
  root.style.setProperty('--color-active', activeColor);

  // Apply directly to body element
  if (document.body) {
    document.body.style.backgroundColor = backgroundColor;
    document.body.style.color = bgContrast === '#ffffff' ? '#f1f5f9' : '#1e293b';
  }
}
