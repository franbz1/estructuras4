import { useState } from 'react'
import type { RealQuoteItemInput } from '../../hooks/useWorkflowController.ts'

interface RealQuoteFormProps {
  onSubmit: (items: RealQuoteItemInput[]) => void
}

interface RealItemState {
  id: string
  name: string
  quantity: string
  unitPrice: string
}

export function RealQuoteForm({ onSubmit }: RealQuoteFormProps) {
  const [items, setItems] = useState<RealItemState[]>([
    { id: 'item-1', name: 'Laptop', quantity: '1', unitPrice: '1000' },
  ])
  const [error, setError] = useState<string>()

  const addItem = (): void => {
    setItems((previous) => [
      ...previous,
      { id: `item-${previous.length + 1}`, name: '', quantity: '1', unitPrice: '0' },
    ])
  }

  const updateItem = (index: number, changes: Partial<RealItemState>): void => {
    setItems((previous) =>
      previous.map((item, current) => (current === index ? { ...item, ...changes } : item)),
    )
  }

  const handleSubmit = (): void => {
    const payload: RealQuoteItemInput[] = []
    for (const item of items) {
      if (!item.id.trim() || !item.name.trim()) {
        setError('Item id and name are required.')
        return
      }
      const quantity = Number(item.quantity)
      const unitPrice = Number(item.unitPrice)
      if (!Number.isFinite(quantity) || quantity <= 0) {
        setError('Quantity must be greater than zero.')
        return
      }
      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        setError('Unit price must be zero or greater.')
        return
      }

      payload.push({
        id: item.id.trim(),
        name: item.name.trim(),
        quantity,
        unitPrice,
      })
    }

    setError(undefined)
    onSubmit(payload)
  }

  return (
    <section className="panel" data-testid="form-real-quote">
      <h2>V Create Real Quote</h2>
      {items.map((item, index) => (
        <div key={`${item.id}-${index}`} className="grid-4">
          <input
            value={item.id}
            onChange={(event) => updateItem(index, { id: event.target.value })}
            placeholder="Item id"
          />
          <input
            value={item.name}
            onChange={(event) => updateItem(index, { name: event.target.value })}
            placeholder="Item name"
          />
          <input
            type="number"
            min={1}
            value={item.quantity}
            onChange={(event) => updateItem(index, { quantity: event.target.value })}
            placeholder="Quantity"
          />
          <input
            type="number"
            min={0}
            value={item.unitPrice}
            onChange={(event) => updateItem(index, { unitPrice: event.target.value })}
            placeholder="Unit price"
          />
        </div>
      ))}
      <div className="row">
        <button type="button" onClick={addItem}>
          Add item
        </button>
      </div>
      {error ? <p className="error-text">{error}</p> : null}
      <button type="button" onClick={handleSubmit}>
        Submit real quote
      </button>
    </section>
  )
}
