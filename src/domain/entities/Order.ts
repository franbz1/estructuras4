import { OrderStatus } from '../enums/OrderStatus.ts'
import { ValidationError } from '../errors/ValidationError.ts'
import { QuoteItem } from '../value-objects/QuoteItem.ts'

export interface OrderProps {
  id: string
  quoteId: string
  items: QuoteItem[]
  status: OrderStatus
  createdAt: Date
  updatedAt: Date
  shippingDate?: Date
}

export class Order {
  public readonly id: string
  public readonly quoteId: string
  public readonly items: QuoteItem[]
  public readonly status: OrderStatus
  public readonly createdAt: Date
  public readonly updatedAt: Date
  public readonly shippingDate?: Date

  public constructor(props: OrderProps) {
    if (props.items.length === 0) {
      throw new ValidationError('Order must include at least one item.')
    }

    this.id = props.id
    this.quoteId = props.quoteId
    this.items = [...props.items]
    this.status = props.status
    this.createdAt = new Date(props.createdAt)
    this.updatedAt = new Date(props.updatedAt)
    this.shippingDate = props.shippingDate ? new Date(props.shippingDate) : undefined
  }

  public get totalAmount(): number {
    return this.items.reduce((total, item) => total + item.subtotal, 0)
  }
}
