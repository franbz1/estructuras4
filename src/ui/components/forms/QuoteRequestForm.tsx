import { useState } from 'react'

interface QuoteRequestFormProps {
  onSubmit: (requiresSupervisorReview: boolean) => void
}

export function QuoteRequestForm({ onSubmit }: QuoteRequestFormProps) {
  const [requiresSupervisorReview, setRequiresSupervisorReview] = useState(true)

  return (
    <section className="panel" data-testid="form-quote-request">
      <h2>AC Prepare Quote Request</h2>
      <label className="row">
        <input
          type="checkbox"
          checked={requiresSupervisorReview}
          onChange={(event) => setRequiresSupervisorReview(event.target.checked)}
        />
        Requires supervisor review
      </label>
      <button type="button" onClick={() => onSubmit(requiresSupervisorReview)}>
        Submit quote request
      </button>
    </section>
  )
}
