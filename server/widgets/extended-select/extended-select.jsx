import { useState, useEffect, useRef } from 'react'
import classNames from 'classnames'

function ExtendedSelect(props) {
  const {
    placeholder,
    dataSource,
    onChange, onEnterKey, shouldClearAfterEnter
  } = props

  const [query, setQuery] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [selectedSuggestion, setSelectedSuggestion] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    onChange(query)
  }, [query])

  const timeoutIdRef = useRef(null)

  useEffect(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current)
    }
    timeoutIdRef.current = setTimeout(async () => {
      setIsLoading(true)
      const response = await dataSource(query)
      setIsLoading(false)
      setSelectedSuggestion(null)
      setSuggestions(response)
    }, 250)
  }, [query])

  const containerRef = useRef(null)

  async function handleClickOutside(event) {
    if (!containerRef.current.contains(event.target)) {
      setIsDropdownOpen(false)
    }
  }

  useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener('mouseup', handleClickOutside, { capture: true })
    } else {
      document.removeEventListener('mouseup', handleClickOutside, { capture: true })
    }
    return () => {
      document.removeEventListener('mouseup', handleClickOutside, { capture: true })
    }
  }, [isDropdownOpen])

  function handleSpecialKeyEvents(event) {
    switch (event.key) {
      case 'ArrowDown':
        {
          const index = suggestions.indexOf(selectedSuggestion)
          if (index < 0) {
            setSelectedSuggestion(suggestions[0])
          } else if (index === suggestions.length - 1) {
            setSelectedSuggestion(suggestions[suggestions.length - 1])
          } else {
            setSelectedSuggestion(suggestions[index + 1])
          }
        }
        break
      case 'ArrowUp':
        {
          const index = suggestions.indexOf(selectedSuggestion)
          if (index < 0) {
            setSelectedSuggestion(suggestions[suggestions.length - 1])
          } else if (index === 0) {
            setSelectedSuggestion(suggestions[0])
          } else {
            setSelectedSuggestion(suggestions[index - 1])
          }
        }
        break
      case 'Enter':
        if (selectedSuggestion) {
          onEnterKey(selectedSuggestion)
        } else {
          onEnterKey(query)
        }
        if (shouldClearAfterEnter) {
          setQuery('')
        } else {
          if (selectedSuggestion) {
            setQuery(selectedSuggestion)
          }
        }
        setIsDropdownOpen(false)
        break
      case 'Tab':
        if (selectedSuggestion) {
          setQuery(selectedSuggestion)
        }
        setIsDropdownOpen(false)
        break
      case 'Escape':
        setIsDropdownOpen(false)
        break
      default:
    }
  }

  return (
    <div className="extended-select-container">
      <div className="extended-select-input-container" ref={containerRef}>
        <input type="text"
               placeholder={placeholder}
               value={query}
               onKeyDown={handleSpecialKeyEvents}
               onChange={event => {
                 setQuery(event.target.value)
                 setIsDropdownOpen(true)
               }} />
        {isDropdownOpen && suggestions.length > 0 && (
          <ol className="extended-select-dropdown">
            {suggestions.map(suggestion => {
              const classes = classNames({
                'extended-select-dropdown-suggestions': true,
                'extended-select-dropdown-suggestions-selected': selectedSuggestion === suggestion,
              })
              return (
                <li key={suggestion}
                    className={classes}
                    onMouseEnter={() => setSelectedSuggestion(suggestion)}
                    onMouseLeave={() => setSelectedSuggestion(null)}
                    onClick={() => {
                      setQuery(suggestion)
                      setIsDropdownOpen(false)
                    }} >
                  {suggestion}
                </li>
              )
            })}
          </ol>
        )}
      </div>
      {isLoading && isDropdownOpen && <div className="spinner"></div>}
    </div>
  )
}

ExtendedSelect.defaultProps = {
  placeholder: 'Search...',
  onChange: () => {},
  onEnterKey: () => {}
}

export default ExtendedSelect
