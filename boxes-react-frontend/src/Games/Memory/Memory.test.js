import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'

import Memory from './Memory'
import PlayArea from './PlayArea'

jest.mock('./PlayArea')
PlayArea.mockImplementation(() => <div>Mock play area</div>)

test('asks for nickname before showing play area', () => {
  const { getByLabelText } = render(<Memory />)
  const input = getByLabelText('Choose a nickname')
  expect(input).toBeInTheDocument()
  expect(PlayArea).toHaveBeenCalledTimes(0)
})

test('user cannot submit empty nickname', async () => {
  const { getByLabelText, getByText, queryByText } = render(<Memory />)
  const input = getByLabelText('Choose a nickname')
  await act(async () => {
    fireEvent.change(input, { target: { value: '' } })
    fireEvent.click(getByText('Enter'))
  })
  const warning = queryByText('Please enter a nickname.')
  expect(warning).toBeInTheDocument()
  expect(input).toBeInTheDocument()
  expect(PlayArea).toHaveBeenCalledTimes(0)
})

test('replace nickname form with play area after user provides a nickname', async () => {
  const { getByLabelText, getByText } = render(<Memory />)
  const input = getByLabelText('Choose a nickname')
  await act(async () => {
    fireEvent.change(input, { target: { value: 'james' } })
    fireEvent.click(getByText('Enter'))
  })
  expect(input).not.toBeInTheDocument()
  expect(PlayArea).toHaveBeenCalledTimes(1)
})
