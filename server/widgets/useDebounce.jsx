import { useState, useEffect } from 'react'

function useDebounce(value, delay = 250) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => {
      clearTimeout(timeoutId)
    }
  }, [value, delay])
  return debouncedValue
}

export default useDebounce
