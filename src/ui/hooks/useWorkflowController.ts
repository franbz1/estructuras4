import { useCallback, useMemo, useState } from 'react'
import type { OrderWorkflowContext } from '../../application/OrderWorkflowApplication.ts'
import { AgentRole } from '../../domain/enums/AgentRole.ts'
import { OrderStatus } from '../../domain/enums/OrderStatus.ts'
import { QuoteStatus } from '../../domain/enums/QuoteStatus.ts'
import { RequestedItem } from '../../domain/value-objects/RequestedItem.ts'
import type { QuoteItemProps } from '../../domain/value-objects/QuoteItem.ts'
import type { UiErrorState, WorkflowSnapshot } from '../types/WorkflowSnapshot.ts'
import { mapDomainError } from '../utils/errorMapping.ts'

export interface WorkflowSelection {
  purchaseRequestId?: string
  quoteId?: string
  orderId?: string
  invoiceId?: string
}

export interface InitialItemInput {
  id: string
  name: string
  quantity: number
}

export interface RealQuoteItemInput extends QuoteItemProps {}

export interface UseWorkflowControllerResult {
  snapshot: WorkflowSnapshot
  selection: WorkflowSelection
  isBusy: boolean
  lastAction?: string
  lastError?: UiErrorState
  clearError: () => void
  prepareInitialRequirements: (items: InitialItemInput[], notes?: string) => void
  prepareQuoteRequest: (requiresSupervisorReview: boolean) => void
  supervisorReview: (approved: boolean, reason?: string) => void
  vendorReviewQuote: () => void
  submitRealQuote: (items: RealQuoteItemInput[]) => void
  reviewRealQuote: (accepted: boolean, feedback?: string) => void
  createOrder: () => void
  receiveOrderByShippingOffice: () => void
  scheduleShipment: (shippingDate: Date) => void
  generateInvoice: () => void
  receiveShipmentAndInvoice: () => void
  payInvoice: () => void
  refreshSnapshot: () => void
  currentStepLabel: string
}

function buildSnapshot(context: OrderWorkflowContext): WorkflowSnapshot {
  return {
    purchaseRequests: context.purchaseRequestService.getAll(),
    quotes: context.quoteService.getAll(),
    orders: context.orderService.getAll(),
    shipments: context.shipmentService.getAll(),
    invoices: context.invoiceService.getAll(),
    payments: context.paymentService.getAll(),
  }
}

export function useWorkflowController(
  context: OrderWorkflowContext,
): UseWorkflowControllerResult {
  const [snapshot, setSnapshot] = useState<WorkflowSnapshot>(() => buildSnapshot(context))
  const [selection, setSelection] = useState<WorkflowSelection>({})
  const [isBusy, setIsBusy] = useState(false)
  const [lastAction, setLastAction] = useState<string>()
  const [lastError, setLastError] = useState<UiErrorState>()

  const refreshSnapshot = useCallback(() => {
    setSnapshot(buildSnapshot(context))
  }, [context])

  const clearError = useCallback(() => {
    setLastError(undefined)
  }, [])

  const execute = useCallback(
    (actionName: string, command: () => void) => {
      setIsBusy(true)
      setLastError(undefined)
      try {
        command()
        setLastAction(actionName)
        refreshSnapshot()
      } catch (error) {
        setLastError(mapDomainError(error))
      } finally {
        setIsBusy(false)
      }
    },
    [refreshSnapshot],
  )

  const prepareInitialRequirements = useCallback(
    (items: InitialItemInput[], notes?: string) => {
      execute('Prepare initial requirements', () => {
        const created = context.engine.prepareInitialRequirements({
          actor: AgentRole.ReceiverAgent,
          items: items.map((item) => new RequestedItem(item)),
          notes,
        })
        setSelection((previous) => ({
          ...previous,
          purchaseRequestId: created.id,
        }))
      })
    },
    [context.engine, execute],
  )

  const prepareQuoteRequest = useCallback(
    (requiresSupervisorReview: boolean) => {
      execute('Prepare quote request', () => {
        const purchaseRequestId =
          selection.purchaseRequestId ?? snapshot.purchaseRequests.at(-1)?.id
        if (!purchaseRequestId) {
          throw new Error('No purchase request is available.')
        }

        const quote = context.engine.prepareQuoteRequest({
          actor: AgentRole.PurchasingAgent,
          purchaseRequestId,
          requiresSupervisorReview,
        })

        setSelection((previous) => ({
          ...previous,
          quoteId: quote.id,
        }))
      })
    },
    [context.engine, execute, selection.purchaseRequestId, snapshot.purchaseRequests],
  )

  const supervisorReview = useCallback(
    (approved: boolean, reason?: string) => {
      execute('Supervisor review', () => {
        const quoteId = selection.quoteId ?? snapshot.quotes.at(-1)?.id
        if (!quoteId) {
          throw new Error('No quote is available for supervisor review.')
        }

        const quote = context.engine.reviewBySupervisor({
          actor: AgentRole.Supervisor,
          quoteId,
          approved,
          reason,
        })

        setSelection((previous) => ({
          ...previous,
          quoteId: quote.id,
        }))
      })
    },
    [context.engine, execute, selection.quoteId, snapshot.quotes],
  )

  const vendorReviewQuote = useCallback(() => {
    execute('Vendor review quote', () => {
      const quoteId = selection.quoteId ?? snapshot.quotes.at(-1)?.id
      if (!quoteId) {
        throw new Error('No quote is available for vendor review.')
      }

      const quote = context.engine.vendorReviewQuote(AgentRole.Vendor, quoteId)
      setSelection((previous) => ({
        ...previous,
        quoteId: quote.id,
      }))
    })
  }, [context.engine, execute, selection.quoteId, snapshot.quotes])

  const submitRealQuote = useCallback(
    (items: RealQuoteItemInput[]) => {
      execute('Submit real quote', () => {
        const quoteId = selection.quoteId ?? snapshot.quotes.at(-1)?.id
        if (!quoteId) {
          throw new Error('No quote is available for real quote submission.')
        }

        const quote = context.engine.createRealQuote({
          actor: AgentRole.Vendor,
          quoteId,
          items,
        })

        setSelection((previous) => ({
          ...previous,
          quoteId: quote.id,
        }))
      })
    },
    [context.engine, execute, selection.quoteId, snapshot.quotes],
  )

  const reviewRealQuote = useCallback(
    (accepted: boolean, feedback?: string) => {
      execute('Review real quote', () => {
        const quoteId = selection.quoteId ?? snapshot.quotes.at(-1)?.id
        if (!quoteId) {
          throw new Error('No quote is available for real quote decision.')
        }

        const quote = context.engine.reviewRealQuoteByPurchasing({
          actor: AgentRole.PurchasingAgent,
          quoteId,
          accepted,
          feedback,
        })

        setSelection((previous) => ({
          ...previous,
          quoteId: quote.id,
        }))
      })
    },
    [context.engine, execute, selection.quoteId, snapshot.quotes],
  )

  const createOrder = useCallback(() => {
    execute('Create order', () => {
      const quoteId = selection.quoteId ?? snapshot.quotes.at(-1)?.id
      if (!quoteId) {
        throw new Error('No accepted quote is available to create order.')
      }

      const order = context.engine.createOrderFromAcceptedQuote({
        actor: AgentRole.Vendor,
        quoteId,
      })

      setSelection((previous) => ({
        ...previous,
        orderId: order.id,
      }))
    })
  }, [context.engine, execute, selection.quoteId, snapshot.quotes])

  const receiveOrderByShippingOffice = useCallback(() => {
    execute('Receive order by shipping office', () => {
      const orderId = selection.orderId ?? snapshot.orders.at(-1)?.id
      if (!orderId) {
        throw new Error('No order is available for shipping office.')
      }

      const order = context.engine.receiveOrderByShippingOffice({
        actor: AgentRole.ShippingOffice,
        orderId,
      })
      setSelection((previous) => ({
        ...previous,
        orderId: order.id,
      }))
    })
  }, [context.engine, execute, selection.orderId, snapshot.orders])

  const scheduleShipment = useCallback(
    (shippingDate: Date) => {
      execute('Schedule shipment', () => {
        const orderId = selection.orderId ?? snapshot.orders.at(-1)?.id
        if (!orderId) {
          throw new Error('No order is available for scheduling shipment.')
        }

        const shipment = context.engine.scheduleShipment({
          actor: AgentRole.ShippingOffice,
          orderId,
          shippingDate,
        })

        setSelection((previous) => ({
          ...previous,
          orderId: shipment.orderId,
        }))
      })
    },
    [context.engine, execute, selection.orderId, snapshot.orders],
  )

  const generateInvoice = useCallback(() => {
    execute('Generate invoice', () => {
      const orderId = selection.orderId ?? snapshot.orders.at(-1)?.id
      if (!orderId) {
        throw new Error('No order is available for invoice generation.')
      }

      const invoice = context.engine.generateInvoice({
        actor: AgentRole.Vendor,
        orderId,
      })
      setSelection((previous) => ({
        ...previous,
        orderId,
        invoiceId: invoice.id,
      }))
    })
  }, [context.engine, execute, selection.orderId, snapshot.orders])

  const receiveShipmentAndInvoice = useCallback(() => {
    execute('Receive shipment and invoice', () => {
      const orderId = selection.orderId ?? snapshot.orders.at(-1)?.id
      if (!orderId) {
        throw new Error('No order is available for receiver confirmation.')
      }

      const order = context.engine.receiveShipmentAndInvoice(AgentRole.ReceiverAgent, orderId)
      setSelection((previous) => ({
        ...previous,
        orderId: order.id,
      }))
    })
  }, [context.engine, execute, selection.orderId, snapshot.orders])

  const payInvoice = useCallback(() => {
    execute('Pay invoice', () => {
      const orderId = selection.orderId ?? snapshot.orders.at(-1)?.id
      const invoiceId = selection.invoiceId ?? snapshot.invoices.at(-1)?.id
      if (!orderId || !invoiceId) {
        throw new Error('Order and invoice are required to pay.')
      }

      context.engine.payInvoice({
        actor: AgentRole.ReceiverAgent,
        orderId,
        invoiceId,
      })
    })
  }, [context.engine, execute, selection.invoiceId, selection.orderId, snapshot.invoices, snapshot.orders])

  const currentStepLabel = useMemo(() => {
    const quote = snapshot.quotes.at(-1)
    const order = snapshot.orders.at(-1)
    if (!quote) {
      return 'AR prepare initial requirements'
    }

    if (quote.status === QuoteStatus.PendingSupervisorReview) {
      return 'S supervisor review'
    }
    if (quote.status === QuoteStatus.RejectedBySupervisor) {
      return 'Restart from AR initial requirements'
    }
    if (quote.status === QuoteStatus.ApprovedForVendorReview) {
      return 'V review quote'
    }
    if (quote.status === QuoteStatus.VendorReviewed) {
      return 'V create real quote'
    }
    if (quote.status === QuoteStatus.RealQuoteIssued) {
      return 'AC review real quote'
    }
    if (quote.status === QuoteStatus.RealQuoteRejected) {
      return 'V adjust and resubmit real quote'
    }
    if (quote.status === QuoteStatus.RealQuoteAccepted && !order) {
      return 'V create order from accepted quote'
    }
    if (!order) {
      return 'Order not created yet'
    }
    if (order.status === OrderStatus.Created) {
      return 'OE receive order'
    }
    if (order.status === OrderStatus.ReceivedByShippingOffice) {
      return 'OE schedule shipment date'
    }
    if (order.status === OrderStatus.ShipmentScheduled) {
      return 'V generate invoice'
    }
    if (order.status === OrderStatus.Invoiced) {
      return 'AR receive shipment and invoice'
    }
    if (order.status === OrderStatus.DeliveredToReceiver) {
      return 'AR pay invoice'
    }
    if (order.status === OrderStatus.Paid) {
      return 'Workflow completed'
    }

    return 'Workflow in progress'
  }, [snapshot.orders, snapshot.quotes])

  return {
    snapshot,
    selection,
    isBusy,
    lastAction,
    lastError,
    clearError,
    prepareInitialRequirements,
    prepareQuoteRequest,
    supervisorReview,
    vendorReviewQuote,
    submitRealQuote,
    reviewRealQuote,
    createOrder,
    receiveOrderByShippingOffice,
    scheduleShipment,
    generateInvoice,
    receiveShipmentAndInvoice,
    payInvoice,
    refreshSnapshot,
    currentStepLabel,
  }
}
