interface ReceiveAndPayActionsProps {
  onReceive: () => void
  onPay: () => void
  canPay: boolean
}

export function ReceiveAndPayActions({
  onReceive,
  onPay,
  canPay,
}: ReceiveAndPayActionsProps) {
  return (
    <section className="panel" data-testid="action-receive-and-pay">
      <h2>AR Receive and Pay</h2>
      <div className="row">
        <button type="button" onClick={onReceive}>
          Confirm shipment and invoice received
        </button>
        <button type="button" disabled={!canPay} onClick={onPay}>
          Pay invoice
        </button>
      </div>
    </section>
  )
}
