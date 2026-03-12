import { PurchaseRequest } from '../entities/PurchaseRequest.ts'
import { AgentRole } from '../enums/AgentRole.ts'
import { RequestedItem } from '../value-objects/RequestedItem.ts'
import { createId } from '../utils/id.ts'
import { BaseInMemoryService } from './BaseInMemoryService.ts'

export interface CreatePurchaseRequestInput {
  items: RequestedItem[]
  notes?: string
}

export class PurchaseRequestService extends BaseInMemoryService<PurchaseRequest> {
  public createFromReceiver(input: CreatePurchaseRequestInput): PurchaseRequest {
    const purchaseRequest = new PurchaseRequest({
      id: createId('purchase-request'),
      createdBy: AgentRole.ReceiverAgent,
      items: input.items,
      createdAt: new Date(),
      notes: input.notes,
    })

    return this.create(purchaseRequest)
  }
}
