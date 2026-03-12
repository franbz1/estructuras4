import { describe, expect, it } from 'vitest'
import { AgentRole } from '../enums/AgentRole.ts'
import { QuoteStatus } from '../enums/QuoteStatus.ts'
import { NotFoundError } from '../errors/NotFoundError.ts'
import { RequestedItem } from '../value-objects/RequestedItem.ts'
import { QuoteItem } from '../value-objects/QuoteItem.ts'
import { PurchaseRequestService } from '../services/PurchaseRequestService.ts'
import { QuoteService } from '../services/QuoteService.ts'

describe('in-memory services', () => {
  it('creates and retrieves purchase requests', () => {
    const purchaseRequestService = new PurchaseRequestService()
    const request = purchaseRequestService.createFromReceiver({
      items: [new RequestedItem({ id: 'item-1', name: 'Keyboard', quantity: 4 })],
      notes: 'Office keyboards',
    })

    expect(purchaseRequestService.getById(request.id).id).toBe(request.id)
    expect(purchaseRequestService.getAll()).toHaveLength(1)
  })

  it('updates and deletes a quote through quote service', () => {
    const quoteService = new QuoteService()
    const quote = quoteService.createQuote({
      purchaseRequestId: 'purchase-request-1',
      items: [new QuoteItem({ id: 'item-1', name: 'Mouse', unitPrice: 10, quantity: 3 })],
      requiresSupervisorReview: false,
      actor: AgentRole.PurchasingAgent,
      status: QuoteStatus.ApprovedForVendorReview,
      message: 'Initial quote request.',
    })

    const updated = quote.withChanges(
      AgentRole.Vendor,
      {
        status: QuoteStatus.RealQuoteIssued,
        version: quote.version + 1,
      },
      'Vendor updated quote.',
    )
    quoteService.replace(updated)

    expect(quoteService.getById(quote.id).status).toBe(QuoteStatus.RealQuoteIssued)

    quoteService.delete(quote.id)
    expect(() => quoteService.getById(quote.id)).toThrowError(NotFoundError)
  })
})
