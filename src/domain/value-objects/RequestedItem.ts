import { ValidationError } from '../errors/ValidationError.ts'

export interface RequestedItemProps {
  id: string
  name: string
  quantity: number
}

export class RequestedItem {
  public readonly id: string
  public readonly name: string
  public readonly quantity: number

  public constructor(props: RequestedItemProps) {
    if (!props.id.trim()) {
      throw new ValidationError('Requested item id cannot be empty.')
    }

    if (!props.name.trim()) {
      throw new ValidationError('Requested item name cannot be empty.')
    }

    if (props.quantity <= 0) {
      throw new ValidationError('Requested item quantity must be greater than zero.')
    }

    this.id = props.id
    this.name = props.name.trim()
    this.quantity = props.quantity
  }
}
