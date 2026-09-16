export function formatDayLabel(date: string, index?: number): string {
  const parsedDate = new Date(`${date}T12:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Data indisponível';
  }

  if (index === 0) {
    return 'Hoje';
  }

  if (index === 1) {
    return 'Amanhã';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
  }).format(parsedDate);
}

export function getShortDate(date: string): string {
  const parsedDate = new Date(`${date}T12:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Data indisponível';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(parsedDate);
}
