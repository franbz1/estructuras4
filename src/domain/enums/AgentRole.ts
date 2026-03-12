export const AgentRole = {
  ReceiverAgent: 'AR',
  PurchasingAgent: 'AC',
  Supervisor: 'S',
  Vendor: 'V',
  ShippingOffice: 'OE',
} as const

export type AgentRole = (typeof AgentRole)[keyof typeof AgentRole]
