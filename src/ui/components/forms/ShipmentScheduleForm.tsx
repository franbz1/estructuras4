import { useState } from 'react'

interface ShipmentScheduleFormProps {
  onSchedule: (shippingDate: Date) => void
}

function toInputDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function ShipmentScheduleForm({ onSchedule }: ShipmentScheduleFormProps) {
  const [shippingDate, setShippingDate] = useState<string>(
    toInputDate(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)),
  )
  const [error, setError] = useState<string>()

  const handleSubmit = (): void => {
    const parsedDate = new Date(shippingDate)
    if (Number.isNaN(parsedDate.getTime())) {
      setError('A valid shipping date is required.')
      return
    }

    if (parsedDate.getTime() <= Date.now()) {
      setError('Shipping date must be in the future.')
      return
    }

    setError(undefined)
    onSchedule(parsedDate)
  }

  return (
    <section className="panel" data-testid="form-shipment-schedule">
      <h2>OE Schedule Shipment</h2>
      <input
        type="date"
        value={shippingDate}
        onChange={(event) => setShippingDate(event.target.value)}
      />
      {error ? <p className="error-text">{error}</p> : null}
      <button type="button" onClick={handleSubmit}>
        Schedule shipment
      </button>
    </section>
  )
}
