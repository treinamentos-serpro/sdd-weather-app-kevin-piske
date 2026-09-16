interface EmptyStateProps {
  title?: string;
  hint?: string;
}

export default function EmptyState({
  hint = 'Confira a grafia ou tente buscar outra cidade.',
  title = 'Nenhuma cidade encontrada',
}: EmptyStateProps) {
  return (
    <div
      aria-live="polite"
      className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white shadow-glass backdrop-blur-md"
      role="status"
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-white">{hint}</p>
    </div>
  );
}
