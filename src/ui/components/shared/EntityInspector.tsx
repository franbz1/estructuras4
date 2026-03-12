import type { WorkflowSnapshot } from '../../types/WorkflowSnapshot.ts'

interface EntityInspectorProps {
  snapshot: WorkflowSnapshot
}

export function EntityInspector({ snapshot }: EntityInspectorProps) {
  const latestQuote = snapshot.quotes.at(-1)
  const latestOrder = snapshot.orders.at(-1)
  const latestInvoice = snapshot.invoices.at(-1)
  const latestPayment = snapshot.payments.at(-1)

  return (
    <section className="panel">
      <h2>Entity Inspector</h2>
      <div className="inspector-grid">
        <article>
          <h3>Purchase Requests</h3>
          <p>Total: {snapshot.purchaseRequests.length}</p>
        </article>
        <article>
          <h3>Latest Quote</h3>
          <p>ID: {latestQuote?.id ?? 'N/A'}</p>
          <p>Status: {latestQuote?.status ?? 'N/A'}</p>
          <p>Total: {latestQuote?.totalAmount ?? 0}</p>
          <p>Version: {latestQuote?.version ?? 0}</p>
        </article>
        <article>
          <h3>Latest Order</h3>
          <p>ID: {latestOrder?.id ?? 'N/A'}</p>
          <p>Status: {latestOrder?.status ?? 'N/A'}</p>
          <p>Total: {latestOrder?.totalAmount ?? 0}</p>
        </article>
        <article>
          <h3>Latest Invoice</h3>
          <p>ID: {latestInvoice?.id ?? 'N/A'}</p>
          <p>Amount: {latestInvoice?.totalAmount ?? 0}</p>
        </article>
        <article>
          <h3>Latest Payment</h3>
          <p>ID: {latestPayment?.id ?? 'N/A'}</p>
          <p>Amount: {latestPayment?.amount ?? 0}</p>
        </article>
      </div>
    </section>
  )
}
