interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({
  message = 'Carregando previsão do tempo...',
}: LoadingStateProps) {
  return (
    <div
      aria-live="polite"
      className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-8 text-white shadow-glass backdrop-blur-md"
      role="status"
    >
      <span
        aria-hidden="true"
        className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white/25 border-t-accent-400"
      />
      <span>{message}</span>
    </div>
  );
}
