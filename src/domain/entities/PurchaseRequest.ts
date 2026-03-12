import { AgentRole } from '../enums/AgentRole.ts'
import { ValidationError } from '../errors/ValidationError.ts'
import { RequestedItem } from '../value-objects/RequestedItem.ts'

export interface PurchaseRequestProps {
  id: string
  createdBy: AgentRole
  items: RequestedItem[]
  createdAt: Date
  notes?: string
}

export class PurchaseRequest {
  public readonly id: string
  public readonly createdBy: AgentRole
  public readonly items: RequestedItem[]
  public readonly createdAt: Date
  public readonly notes?: string

  public constructor(props: PurchaseRequestProps) {
    if (props.createdBy !== AgentRole.ReceiverAgent) {
      throw new ValidationError('Purchase requests must be created by AR.')
    }

    if (props.items.length === 0) {
      throw new ValidationError('Purchase request must include at least one item.')
    }

    const uniqueIds = new Set(props.items.map((item) => item.id))
    if (uniqueIds.size !== props.items.length) {
      throw new ValidationError('Purchase request item ids must be unique.')
    }

    this.id = props.id
    this.createdBy = props.createdBy
    this.items = [...props.items]
    this.createdAt = new Date(props.createdAt)
    this.notes = props.notes?.trim() || undefined
  }
}
