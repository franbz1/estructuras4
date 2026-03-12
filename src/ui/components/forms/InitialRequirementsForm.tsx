import { useState } from 'react'
import type { InitialItemInput } from '../../hooks/useWorkflowController.ts'

interface InitialRequirementsFormProps {
  onSubmit: (items: InitialItemInput[], notes?: string) => void
}

interface FormItemState {
  id: string
  name: string
  quantity: string
}

export function InitialRequirementsForm({ onSubmit }: InitialRequirementsFormProps) {
  const [items, setItems] = useState<FormItemState[]>([
    { id: 'item-1', name: 'Laptop', quantity: '1' },
  ])
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string>()

  const addItem = (): void => {
    setItems((previous) => [
      ...previous,
      { id: `item-${previous.length + 1}`, name: '', quantity: '1' },
    ])
  }

  const updateItem = (index: number, changes: Partial<FormItemState>): void => {
    setItems((previous) =>
      previous.map((item, current) => (current === index ? { ...item, ...changes } : item)),
    )
  }

  const handleSubmit = (): void => {
    if (items.length === 0) {
      setError('At least one item is required.')
      return
    }

    const parsedItems: InitialItemInput[] = []
    for (const item of items) {
      if (!item.id.trim() || !item.name.trim()) {
        setError('Item id and name are required.')
        return
      }

      const quantity = Number(item.quantity)
      if (!Number.isFinite(quantity) || quantity <= 0) {
        setError('Quantity must be greater than zero.')
        return
      }

      parsedItems.push({
        id: item.id.trim(),
        name: item.name.trim(),
        quantity,
      })
    }

    setError(undefined)
    onSubmit(parsedItems, notes.trim() || undefined)
  }

  return (
    <section className="panel" data-testid="form-initial-requirements">
      <h2>AR Prepare Initial Requirements</h2>
      {items.map((item, index) => (
        <div className="grid-4" key={`${item.id}-${index}`}>
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
            value={item.quantity}
            onChange={(event) => updateItem(index, { quantity: event.target.value })}
            placeholder="Quantity"
            type="number"
            min={1}
          />
        </div>
      ))}
      <div className="row">
        <button type="button" onClick={addItem}>
          Add item
        </button>
      </div>
      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Optional notes"
      />
      {error ? <p className="error-text">{error}</p> : null}
      <button type="button" onClick={handleSubmit}>
        Submit initial requirements
      </button>
    </section>
  )
}
