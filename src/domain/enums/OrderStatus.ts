export const OrderStatus = {
  Created: 'Created',
  ReceivedByShippingOffice: 'ReceivedByShippingOffice',
  ShipmentScheduled: 'ShipmentScheduled',
  Invoiced: 'Invoiced',
  DeliveredToReceiver: 'DeliveredToReceiver',
  Paid: 'Paid',
} as const

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]
