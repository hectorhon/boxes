import React from 'react'
import { render } from '@testing-library/react'
import App from './App'

test('has a link to the Memory Game', () => {
  const { getByText } = render(<App />)
  const link = getByText(/memory game/i)
  expect(link).toBeInTheDocument()
  expect(link).toHaveAttribute('href', '/games/memory')
})
