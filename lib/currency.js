/**
 * Format amount in South African Rands
 */
export function formatRands(amount) {
  return `R ${amount.toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Parse Rands string to number
 */
export function parseRands(randsString) {
  const cleaned = randsString.replace(/[R,\s]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Generate transaction ID
 */
export function generateTransactionId() {
  return `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

/**
 * Generate unique ID
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
