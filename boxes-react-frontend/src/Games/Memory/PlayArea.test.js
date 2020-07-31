import React from 'react'
import { render, cleanup } from '@testing-library/react'
import io from 'socket.io-client'

import PlayArea from './PlayArea'

const mockIoClose = jest.fn()
const mockIoOn = jest.fn()
jest.mock('socket.io-client', () => jest.fn().mockImplementation(() => ({
  close: mockIoClose,
  on: mockIoOn,
})))

test('connects to the server upon construction', () => {
  render(<PlayArea />)
  expect(io).toHaveBeenCalledTimes(1)
})

test('disconnects from the server when component is destroyed', () => {
  render(<PlayArea />)
  cleanup()
  expect(mockIoClose).toHaveBeenCalledTimes(1)
})
