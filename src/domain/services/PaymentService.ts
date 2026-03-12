import { Payment } from '../entities/Payment.ts'
import { AgentRole } from '../enums/AgentRole.ts'
import { Invoice } from '../entities/Invoice.ts'
import { createId } from '../utils/id.ts'
import { BaseInMemoryService } from './BaseInMemoryService.ts'

export class PaymentService extends BaseInMemoryService<Payment> {
  public registerPayment(invoice: Invoice): Payment {
    const payment = new Payment({
      id: createId('payment'),
      invoiceId: invoice.id,
      amount: invoice.totalAmount,
      paidBy: AgentRole.ReceiverAgent,
      paidAt: new Date(),
    })

    return this.create(payment)
  }
}
