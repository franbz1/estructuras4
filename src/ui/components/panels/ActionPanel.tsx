import { OrderStatus } from '../../../domain/enums/OrderStatus.ts'
import { QuoteStatus } from '../../../domain/enums/QuoteStatus.ts'
import type { UseWorkflowControllerResult } from '../../hooks/useWorkflowController.ts'
import { CreateOrderAction } from '../forms/CreateOrderAction.tsx'
import { GenerateInvoiceAction } from '../forms/GenerateInvoiceAction.tsx'
import { InitialRequirementsForm } from '../forms/InitialRequirementsForm.tsx'
import { QuoteDecisionForm } from '../forms/QuoteDecisionForm.tsx'
import { QuoteRequestForm } from '../forms/QuoteRequestForm.tsx'
import { RealQuoteForm } from '../forms/RealQuoteForm.tsx'
import { ReceiveAndPayActions } from '../forms/ReceiveAndPayActions.tsx'
import { ReceiveOrderAction } from '../forms/ReceiveOrderAction.tsx'
import { ShipmentScheduleForm } from '../forms/ShipmentScheduleForm.tsx'
import { SupervisorReviewForm } from '../forms/SupervisorReviewForm.tsx'
import { VendorReviewAction } from '../forms/VendorReviewAction.tsx'

interface ActionPanelProps {
  controller: UseWorkflowControllerResult
}

export function ActionPanel({ controller }: ActionPanelProps) {
  const quote = controller.snapshot.quotes.at(-1)
  const order = controller.snapshot.orders.at(-1)
  const latestPurchaseRequest = controller.snapshot.purchaseRequests.at(-1)

  if (!quote) {
    if (latestPurchaseRequest) {
      return <QuoteRequestForm onSubmit={controller.prepareQuoteRequest} />
    }
    return <InitialRequirementsForm onSubmit={controller.prepareInitialRequirements} />
  }

  if (quote.status === QuoteStatus.RejectedBySupervisor) {
    const canContinueWithNewRequest =
      latestPurchaseRequest && latestPurchaseRequest.id !== quote.purchaseRequestId
    if (canContinueWithNewRequest) {
      return <QuoteRequestForm onSubmit={controller.prepareQuoteRequest} />
    }
    return <InitialRequirementsForm onSubmit={controller.prepareInitialRequirements} />
  }

  if (
    quote.status === QuoteStatus.DraftFromRequirements ||
    quote.status === QuoteStatus.RequestedForQuotation
  ) {
    return <QuoteRequestForm onSubmit={controller.prepareQuoteRequest} />
  }

  if (quote.status === QuoteStatus.PendingSupervisorReview) {
    return <SupervisorReviewForm onReview={controller.supervisorReview} />
  }

  if (quote.status === QuoteStatus.ApprovedForVendorReview) {
    return <VendorReviewAction onReview={controller.vendorReviewQuote} />
  }

  if (
    quote.status === QuoteStatus.VendorReviewed ||
    quote.status === QuoteStatus.RealQuoteRejected
  ) {
    return <RealQuoteForm onSubmit={controller.submitRealQuote} />
  }

  if (quote.status === QuoteStatus.RealQuoteIssued) {
    return <QuoteDecisionForm onDecision={controller.reviewRealQuote} />
  }

  if (quote.status === QuoteStatus.RealQuoteAccepted && !order) {
    return <CreateOrderAction onCreate={controller.createOrder} />
  }

  if (!order) {
    return (
      <section className="panel">
        <h2>No action available</h2>
        <p>Create an order from an accepted quote to continue.</p>
      </section>
    )
  }

  if (order.status === OrderStatus.Created) {
    return <ReceiveOrderAction onReceive={controller.receiveOrderByShippingOffice} />
  }

  if (order.status === OrderStatus.ReceivedByShippingOffice) {
    return <ShipmentScheduleForm onSchedule={controller.scheduleShipment} />
  }

  if (order.status === OrderStatus.ShipmentScheduled) {
    return <GenerateInvoiceAction onGenerate={controller.generateInvoice} />
  }

  if (order.status === OrderStatus.Invoiced) {
    return (
      <ReceiveAndPayActions
        onReceive={controller.receiveShipmentAndInvoice}
        onPay={controller.payInvoice}
        canPay={false}
      />
    )
  }

  if (order.status === OrderStatus.DeliveredToReceiver) {
    return (
      <ReceiveAndPayActions
        onReceive={controller.receiveShipmentAndInvoice}
        onPay={controller.payInvoice}
        canPay
      />
    )
  }

  return (
    <section className="panel" data-testid="workflow-finished">
      <h2>Workflow completed</h2>
      <p>The order flow is now fully paid.</p>
    </section>
  )
}
