import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('application navigation', () => {
  it('moves from the landing page to a selected algorithm workspace', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /start simulation/i }))
    fireEvent.click(screen.getByRole('button', { name: /round robin/i }))

    expect(screen.getByRole('heading', { name: /round robin/i })).toBeTruthy()
    expect(screen.getByRole('spinbutton', { name: /time quantum/i })).toBeTruthy()
  })
})
