import { ValidationError } from '../errors/ValidationError.ts'

export interface ShipmentScheduleProps {
  id: string
  orderId: string
  shippingDate: Date
  createdAt: Date
}

export class ShipmentSchedule {
  public readonly id: string
  public readonly orderId: string
  public readonly shippingDate: Date
  public readonly createdAt: Date

  public constructor(props: ShipmentScheduleProps) {
    if (props.shippingDate.getTime() <= Date.now()) {
      throw new ValidationError('Shipping date must be in the future.')
    }

    this.id = props.id
    this.orderId = props.orderId
    this.shippingDate = new Date(props.shippingDate)
    this.createdAt = new Date(props.createdAt)
  }
}
