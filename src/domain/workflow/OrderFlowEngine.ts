import { Invoice } from '../entities/Invoice.ts'
import { Order } from '../entities/Order.ts'
import { Payment } from '../entities/Payment.ts'
import { PurchaseRequest } from '../entities/PurchaseRequest.ts'
import { Quote } from '../entities/Quote.ts'
import { ShipmentSchedule } from '../entities/ShipmentSchedule.ts'
import { AgentRole } from '../enums/AgentRole.ts'
import { OrderStatus } from '../enums/OrderStatus.ts'
import { QuoteStatus } from '../enums/QuoteStatus.ts'
import { InvalidTransitionError } from '../errors/InvalidTransitionError.ts'
import { NotFoundError } from '../errors/NotFoundError.ts'
import { UnauthorizedActorError } from '../errors/UnauthorizedActorError.ts'
import { RequestedItem } from '../value-objects/RequestedItem.ts'
import { QuoteItem, type QuoteItemProps } from '../value-objects/QuoteItem.ts'
import { InvoiceService } from '../services/InvoiceService.ts'
import { OrderService } from '../services/OrderService.ts'
import { PaymentService } from '../services/PaymentService.ts'
import { PurchaseRequestService } from '../services/PurchaseRequestService.ts'
import { QuoteService } from '../services/QuoteService.ts'
import { ShipmentService } from '../services/ShipmentService.ts'

export interface PrepareInitialRequirementsInput {
  actor: AgentRole
  items: RequestedItem[]
  notes?: string
}

export interface PrepareQuoteRequestInput {
  actor: AgentRole
  purchaseRequestId: string
  requiresSupervisorReview: boolean
}

export interface ReviewBySupervisorInput {
  actor: AgentRole
  quoteId: string
  approved: boolean
  reason?: string
}

export interface CreateRealQuoteInput {
  actor: AgentRole
  quoteId: string
  items: QuoteItemProps[]
}

export interface ReviewRealQuoteInput {
  actor: AgentRole
  quoteId: string
  accepted: boolean
  feedback?: string
}

export interface CreateOrderInput {
  actor: AgentRole
  quoteId: string
}

export interface ReceiveOrderInput {
  actor: AgentRole
  orderId: string
}

export interface ScheduleShipmentInput {
  actor: AgentRole
  orderId: string
  shippingDate: Date
}

export interface GenerateInvoiceInput {
  actor: AgentRole
  orderId: string
}

export interface ReceiveAndPayInput {
  actor: AgentRole
  orderId: string
  invoiceId: string
}

export class OrderFlowEngine {
  private readonly purchaseRequestService: PurchaseRequestService
  private readonly quoteService: QuoteService
  private readonly orderService: OrderService
  private readonly shipmentService: ShipmentService
  private readonly invoiceService: InvoiceService
  private readonly paymentService: PaymentService

  public constructor(
    purchaseRequestService: PurchaseRequestService,
    quoteService: QuoteService,
    orderService: OrderService,
    shipmentService: ShipmentService,
    invoiceService: InvoiceService,
    paymentService: PaymentService,
  ) {
    this.purchaseRequestService = purchaseRequestService
    this.quoteService = quoteService
    this.orderService = orderService
    this.shipmentService = shipmentService
    this.invoiceService = invoiceService
    this.paymentService = paymentService
  }

  public prepareInitialRequirements(input: PrepareInitialRequirementsInput): PurchaseRequest {
    this.assertActor(input.actor, AgentRole.ReceiverAgent)

    return this.purchaseRequestService.createFromReceiver({
      items: input.items,
      notes: input.notes,
    })
  }

  public prepareQuoteRequest(input: PrepareQuoteRequestInput): Quote {
    this.assertActor(input.actor, AgentRole.PurchasingAgent)
    const purchaseRequest = this.purchaseRequestService.getById(input.purchaseRequestId)
    const quoteItems = this.toQuoteItemsFromRequest(purchaseRequest.items)

    const status = input.requiresSupervisorReview
      ? QuoteStatus.PendingSupervisorReview
      : QuoteStatus.ApprovedForVendorReview

    return this.quoteService.createQuote({
      purchaseRequestId: purchaseRequest.id,
      items: quoteItems,
      requiresSupervisorReview: input.requiresSupervisorReview,
      actor: input.actor,
      status,
      message: 'Purchasing agent prepared quotation request.',
    })
  }

  public reviewBySupervisor(input: ReviewBySupervisorInput): Quote {
    this.assertActor(input.actor, AgentRole.Supervisor)
    const quote = this.quoteService.getById(input.quoteId)
    this.assertQuoteStatus(quote, [QuoteStatus.PendingSupervisorReview])

    if (!input.approved) {
      const rejected = quote.withChanges(
        input.actor,
        {
          status: QuoteStatus.RejectedBySupervisor,
          rejectionReason: input.reason ?? 'Supervisor rejected the quote request.',
        },
        'Supervisor rejected quotation request.',
      )

      return this.quoteService.replace(rejected)
    }

    const approved = quote.withChanges(
      input.actor,
      {
        status: QuoteStatus.ApprovedForVendorReview,
      },
      'Supervisor approved quotation request.',
    )

    return this.quoteService.replace(approved)
  }

  public vendorReviewQuote(actor: AgentRole, quoteId: string): Quote {
    this.assertActor(actor, AgentRole.Vendor)
    const quote = this.quoteService.getById(quoteId)
    this.assertQuoteStatus(quote, [QuoteStatus.ApprovedForVendorReview])

    const reviewed = quote.withChanges(
      actor,
      {
        status: QuoteStatus.VendorReviewed,
      },
      'Vendor reviewed quote request.',
    )

    return this.quoteService.replace(reviewed)
  }

  public createRealQuote(input: CreateRealQuoteInput): Quote {
    this.assertActor(input.actor, AgentRole.Vendor)
    const quote = this.quoteService.getById(input.quoteId)
    this.assertQuoteStatus(quote, [
      QuoteStatus.VendorReviewed,
      QuoteStatus.RealQuoteRejected,
      QuoteStatus.ApprovedForVendorReview,
    ])

    const realItems = input.items.map((item) => new QuoteItem(item))
    const realQuote = quote.withChanges(
      input.actor,
      {
        items: realItems,
        status: QuoteStatus.RealQuoteIssued,
        version: quote.version + 1,
      },
      'Vendor submitted real quote.',
    )

    return this.quoteService.replace(realQuote)
  }

  public reviewRealQuoteByPurchasing(input: ReviewRealQuoteInput): Quote {
    this.assertActor(input.actor, AgentRole.PurchasingAgent)
    const quote = this.quoteService.getById(input.quoteId)
    this.assertQuoteStatus(quote, [QuoteStatus.RealQuoteIssued])

    if (!input.accepted) {
      const rejected = quote.withChanges(
        input.actor,
        {
          status: QuoteStatus.RealQuoteRejected,
          rejectionReason: input.feedback ?? 'Purchasing agent rejected the real quote.',
        },
        `Purchasing agent rejected real quote: ${input.feedback ?? 'No feedback provided.'}`,
      )

      return this.quoteService.replace(rejected)
    }

    const accepted = quote.withChanges(
      input.actor,
      {
        status: QuoteStatus.RealQuoteAccepted,
        rejectionReason: undefined,
      },
      'Purchasing agent accepted real quote.',
    )

    return this.quoteService.replace(accepted)
  }

  public createOrderFromAcceptedQuote(input: CreateOrderInput): Order {
    this.assertActor(input.actor, AgentRole.Vendor)
    const quote = this.quoteService.getById(input.quoteId)
    this.assertQuoteStatus(quote, [QuoteStatus.RealQuoteAccepted])

    const convertedQuote = quote.withChanges(
      input.actor,
      {
        status: QuoteStatus.ConvertedToOrder,
      },
      'Quote converted to order.',
    )
    this.quoteService.replace(convertedQuote)

    return this.orderService.createFromQuote(convertedQuote)
  }

  public receiveOrderByShippingOffice(input: ReceiveOrderInput): Order {
    this.assertActor(input.actor, AgentRole.ShippingOffice)
    const order = this.orderService.getById(input.orderId)
    this.assertOrderStatus(order, [OrderStatus.Created])

    const received = new Order({
      ...order,
      status: OrderStatus.ReceivedByShippingOffice,
      updatedAt: new Date(),
    })

    return this.orderService.replace(received)
  }

  public scheduleShipment(input: ScheduleShipmentInput): ShipmentSchedule {
    this.assertActor(input.actor, AgentRole.ShippingOffice)
    const order = this.orderService.getById(input.orderId)
    this.assertOrderStatus(order, [OrderStatus.ReceivedByShippingOffice])

    const shipment = this.shipmentService.createSchedule(order.id, input.shippingDate)
    const scheduledOrder = new Order({
      ...order,
      status: OrderStatus.ShipmentScheduled,
      shippingDate: shipment.shippingDate,
      updatedAt: new Date(),
    })
    this.orderService.replace(scheduledOrder)

    return shipment
  }

  public generateInvoice(input: GenerateInvoiceInput): Invoice {
    this.assertActor(input.actor, AgentRole.Vendor)
    const order = this.orderService.getById(input.orderId)
    this.assertOrderStatus(order, [OrderStatus.ShipmentScheduled])

    const shipment = this.findShipmentForOrder(order.id)
    const invoice = this.invoiceService.createFromOrder(order, shipment)

    const invoicedOrder = new Order({
      ...order,
      status: OrderStatus.Invoiced,
      updatedAt: new Date(),
    })
    this.orderService.replace(invoicedOrder)

    return invoice
  }

  public receiveShipmentAndInvoice(actor: AgentRole, orderId: string): Order {
    this.assertActor(actor, AgentRole.ReceiverAgent)
    const order = this.orderService.getById(orderId)
    this.assertOrderStatus(order, [OrderStatus.Invoiced])

    const delivered = new Order({
      ...order,
      status: OrderStatus.DeliveredToReceiver,
      updatedAt: new Date(),
    })

    return this.orderService.replace(delivered)
  }

  public payInvoice(input: ReceiveAndPayInput): Payment {
    this.assertActor(input.actor, AgentRole.ReceiverAgent)
    const order = this.orderService.getById(input.orderId)
    this.assertOrderStatus(order, [OrderStatus.DeliveredToReceiver])

    const invoice = this.invoiceService.getById(input.invoiceId)
    if (invoice.orderId !== order.id) {
      throw new InvalidTransitionError('Invoice does not belong to the provided order.')
    }

    const payment = this.paymentService.registerPayment(invoice)

    const paidOrder = new Order({
      ...order,
      status: OrderStatus.Paid,
      updatedAt: new Date(),
    })
    this.orderService.replace(paidOrder)

    return payment
  }

  private assertActor(actual: AgentRole, expected: AgentRole): void {
    if (actual !== expected) {
      throw new UnauthorizedActorError(`Expected actor ${expected}, but received ${actual}.`)
    }
  }

  private assertQuoteStatus(quote: Quote, allowedStatuses: QuoteStatus[]): void {
    if (!allowedStatuses.includes(quote.status)) {
      throw new InvalidTransitionError(
        `Quote transition is not allowed from status "${quote.status}".`,
      )
    }
  }

  private assertOrderStatus(order: Order, allowedStatuses: OrderStatus[]): void {
    if (!allowedStatuses.includes(order.status)) {
      throw new InvalidTransitionError(
        `Order transition is not allowed from status "${order.status}".`,
      )
    }
  }

  private findShipmentForOrder(orderId: string): ShipmentSchedule {
    const shipment = this.shipmentService.getAll().find((entry) => entry.orderId === orderId)
    if (!shipment) {
      throw new NotFoundError(`Shipment schedule for order "${orderId}" was not found.`)
    }

    return shipment
  }

  private toQuoteItemsFromRequest(items: RequestedItem[]): QuoteItem[] {
    return items.map(
      (item) =>
        new QuoteItem({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: 0,
        }),
    )
  }
}
