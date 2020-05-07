import React, { useState, useEffect, useRef } from 'react'

function getData(dataSource, pageSize = 10, pageNumber = 1) {
  if (typeof dataSource === 'function') {
    return dataSource(pageSize, pageNumber)
  } else if (typeof dataSource === 'object') {
    return {
      rows: dataSource.slice(
        (pageNumber - 1) * pageSize,
        (pageNumber - 1) * pageSize + pageSize
      ),
      length: dataSource.length,
    }
  } else {
    console.error('Unexpected or missing prop value for "dataSource"')
    return []
  }
}

function Table(props) {
  const { columns, dataSource } = props

  const [pageSize, setPageSize] = useState(3)
  const [pageNumber, setPageNumber] = useState(1)

  const { rows, length } = getData(dataSource, pageSize, pageNumber)

  const totalPages = Math.max(1, Math.ceil(length / pageSize))

  const [tableMinHeight, setTableMinHeight] = useState(0)
  const tableWrapperRef = useRef()

  useEffect(() => {
    const renderedHeight = tableWrapperRef.current.offsetHeight
    console.log(`Setting table min height to ${renderedHeight}`)
    setTableMinHeight(renderedHeight)
  }, [])

  return (
    <div>
      <div ref={tableWrapperRef} style={{ minHeight: tableMinHeight }}>
        <table>
          <thead>
            <tr>
              {columns.map(column => (<th key={column.name}>{column.label}</th>))}
            </tr>
          </thead>
          <tbody>
            {
              rows.map(row => (
                <tr key={row.id}>
                  {
                    columns.map(column => (
                      <td key={column.name}>{row[column.name]}</td>
                    ))
                  }
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
      <p>
        <button disabled={pageNumber === 1}
                onClick={() => setPageNumber(pageNumber - 1)}>
          Prev
        </button>
        Page {pageNumber} of {totalPages}
        <button disabled={pageNumber === totalPages}
                onClick={() => setPageNumber(pageNumber + 1)}>
          Next
        </button>
      </p>
    </div>
  )
}

export default Table
