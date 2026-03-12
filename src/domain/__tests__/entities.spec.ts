import { describe, expect, it } from 'vitest'
import { Quote } from '../entities/Quote.ts'
import { QuoteStatus } from '../enums/QuoteStatus.ts'
import { ValidationError } from '../errors/ValidationError.ts'
import { QuoteItem } from '../value-objects/QuoteItem.ts'

describe('domain entity validations', () => {
  it('creates a valid quote item', () => {
    const item = new QuoteItem({
      id: 'item-1',
      name: 'Laptop',
      unitPrice: 1200,
      quantity: 2,
    })

    expect(item.subtotal).toBe(2400)
  })

  it('rejects quote item with invalid quantity', () => {
    expect(() => {
      new QuoteItem({
        id: 'item-1',
        name: 'Laptop',
        unitPrice: 1200,
        quantity: 0,
      })
    }).toThrowError(ValidationError)
  })

  it('rejects quote with duplicate item ids', () => {
    const itemA = new QuoteItem({
      id: 'duplicate-item',
      name: 'Laptop',
      unitPrice: 1000,
      quantity: 1,
    })
    const itemB = new QuoteItem({
      id: 'duplicate-item',
      name: 'Monitor',
      unitPrice: 200,
      quantity: 2,
    })

    expect(() => {
      new Quote({
        id: 'quote-1',
        purchaseRequestId: 'pr-1',
        items: [itemA, itemB],
        status: QuoteStatus.RequestedForQuotation,
        requiresSupervisorReview: false,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [],
      })
    }).toThrowError(ValidationError)
  })
})
