import { AgentRole } from '../enums/AgentRole.ts'
import { ValidationError } from '../errors/ValidationError.ts'

export interface PaymentProps {
  id: string
  invoiceId: string
  amount: number
  paidBy: AgentRole
  paidAt: Date
}

export class Payment {
  public readonly id: string
  public readonly invoiceId: string
  public readonly amount: number
  public readonly paidBy: AgentRole
  public readonly paidAt: Date

  public constructor(props: PaymentProps) {
    if (props.amount < 0) {
      throw new ValidationError('Payment amount cannot be negative.')
    }

    if (props.paidBy !== AgentRole.ReceiverAgent) {
      throw new ValidationError('Only AR can register the payment.')
    }

    this.id = props.id
    this.invoiceId = props.invoiceId
    this.amount = props.amount
    this.paidBy = props.paidBy
    this.paidAt = new Date(props.paidAt)
  }
}
