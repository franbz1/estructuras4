import { ValidationError } from '../errors/ValidationError.ts'

export interface QuoteItemProps {
  id: string
  name: string
  unitPrice: number
  quantity: number
}

export class QuoteItem {
  public readonly id: string
  public readonly name: string
  public readonly unitPrice: number
  public readonly quantity: number

  public constructor(props: QuoteItemProps) {
    this.ensureValid(props)
    this.id = props.id
    this.name = props.name.trim()
    this.unitPrice = props.unitPrice
    this.quantity = props.quantity
  }

  public get subtotal(): number {
    return this.unitPrice * this.quantity
  }

  public withChanges(changes: Partial<Omit<QuoteItemProps, 'id'>>): QuoteItem {
    return new QuoteItem({
      id: this.id,
      name: changes.name ?? this.name,
      unitPrice: changes.unitPrice ?? this.unitPrice,
      quantity: changes.quantity ?? this.quantity,
    })
  }

  private ensureValid(props: QuoteItemProps): void {
    if (!props.id.trim()) {
      throw new ValidationError('Quote item id cannot be empty.')
    }

    if (!props.name.trim()) {
      throw new ValidationError('Quote item name cannot be empty.')
    }

    if (props.quantity <= 0) {
      throw new ValidationError('Quote item quantity must be greater than zero.')
    }

    if (props.unitPrice < 0) {
      throw new ValidationError('Quote item unit price cannot be negative.')
    }
  }
}
