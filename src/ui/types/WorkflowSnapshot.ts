import { Invoice } from '../../domain/entities/Invoice.ts'
import { Order } from '../../domain/entities/Order.ts'
import { Payment } from '../../domain/entities/Payment.ts'
import { PurchaseRequest } from '../../domain/entities/PurchaseRequest.ts'
import { Quote } from '../../domain/entities/Quote.ts'
import { ShipmentSchedule } from '../../domain/entities/ShipmentSchedule.ts'

export interface WorkflowSnapshot {
  purchaseRequests: PurchaseRequest[]
  quotes: Quote[]
  orders: Order[]
  shipments: ShipmentSchedule[]
  invoices: Invoice[]
  payments: Payment[]
}

export interface UiErrorState {
  title: string
  message: string
  details?: string
}
