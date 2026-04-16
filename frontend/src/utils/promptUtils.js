export function getComplexityLabel(complexity) {
  if (complexity <= 3) return 'Low';
  if (complexity <= 6) return 'Medium';
  return 'High';
}

export function getComplexityClass(complexity) {
  if (complexity <= 3) return 'badge-low';
  if (complexity <= 6) return 'badge-medium';
  return 'badge-high';
}

export function formatDate(dateStr, includeTime = false) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: includeTime ? 'long' : 'short',
    day: 'numeric',
    ...(includeTime && { hour: '2-digit', minute: '2-digit' }),
  });
}