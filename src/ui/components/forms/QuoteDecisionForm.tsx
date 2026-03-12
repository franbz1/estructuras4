import { useState } from 'react'

interface QuoteDecisionFormProps {
  onDecision: (accepted: boolean, feedback?: string) => void
}

export function QuoteDecisionForm({ onDecision }: QuoteDecisionFormProps) {
  const [feedback, setFeedback] = useState('Please improve pricing for the main item.')
  const [error, setError] = useState<string>()

  const handleReject = (): void => {
    const value = feedback.trim()
    if (!value) {
      setError('Feedback is required when quote is rejected.')
      return
    }
    setError(undefined)
    onDecision(false, value)
  }

  return (
    <section className="panel" data-testid="form-quote-decision">
      <h2>AC Review Real Quote</h2>
      <textarea
        value={feedback}
        onChange={(event) => setFeedback(event.target.value)}
        placeholder="Feedback for vendor when rejecting"
      />
      {error ? <p className="error-text">{error}</p> : null}
      <div className="row">
        <button type="button" onClick={() => onDecision(true)}>
          Accept quote
        </button>
        <button type="button" onClick={handleReject}>
          Reject with feedback
        </button>
      </div>
    </section>
  )
}
