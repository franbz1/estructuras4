import { Order } from '../entities/Order.ts'
import { Quote } from '../entities/Quote.ts'
import { OrderStatus } from '../enums/OrderStatus.ts'
import { createId } from '../utils/id.ts'
import { BaseInMemoryService } from './BaseInMemoryService.ts'

export class OrderService extends BaseInMemoryService<Order> {
  public createFromQuote(quote: Quote): Order {
    const order = new Order({
      id: createId('order'),
      quoteId: quote.id,
      items: quote.items,
      status: OrderStatus.Created,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return this.create(order)
  }

  public replace(order: Order): Order {
    return this.update(order.id, order)
  }
}
