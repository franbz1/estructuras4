import { useState } from 'react'

interface SupervisorReviewFormProps {
  onReview: (approved: boolean, reason?: string) => void
}

export function SupervisorReviewForm({ onReview }: SupervisorReviewFormProps) {
  const [reason, setReason] = useState('Needs budget clarification.')

  return (
    <section className="panel" data-testid="form-supervisor-review">
      <h2>S Supervisor Review</h2>
      <textarea
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="Reason for rejection"
      />
      <div className="row">
        <button type="button" onClick={() => onReview(true)}>
          Approve quote request
        </button>
        <button type="button" onClick={() => onReview(false, reason.trim() || undefined)}>
          Reject and restart
        </button>
      </div>
    </section>
  )
}
