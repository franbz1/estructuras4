interface VendorReviewActionProps {
  onReview: () => void
}

export function VendorReviewAction({ onReview }: VendorReviewActionProps) {
  return (
    <section className="panel" data-testid="action-vendor-review">
      <h2>V Review Quote Request</h2>
      <button type="button" onClick={onReview}>
        Mark quote as reviewed
      </button>
    </section>
  )
}
