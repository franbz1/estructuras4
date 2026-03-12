interface CreateOrderActionProps {
  onCreate: () => void
}

export function CreateOrderAction({ onCreate }: CreateOrderActionProps) {
  return (
    <section className="panel" data-testid="action-create-order">
      <h2>V Create Order</h2>
      <button type="button" onClick={onCreate}>
        Create order from accepted quote
      </button>
    </section>
  )
}
