import { ValidationError } from '../errors/ValidationError.ts'

export interface InvoiceProps {
  id: string
  orderId: string
  shipmentScheduleId: string
  totalAmount: number
  issuedAt: Date
}

export class Invoice {
  public readonly id: string
  public readonly orderId: string
  public readonly shipmentScheduleId: string
  public readonly totalAmount: number
  public readonly issuedAt: Date

  public constructor(props: InvoiceProps) {
    if (props.totalAmount < 0) {
      throw new ValidationError('Invoice total amount cannot be negative.')
    }

    this.id = props.id
    this.orderId = props.orderId
    this.shipmentScheduleId = props.shipmentScheduleId
    this.totalAmount = props.totalAmount
    this.issuedAt = new Date(props.issuedAt)
  }
}
