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

function getDateTimeParts(dateTime: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(dateTime);

  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute] = match;

  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
  };
}

function getFormatterParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value }) => [type, Number(value)]),
  );

  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
  };
}

export function formatLocalDateTime(dateTime: string, timeZone: string): string {
  const parsed = getDateTimeParts(dateTime);

  if (!parsed) {
    return 'Data indisponível';
  }

  try {
    const expectedTimestamp = Date.UTC(
      parsed.year,
      parsed.month - 1,
      parsed.day,
      parsed.hour,
      parsed.minute,
    );
    const zonedDate = new Date(expectedTimestamp);
    const formatterParts = getFormatterParts(zonedDate, timeZone);
    const currentTimestamp = Date.UTC(
      formatterParts.year,
      formatterParts.month - 1,
      formatterParts.day,
      formatterParts.hour,
      formatterParts.minute,
    );
    const resolvedDate = new Date(zonedDate.getTime() + (expectedTimestamp - currentTimestamp));

    return new Intl.DateTimeFormat('pt-BR', {
      timeZone,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(resolvedDate);
  } catch {
    return 'Data indisponível';
  }
}
