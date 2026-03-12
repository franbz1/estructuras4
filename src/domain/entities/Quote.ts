import { AgentRole } from '../enums/AgentRole.ts'
import { QuoteStatus } from '../enums/QuoteStatus.ts'
import { ValidationError } from '../errors/ValidationError.ts'
import { QuoteItem } from '../value-objects/QuoteItem.ts'

export interface QuoteHistoryEvent {
  at: Date
  actor: AgentRole
  message: string
}

export interface QuoteProps {
  id: string
  purchaseRequestId: string
  items: QuoteItem[]
  status: QuoteStatus
  requiresSupervisorReview: boolean
  version: number
  createdAt: Date
  updatedAt: Date
  history: QuoteHistoryEvent[]
  rejectionReason?: string
}

export class Quote {
  public readonly id: string
  public readonly purchaseRequestId: string
  public readonly items: QuoteItem[]
  public readonly status: QuoteStatus
  public readonly requiresSupervisorReview: boolean
  public readonly version: number
  public readonly createdAt: Date
  public readonly updatedAt: Date
  public readonly history: QuoteHistoryEvent[]
  public readonly rejectionReason?: string

  public constructor(props: QuoteProps) {
    this.validateItems(props.items)
    if (props.version < 1) {
      throw new ValidationError('Quote version must be at least 1.')
    }

    this.id = props.id
    this.purchaseRequestId = props.purchaseRequestId
    this.items = [...props.items]
    this.status = props.status
    this.requiresSupervisorReview = props.requiresSupervisorReview
    this.version = props.version
    this.createdAt = new Date(props.createdAt)
    this.updatedAt = new Date(props.updatedAt)
    this.history = props.history.map((event) => ({
      at: new Date(event.at),
      actor: event.actor,
      message: event.message,
    }))
    this.rejectionReason = props.rejectionReason
  }

  public get totalAmount(): number {
    return this.items.reduce((total, item) => total + item.subtotal, 0)
  }

  public withChanges(
    actor: AgentRole,
    changes: Partial<Omit<QuoteProps, 'id' | 'purchaseRequestId' | 'createdAt'>>,
    message: string,
  ): Quote {
    const nextItems = changes.items ?? this.items
    const nextHistory = [
      ...this.history,
      {
        at: new Date(),
        actor,
        message,
      },
    ]

    return new Quote({
      id: this.id,
      purchaseRequestId: this.purchaseRequestId,
      items: nextItems,
      status: changes.status ?? this.status,
      requiresSupervisorReview: changes.requiresSupervisorReview ?? this.requiresSupervisorReview,
      version: changes.version ?? this.version,
      createdAt: this.createdAt,
      updatedAt: new Date(),
      history: nextHistory,
      rejectionReason: changes.rejectionReason,
    })
  }

  private validateItems(items: QuoteItem[]): void {
    if (items.length === 0) {
      throw new ValidationError('Quote must include at least one item.')
    }

    const uniqueIds = new Set(items.map((item) => item.id))
    if (uniqueIds.size !== items.length) {
      throw new ValidationError('Quote item ids must be unique.')
    }
  }
}
