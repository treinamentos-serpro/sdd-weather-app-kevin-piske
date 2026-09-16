interface ErrorStateProps {
  onRetry: () => void;
  message?: string;
}

export default function ErrorState({
  message = 'Não foi possível carregar os dados do clima.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      aria-live="assertive"
      className="flex flex-col items-start gap-4 rounded-2xl border border-red-300/20 bg-red-950/20 p-6 text-white shadow-glass backdrop-blur-md"
      role="alert"
    >
      <p>{message}</p>
      <button
        className="rounded-xl bg-accent-500 px-4 py-2.5 font-semibold text-white outline-none transition hover:bg-accent-400 focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900"
        onClick={onRetry}
        type="button"
      >
        Tentar novamente
      </button>
    </div>
  );
}
