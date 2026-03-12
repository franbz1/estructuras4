import { WorkflowPage } from './pages/WorkflowPage.tsx'
import { WorkflowProvider } from './providers/WorkflowProvider.tsx'

export function App() {
  return (
    <WorkflowProvider>
      <WorkflowPage />
    </WorkflowProvider>
  )
}
