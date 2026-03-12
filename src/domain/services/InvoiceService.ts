import { Invoice } from '../entities/Invoice.ts'
import { Order } from '../entities/Order.ts'
import { ShipmentSchedule } from '../entities/ShipmentSchedule.ts'
import { createId } from '../utils/id.ts'
import { BaseInMemoryService } from './BaseInMemoryService.ts'

export class InvoiceService extends BaseInMemoryService<Invoice> {
  public createFromOrder(order: Order, shipmentSchedule: ShipmentSchedule): Invoice {
    const invoice = new Invoice({
      id: createId('invoice'),
      orderId: order.id,
      shipmentScheduleId: shipmentSchedule.id,
      totalAmount: order.totalAmount,
      issuedAt: new Date(),
    })

    return this.create(invoice)
  }
}
