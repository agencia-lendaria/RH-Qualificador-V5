import { ColorTheme } from '../types';

// Calculate relative luminance according to WCAG guidelines
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Calculate contrast ratio between two colors
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// Check if contrast meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
export function meetsWCAGAA(foreground: string, background: string, isLargeText = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

// Check if contrast meets WCAG AAA standards (7:1 for normal text, 4.5:1 for large text)
export function meetsWCAGAAA(foreground: string, background: string, isLargeText = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

// Convert hex to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Convert RGB to hex
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Lighten or darken a color by a percentage
export function adjustBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const adjust = (color: number) => {
    const adjusted = Math.round(color * (1 + percent / 100));
    return Math.max(0, Math.min(255, adjusted));
  };

  return rgbToHex(adjust(rgb.r), adjust(rgb.g), adjust(rgb.b));
}

// Generate a color palette from a base color
export function generatePalette(baseColor: string): {
  lighter: string;
  light: string;
  base: string;
  dark: string;
  darker: string;
} {
  return {
    lighter: adjustBrightness(baseColor, 40),
    light: adjustBrightness(baseColor, 20),
    base: baseColor,
    dark: adjustBrightness(baseColor, -20),
    darker: adjustBrightness(baseColor, -40)
  };
}

// Validate a complete color theme for WCAG compliance
export function validateColorTheme(theme: ColorTheme): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check primary text on background
  if (!meetsWCAGAA(theme.text, theme.background)) {
    issues.push('Texto principal não tem contraste suficiente com o fundo');
    suggestions.push('Ajuste a cor do texto ou do fundo para melhorar o contraste');
  }

  // Check secondary text on background
  if (!meetsWCAGAA(theme.textSecondary, theme.background)) {
    issues.push('Texto secundário não tem contraste suficiente com o fundo');
    suggestions.push('Ajuste a cor do texto secundário para melhorar a legibilidade');
  }

  // Check primary color on background
  if (!meetsWCAGAA(theme.primary, theme.background)) {
    issues.push('Cor primária não tem contraste suficiente com o fundo');
    suggestions.push('Escolha uma cor primária mais contrastante');
  }

  // Check text on surface
  if (!meetsWCAGAA(theme.text, theme.surface)) {
    issues.push('Texto não tem contraste suficiente em superfícies');
    suggestions.push('Ajuste a cor da superfície ou do texto');
  }

  // Check if primary and secondary are too similar
  if (getContrastRatio(theme.primary, theme.secondary) < 1.5) {
    issues.push('Cores primária e secundária são muito similares');
    suggestions.push('Escolha cores mais distintas para melhor hierarquia visual');
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions
  };
}

// Auto-fix a color theme to meet WCAG standards
export function autoFixColorTheme(theme: ColorTheme): ColorTheme {
  const fixed = { ...theme };

  // Fix text contrast
  if (!meetsWCAGAA(theme.text, theme.background)) {
    fixed.text = getLuminance(theme.background) > 0.5 ? '#000000' : '#FFFFFF';
  }

  // Fix secondary text contrast
  if (!meetsWCAGAA(theme.textSecondary, theme.background)) {
    const baseLuminance = getLuminance(theme.background);
    fixed.textSecondary = baseLuminance > 0.5 ? '#666666' : '#CCCCCC';
  }

  // Fix primary color contrast if needed
  if (!meetsWCAGAA(theme.primary, theme.background)) {
    const backgroundLuminance = getLuminance(theme.background);
    if (backgroundLuminance > 0.5) {
      // Light background, make primary darker
      fixed.primary = adjustBrightness(theme.primary, -30);
    } else {
      // Dark background, make primary lighter
      fixed.primary = adjustBrightness(theme.primary, 30);
    }
  }

  return fixed;
}

// Get accessibility rating for a color combination
export function getAccessibilityRating(foreground: string, background: string): {
  rating: 'AAA' | 'AA' | 'Fail';
  ratio: number;
  description: string;
} {
  const ratio = getContrastRatio(foreground, background);
  
  if (ratio >= 7) {
    return {
      rating: 'AAA',
      ratio,
      description: 'Excelente contraste - atende aos padrões mais rigorosos'
    };
  } else if (ratio >= 4.5) {
    return {
      rating: 'AA',
      ratio,
      description: 'Bom contraste - atende aos padrões recomendados'
    };
  } else {
    return {
      rating: 'Fail',
      ratio,
      description: 'Contraste insuficiente - pode causar dificuldades de leitura'
    };
  }
}