export const formatCurrency = (value: number | undefined): string => {
  // Return empty string for undefined, null, zero, or NaN values
  if (!value || value <= 0 || isNaN(value)) return '';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

export const formatInputCurrency = (value: string): string => {
  // Remove all non-numeric characters
  const numbers = value.replace(/\D/g, '');
  
  // Handle empty input
  if (!numbers) return '';
  
  // Convert to number and divide by 100 to get decimal places
  const amount = parseFloat(numbers) / 100;
  
  // Handle zero or invalid values
  if (isNaN(amount) || amount === 0) return '';
  
  // Format with Brazilian number formatting
  return amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const parseCurrencyToNumber = (value: string): number => {
  // Remove currency symbol, spaces, and convert comma to dot
  const normalized = value
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  
  const parsed = parseFloat(normalized) || 0;
  return Math.max(0, parsed); // Ensure non-negative
};

// Helper function to ensure safe currency values
export const ensureSafeValue = (value: number | undefined, minimum: number = 1): number => {
  if (!value || value <= 0 || isNaN(value)) return minimum;
  return Math.max(minimum, value);
};

// Helper function to format currency with safe fallback
export const formatCurrencySafe = (value: number | undefined, fallback: string = ''): string => {
  if (!value || value <= 0 || isNaN(value)) return fallback;
  return formatCurrency(value);
};

// Helper function to check if a value should be displayed
export const shouldDisplayValue = (value: number | undefined): boolean => {
  return !!(value && value > 0 && !isNaN(value));
};

// Helper function to format currency only if value should be displayed
export const formatCurrencyIfValid = (value: number | undefined): string => {
  return shouldDisplayValue(value) ? formatCurrency(value) : '';
};