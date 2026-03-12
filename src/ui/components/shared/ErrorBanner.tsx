import type { UiErrorState } from '../../types/WorkflowSnapshot.ts'

interface ErrorBannerProps {
  error?: UiErrorState
  onClear: () => void
}

export function ErrorBanner({ error, onClear }: ErrorBannerProps) {
  if (!error) {
    return null
  }

  return (
    <section className="error-banner" role="alert">
      <div>
        <strong>{error.title}</strong>
        <p>{error.message}</p>
      </div>
      <button type="button" onClick={onClear}>
        Dismiss
      </button>
    </section>
  )
}
