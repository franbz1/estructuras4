import { InvoiceService } from '../domain/services/InvoiceService.ts'
import { OrderService } from '../domain/services/OrderService.ts'
import { PaymentService } from '../domain/services/PaymentService.ts'
import { PurchaseRequestService } from '../domain/services/PurchaseRequestService.ts'
import { QuoteService } from '../domain/services/QuoteService.ts'
import { ShipmentService } from '../domain/services/ShipmentService.ts'
import { OrderFlowEngine } from '../domain/workflow/OrderFlowEngine.ts'

export interface OrderWorkflowContext {
  purchaseRequestService: PurchaseRequestService
  quoteService: QuoteService
  orderService: OrderService
  shipmentService: ShipmentService
  invoiceService: InvoiceService
  paymentService: PaymentService
  engine: OrderFlowEngine
}

export function createOrderWorkflowContext(): OrderWorkflowContext {
  const purchaseRequestService = new PurchaseRequestService()
  const quoteService = new QuoteService()
  const orderService = new OrderService()
  const shipmentService = new ShipmentService()
  const invoiceService = new InvoiceService()
  const paymentService = new PaymentService()

  const engine = new OrderFlowEngine(
    purchaseRequestService,
    quoteService,
    orderService,
    shipmentService,
    invoiceService,
    paymentService,
  )

  return {
    purchaseRequestService,
    quoteService,
    orderService,
    shipmentService,
    invoiceService,
    paymentService,
    engine,
  }
}
