// src/utils/formatters.ts

export function formatDate(isoStr: string | null | undefined): string {
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

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  if (diffMs < 0) {
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
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
