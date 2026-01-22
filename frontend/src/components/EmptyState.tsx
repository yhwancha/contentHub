interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = 'No articles yet. Check back later!' }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <p className="empty-state-message">{message}</p>
    </div>
  );
}
