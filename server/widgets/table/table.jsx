import React, { useState, useRef, useEffect } from 'react'

import useDebounce from '../useDebounce.jsx'

async function getData(dataSource, searchText, pageSize = 10, pageNumber = 1) {
  if (typeof dataSource === 'function') {
    const data = await dataSource(pageSize, pageNumber, searchText)
    return data
  } else if (Array.isArray(dataSource)) {
    const searchTokens = searchText.split(' ')
      .filter(token => token.length > 0)
      .map(token => token.toLowerCase())
    const filteredRows = searchTokens.length === 0 ? dataSource : dataSource.filter(row => {
      const values = Object.keys(row)
        .filter(key => key !== 'id')
        .map(key => row[key])
      return searchTokens.every(token => {
        return values.some(value => {
          return value.toString().toLowerCase().indexOf(token) >= 0
        })
      })
    })
    return {
      rows: filteredRows.slice(
        (pageNumber - 1) * pageSize,
        (pageNumber - 1) * pageSize + pageSize
      ),
      length: filteredRows.length,
    }
  } else {
    console.error('Unsupported or missing prop value for "dataSource"')
    return []
  }
}

function Table(props) {
  const { columns, dataSource, pageSize } = props

  const [data, setData] = useState({
    rows: [],
    length: 0,
  })
  const [pageNumber, setPageNumber] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchText, setSearchText] = useState('')
  const debouncedSearchText = useDebounce(searchText, 250)

  const [tableMinHeight, setTableMinHeight] = useState(0)
  const tableWrapperRef = useRef()

  useEffect(() => {
    async function f() {
      const d = await getData(dataSource, debouncedSearchText, pageSize, pageNumber)
      setData(d)
      setTotalPages(Math.max(1, Math.ceil(d.length / pageSize)))
      if (tableMinHeight === 0) {
        const renderedHeight = tableWrapperRef.current.offsetHeight
        setTableMinHeight(renderedHeight)
      }
    }
    f()
  }, [pageSize, pageNumber, debouncedSearchText])

  return (
    <div>
      <p>
        <input type='text'
               placeholder='Search...'
               value={searchText}
               onChange={event => {
                 setPageNumber(1)
                 setSearchText(event.target.value)
               }} />
        <button type='button' onClick={() => {
          setPageNumber(1)
          setSearchText('')
        }}>Clear</button>
      </p>
      <div ref={tableWrapperRef} style={{ minHeight: tableMinHeight }}>
        <table>
          <thead>
            <tr>
              {columns.map(column => (<th key={column.name}>{column.label}</th>))}
            </tr>
          </thead>
          <tbody>
            {
              data.rows.map(row => (
                <tr key={row.id}>
                  {
                    columns.map(column => {
                      if (typeof column.escapedHtml === 'function') {
                        return (
                          <td key={column.name} dangerouslySetInnerHTML={{
                            __html: column.escapedHtml(row)
                          }}></td>
                        )
                      } else {
                        return (
                          <td key={column.name}>{row[column.name]}</td>
                        )
                      }
                    })
                  }
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
      <p>
        <button type='button'
                disabled={pageNumber === 1}
                onClick={() => setPageNumber(pageNumber - 1)}>
          Prev
        </button>
        Page {pageNumber} of {totalPages}
        <button type='button'
                disabled={pageNumber === totalPages}
                onClick={() => setPageNumber(pageNumber + 1)}>
          Next
        </button>
      </p>
    </div>
  )
}

Table.defaultProps = {
  pageSize: 10,
}

export default Table
