export const QuoteStatus = {
  DraftFromRequirements: 'DraftFromRequirements',
  RequestedForQuotation: 'RequestedForQuotation',
  PendingSupervisorReview: 'PendingSupervisorReview',
  RejectedBySupervisor: 'RejectedBySupervisor',
  ApprovedForVendorReview: 'ApprovedForVendorReview',
  VendorReviewed: 'VendorReviewed',
  RealQuoteIssued: 'RealQuoteIssued',
  RealQuoteRejected: 'RealQuoteRejected',
  RealQuoteAccepted: 'RealQuoteAccepted',
  ConvertedToOrder: 'ConvertedToOrder',
} as const

export type QuoteStatus = (typeof QuoteStatus)[keyof typeof QuoteStatus]
