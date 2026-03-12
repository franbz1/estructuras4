import { createContext, useContext, useRef } from 'react'
import type { ReactNode } from 'react'
import { createOrderWorkflowContext } from '../../application/OrderWorkflowApplication.ts'
import {
  useWorkflowController,
} from '../hooks/useWorkflowController.ts'
import type { UseWorkflowControllerResult } from '../hooks/useWorkflowController.ts'

const WorkflowUiContext = createContext<UseWorkflowControllerResult | null>(null)

interface WorkflowProviderProps {
  children: ReactNode
}

export function WorkflowProvider({ children }: WorkflowProviderProps) {
  const workflowContextRef = useRef(createOrderWorkflowContext())
  const controller = useWorkflowController(workflowContextRef.current)

  return <WorkflowUiContext.Provider value={controller}>{children}</WorkflowUiContext.Provider>
}

export function useWorkflowUi(): UseWorkflowControllerResult {
  const context = useContext(WorkflowUiContext)
  if (!context) {
    throw new Error('useWorkflowUi must be used inside WorkflowProvider.')
  }

  return context
}
