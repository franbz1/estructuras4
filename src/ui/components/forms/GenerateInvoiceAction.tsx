interface GenerateInvoiceActionProps {
  onGenerate: () => void
}

export function GenerateInvoiceAction({ onGenerate }: GenerateInvoiceActionProps) {
  return (
    <section className="panel" data-testid="action-generate-invoice">
      <h2>V Generate Invoice</h2>
      <button type="button" onClick={onGenerate}>
        Generate invoice
      </button>
    </section>
  )
}
