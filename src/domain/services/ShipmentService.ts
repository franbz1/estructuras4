import { ShipmentSchedule } from '../entities/ShipmentSchedule.ts'
import { createId } from '../utils/id.ts'
import { BaseInMemoryService } from './BaseInMemoryService.ts'

export class ShipmentService extends BaseInMemoryService<ShipmentSchedule> {
  public createSchedule(orderId: string, shippingDate: Date): ShipmentSchedule {
    const shipmentSchedule = new ShipmentSchedule({
      id: createId('shipment'),
      orderId,
      shippingDate,
      createdAt: new Date(),
    })

    return this.create(shipmentSchedule)
  }
}
