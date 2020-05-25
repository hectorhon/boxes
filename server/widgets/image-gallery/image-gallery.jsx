import React, { useState, useEffect } from 'react'

async function getData(dataSource, query, pageSize = 10, pageNumber = 1) {
  if (typeof dataSource === 'function') {
    return await dataSource(query, pageSize, pageNumber)
  } else if (Array.isArray(dataSource)) {
    const searchTokens = query.split(' ')
      .filter(token => token.length > 0)
      .map(token => token.toLowerCase())
    const filteredImages = searchTokens.length === 0 ? dataSource : dataSource.filter(image => {
      const values = Object.keys(image)
        .filter(key => key !== 'id')
        .map(key => image[key])
      return searchTokens.every(token => {
        return values.some(value => {
          return value.toString().toLowerCase().indexOf(token) >= 0
        })
      })
    })
    return {
      images: filteredImages.slice(
        (pageNumber - 1) * pageSize,
        (pageNumber - 1) * pageSize + pageSize
      ),
      total: filteredImages.length,
    }
  } else {
    console.error('Unsupported or missing prop value for "dataSource"')
    return []
  }
}

function ImageGallery(props) {
  const { dataSource, rootPath } = props

  const [data, setData] = useState({
    images: [],
    total: 0,
  })
  const [pageSize, setPageSize] = useState(10)
  const [pageNumber, setPageNumber] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [query, setQuery] = useState('')

  useEffect(() => {
    async function f() {
      const d = await getData(dataSource, query, pageSize, pageNumber)
      setData(d)
      setTotalPages(Math.max(1, Math.ceil(d.total / pageSize)))
    }
    f()
  }, [pageSize, pageNumber, query])

  return (
    <div>
      <p>
        <input type='text'
               placeholder='Search...'
               value={query}
               onChange={event => {
                 setPageNumber(1)
                 setQuery(event.target.value)
               }} />
        <button type='button' onClick={() => {
          setPageNumber(1)
          setQuery('')
        }}>Clear</button>
      </p>
      <div className='image-gallery'>
        {
          data.images.map(image => (
            <div key={image.id} className="img-container">
              <img title={image.name}
                   alt={image.name}
                   src={rootPath + image.thumbnail_path} />
            </div>
          ))
        }
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

export default ImageGallery
