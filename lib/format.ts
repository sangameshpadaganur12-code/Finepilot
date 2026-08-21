/**
 * Indian Rupee formatting utilities.
 * All formatting uses the Indian numbering system (lakh, crore) with proper grouping.
 */

const isClient = typeof window !== 'undefined';

function formatINRClient(amount: number, opts?: { decimals?: boolean }): string {
  const decimals = opts?.decimals;
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  });
  return formatter.format(amount);
}

function formatINRServer(amount: number, opts?: { decimals?: boolean }): string {
  const decimals = opts?.decimals;
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(Math.round(amount * 100) / 100);
  const [intPart, decPart] = abs.toFixed(decimals ? 2 : 0).split('.');

  let lastThree = intPart.slice(-3);
  const otherNumbers = intPart.slice(0, -3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInt = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  const result = decimals && decPart ? `${formattedInt}.${decPart}` : formattedInt;
  return `${sign}\u20B9${result}`;
}

export function formatINR(amount: number, opts?: { decimals?: boolean }): string {
  return isClient
    ? formatINRClient(amount, opts)
    : formatINRServer(amount, opts);
}

export function formatINRShort(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 10000000) {
    return `${sign}\u20B9${(abs / 10000000).toFixed(abs % 10000000 === 0 ? 0 : 2)} Cr`;
  }
  if (abs >= 100000) {
    return `${sign}\u20B9${(abs / 100000).toFixed(abs % 100000 === 0 ? 0 : 2)} L`;
  }
  if (abs >= 1000) {
    return `${sign}\u20B9${(abs / 1000).toFixed(0)}K`;
  }
  return formatINR(amount);
}

export function formatNumberINR(amount: number, opts?: { decimals?: boolean }): string {
  const decimals = opts?.decimals;
  const formatted = isClient
    ? new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: decimals ? 2 : 0,
        maximumFractionDigits: decimals ? 2 : 0,
      }).format(amount)
    : (() => {
        const [intPart, decPart] = amount.toFixed(decimals ? 2 : 0).split('.');
        let lastThree = intPart.slice(-3);
        const otherNumbers = intPart.slice(0, -3);
        if (otherNumbers !== '') lastThree = ',' + lastThree;
        const formattedInt = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
        return decimals && decPart ? `${formattedInt}.${decPart}` : formattedInt;
      })();
  return formatted;
}

export function formatPercent(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}
