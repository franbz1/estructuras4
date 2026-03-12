import { Quote, type QuoteHistoryEvent } from '../entities/Quote.ts'
import { AgentRole } from '../enums/AgentRole.ts'
import { QuoteStatus } from '../enums/QuoteStatus.ts'
import { QuoteItem } from '../value-objects/QuoteItem.ts'
import { createId } from '../utils/id.ts'
import { BaseInMemoryService } from './BaseInMemoryService.ts'

export interface CreateQuoteInput {
  purchaseRequestId: string
  items: QuoteItem[]
  requiresSupervisorReview: boolean
  actor: AgentRole
  status: QuoteStatus
  message: string
}

export class QuoteService extends BaseInMemoryService<Quote> {
  public createQuote(input: CreateQuoteInput): Quote {
    const history: QuoteHistoryEvent[] = [
      {
        at: new Date(),
        actor: input.actor,
        message: input.message,
      },
    ]

    const quote = new Quote({
      id: createId('quote'),
      purchaseRequestId: input.purchaseRequestId,
      items: input.items,
      status: input.status,
      requiresSupervisorReview: input.requiresSupervisorReview,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      history,
    })

    return this.create(quote)
  }

  public replace(quote: Quote): Quote {
    return this.update(quote.id, quote)
  }
}
