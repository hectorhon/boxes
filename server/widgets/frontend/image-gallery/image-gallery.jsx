import React, { useState, useEffect } from 'react'

async function getData(dataSource, searchText, pageSize = 10, pageNumber = 1) {
  if (typeof dataSource === 'function') {
    return await dataSource(searchText, pageSize, pageNumber)
  } else if (Array.isArray(dataSource)) {
    const searchTokens = searchText.split(' ')
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
      length: filteredImages.length,
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
    length: 0,
  })
  const [pageSize, setPageSize] = useState(3)
  const [pageNumber, setPageNumber] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    async function f() {
      const d = await getData(dataSource, searchText, pageSize, pageNumber)
      setData(d)
      setTotalPages(Math.max(1, Math.ceil(d.length / pageSize)))
    }
    f()
  }, [pageSize, pageNumber, searchText])

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
      <div className='image-gallery'>
        {
          data.images.map(image => (
            <div className="img-container">
              <img key={image.id}
                   title={image.name}
                   alt={image.name}
                   src={rootPath + image.path} />
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
