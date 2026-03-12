interface ReceiveOrderActionProps {
  onReceive: () => void
}

export function ReceiveOrderAction({ onReceive }: ReceiveOrderActionProps) {
  return (
    <section className="panel" data-testid="action-receive-order">
      <h2>OE Receive Order</h2>
      <button type="button" onClick={onReceive}>
        Confirm order reception
      </button>
    </section>
  )
}
