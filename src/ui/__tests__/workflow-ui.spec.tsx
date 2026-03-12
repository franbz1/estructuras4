import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from '../App.tsx'

async function clickByName(name: string): Promise<void> {
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name }))
}

describe('workflow ui interactions', () => {
  it('executes a full successful workflow from UI', async () => {
    render(<App />)

    await clickByName('Submit initial requirements')
    await clickByName('Submit quote request')
    await clickByName('Approve quote request')
    await clickByName('Mark quote as reviewed')
    await clickByName('Submit real quote')
    await clickByName('Accept quote')
    await clickByName('Create order from accepted quote')
    await clickByName('Confirm order reception')
    await clickByName('Schedule shipment')
    await clickByName('Generate invoice')
    await clickByName('Confirm shipment and invoice received')
    await clickByName('Pay invoice')

    await waitFor(() => {
      expect(screen.getByTestId('workflow-finished')).toBeTruthy()
      expect(screen.getByText('Workflow completed')).toBeTruthy()
    })
  })

  it('supports supervisor and real quote rejection loops', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Submit initial requirements' }))
    await user.click(screen.getByRole('button', { name: 'Submit quote request' }))
    await user.click(screen.getByRole('button', { name: 'Reject and restart' }))

    await waitFor(() => {
      expect(screen.getByTestId('form-initial-requirements')).toBeTruthy()
    })

    await user.click(screen.getByRole('button', { name: 'Submit initial requirements' }))
    await user.click(screen.getByRole('button', { name: 'Submit quote request' }))
    await user.click(screen.getByRole('button', { name: 'Approve quote request' }))
    await user.click(screen.getByRole('button', { name: 'Mark quote as reviewed' }))
    await user.click(screen.getByRole('button', { name: 'Submit real quote' }))
    await user.click(screen.getByRole('button', { name: 'Reject with feedback' }))

    await waitFor(() => {
      expect(screen.getByTestId('form-real-quote')).toBeTruthy()
    })
  })
})
