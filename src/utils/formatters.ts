// src/utils/formatters.ts

export function formatDate(isoStr: string | null | undefined, includeTime = true): string {
  if (!isoStr || isoStr === 'Invalid Date') return '—';
  
  // Clean up any malformed ISO strings (e.g. "+00:00Z", double "Z"s, trailing invalid characters)
  let cleanStr = typeof isoStr === 'string'
    ? isoStr.replace(/\+00:00Z$/i, 'Z').replace(/\+00:00$/i, 'Z').replace(/Z+$/i, 'Z').trim()
    : isoStr;

  let d = new Date(cleanStr);
  if (isNaN(d.getTime())) {
    d = new Date(String(isoStr));
  }

  if (isNaN(d.getTime())) {
    return isoStr && isoStr !== 'Invalid Date' ? isoStr : '—';
  }

  const datePart = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const timePart = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (includeTime) {
    return `${datePart}, ${timePart}`;
  }

  return datePart;
}

export function formatDateTime(isoStr: string | null | undefined): string {
  return formatDate(isoStr, true);
}

export function formatScoreKey(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function uid(): string {
  return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
