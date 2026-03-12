import { describe, expect, it } from 'vitest'
import { createOrderWorkflowContext } from '../../application/OrderWorkflowApplication.ts'
import { AgentRole } from '../enums/AgentRole.ts'
import { OrderStatus } from '../enums/OrderStatus.ts'
import { QuoteStatus } from '../enums/QuoteStatus.ts'
import { UnauthorizedActorError } from '../errors/UnauthorizedActorError.ts'
import { RequestedItem } from '../value-objects/RequestedItem.ts'

describe('order flow engine', () => {
  it('runs full flow with supervisor and quote rejection loops', () => {
    const { engine, orderService } = createOrderWorkflowContext()
    const baseItems = [new RequestedItem({ id: 'item-1', name: 'Laptop', quantity: 2 })]

    const request1 = engine.prepareInitialRequirements({
      actor: AgentRole.ReceiverAgent,
      items: baseItems,
      notes: 'First request.',
    })
    const quote1 = engine.prepareQuoteRequest({
      actor: AgentRole.PurchasingAgent,
      purchaseRequestId: request1.id,
      requiresSupervisorReview: true,
    })
    const supervisorRejected = engine.reviewBySupervisor({
      actor: AgentRole.Supervisor,
      quoteId: quote1.id,
      approved: false,
      reason: 'Missing budget details.',
    })
    expect(supervisorRejected.status).toBe(QuoteStatus.RejectedBySupervisor)

    const request2 = engine.prepareInitialRequirements({
      actor: AgentRole.ReceiverAgent,
      items: baseItems,
      notes: 'Second request.',
    })
    const quote2 = engine.prepareQuoteRequest({
      actor: AgentRole.PurchasingAgent,
      purchaseRequestId: request2.id,
      requiresSupervisorReview: true,
    })
    const supervisorApproved = engine.reviewBySupervisor({
      actor: AgentRole.Supervisor,
      quoteId: quote2.id,
      approved: true,
    })
    expect(supervisorApproved.status).toBe(QuoteStatus.ApprovedForVendorReview)

    const vendorReviewed = engine.vendorReviewQuote(AgentRole.Vendor, supervisorApproved.id)
    expect(vendorReviewed.status).toBe(QuoteStatus.VendorReviewed)

    const realQuote1 = engine.createRealQuote({
      actor: AgentRole.Vendor,
      quoteId: vendorReviewed.id,
      items: [{ id: 'item-1', name: 'Laptop', quantity: 2, unitPrice: 1000 }],
    })
    expect(realQuote1.status).toBe(QuoteStatus.RealQuoteIssued)

    const purchasingRejected = engine.reviewRealQuoteByPurchasing({
      actor: AgentRole.PurchasingAgent,
      quoteId: realQuote1.id,
      accepted: false,
      feedback: 'Need lower price.',
    })
    expect(purchasingRejected.status).toBe(QuoteStatus.RealQuoteRejected)

    const realQuote2 = engine.createRealQuote({
      actor: AgentRole.Vendor,
      quoteId: realQuote1.id,
      items: [{ id: 'item-1', name: 'Laptop', quantity: 2, unitPrice: 900 }],
    })
    const acceptedQuote = engine.reviewRealQuoteByPurchasing({
      actor: AgentRole.PurchasingAgent,
      quoteId: realQuote2.id,
      accepted: true,
    })
    expect(acceptedQuote.status).toBe(QuoteStatus.RealQuoteAccepted)

    const order = engine.createOrderFromAcceptedQuote({
      actor: AgentRole.Vendor,
      quoteId: acceptedQuote.id,
    })
    engine.receiveOrderByShippingOffice({
      actor: AgentRole.ShippingOffice,
      orderId: order.id,
    })
    const shipment = engine.scheduleShipment({
      actor: AgentRole.ShippingOffice,
      orderId: order.id,
      shippingDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    })
    expect(shipment.orderId).toBe(order.id)

    const invoice = engine.generateInvoice({
      actor: AgentRole.Vendor,
      orderId: order.id,
    })
    engine.receiveShipmentAndInvoice(AgentRole.ReceiverAgent, order.id)
    const payment = engine.payInvoice({
      actor: AgentRole.ReceiverAgent,
      orderId: order.id,
      invoiceId: invoice.id,
    })

    expect(payment.amount).toBe(invoice.totalAmount)
    expect(orderService.getById(order.id).status).toBe(OrderStatus.Paid)
  })

  it('rejects transitions with wrong actor', () => {
    const { engine } = createOrderWorkflowContext()
    const request = engine.prepareInitialRequirements({
      actor: AgentRole.ReceiverAgent,
      items: [new RequestedItem({ id: 'item-1', name: 'Monitor', quantity: 1 })],
    })

    expect(() =>
      engine.prepareQuoteRequest({
        actor: AgentRole.Vendor,
        purchaseRequestId: request.id,
        requiresSupervisorReview: false,
      }),
    ).toThrowError(UnauthorizedActorError)
  })
})
