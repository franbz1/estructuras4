import type { WorkflowSnapshot } from '../../types/WorkflowSnapshot.ts'

interface FlowStepperProps {
  currentStepLabel: string
  snapshot: WorkflowSnapshot
}

const workflowSteps = [
  'AR prepare initial requirements',
  'AC prepare quote request',
  'S supervisor review',
  'V review quote',
  'V create real quote',
  'AC review real quote',
  'V create order from accepted quote',
  'OE receive order',
  'OE schedule shipment date',
  'V generate invoice',
  'AR receive shipment and invoice',
  'AR pay invoice',
]

export function FlowStepper({ currentStepLabel, snapshot }: FlowStepperProps) {
  return (
    <section className="panel">
      <h2>Workflow Stepper</h2>
      <p className="muted">Current: {currentStepLabel}</p>
      <ol className="stepper-list">
        {workflowSteps.map((step) => (
          <li key={step} className={step === currentStepLabel ? 'step-active' : undefined}>
            {step}
          </li>
        ))}
      </ol>
      <p className="muted">
        Quotes: {snapshot.quotes.length} | Orders: {snapshot.orders.length} | Invoices:{' '}
        {snapshot.invoices.length} | Payments: {snapshot.payments.length}
      </p>
    </section>
  )
}
