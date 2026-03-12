import { FlowStepper } from '../components/flow/FlowStepper.tsx'
import { ActionPanel } from '../components/panels/ActionPanel.tsx'
import { EntityInspector } from '../components/shared/EntityInspector.tsx'
import { ErrorBanner } from '../components/shared/ErrorBanner.tsx'
import { LoadingOverlay } from '../components/shared/LoadingOverlay.tsx'
import { useWorkflowUi } from '../providers/WorkflowProvider.tsx'

export function WorkflowPage() {
  const controller = useWorkflowUi()

  return (
    <main className="workflow-layout">
      <header className="header panel">
        <h1>Order Workflow UI</h1>
        <p>React presentation layer on top of in-memory TypeScript domain services.</p>
        <p className="muted">Last action: {controller.lastAction ?? 'None yet'}</p>
      </header>

      <ErrorBanner error={controller.lastError} onClear={controller.clearError} />
      <LoadingOverlay visible={controller.isBusy} />

      <section className="columns">
        <FlowStepper
          currentStepLabel={controller.currentStepLabel}
          snapshot={controller.snapshot}
        />
        <ActionPanel controller={controller} />
        <EntityInspector snapshot={controller.snapshot} />
      </section>
    </main>
  )
}
