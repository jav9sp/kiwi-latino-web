export function formatDistanceToNow(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d`;
  return new Date(dateStr).toLocaleDateString('es-NZ', { day: 'numeric', month: 'short' });
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-NZ', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('es-NZ', { hour: '2-digit', minute: '2-digit' });
}
