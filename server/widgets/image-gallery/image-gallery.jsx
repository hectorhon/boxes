import React, { useState, useEffect } from 'react'
import classNames from 'classnames'
import ImageGalleryTagger from './image-gallery-tagger.jsx'

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
  const [pageSize, setPageSize] = useState(50)
  const [pageNumber, setPageNumber] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [query, setQuery] = useState('')
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [selectedImageIds, setSelectedImageIds] = useState([])
  const [isTaggerVisible, setIsTaggerVisible] = useState(false)
  const [lastClickAction, setLastClickAction] = useState(null)  // 'select' or 'deselect'
  const [lastClickImageId, setLastClickImageId] = useState(null)

  useEffect(() => {
    async function f() {
      const d = await getData(dataSource, query, pageSize, pageNumber)
      setData(d)
      setTotalPages(Math.max(1, Math.ceil(d.total / pageSize)))
    }
    f()
  }, [pageSize, pageNumber, query])

  function addTags(imageIds, tagsToAdd) {
    setData(prevData => {
      return {
        ...data,
        images: prevData.images.map(image => {
          if (imageIds.includes(image.id)) {
            return {
              ...image,
              tags: [
                ...image.tags,
                ...tagsToAdd.filter(newTag => !image.tags.includes(newTag)),
              ],
            }
          } else {
            return image
          }
        }),
      }
    })
  }

  function removeTags(imageIds, tagsToRemove) {
    setData(prevData => {
      return {
        ...data,
        images: prevData.images.map(image => {
          if (imageIds.includes(image.id)) {
            return {
              ...image,
              tags: image.tags.filter(tag => !tagsToRemove.includes(tag)),
            }
          } else {
            return image
          }
        }),
      }
    })
  }

  return (
    <div className="image-gallery">
      <div className="image-gallery-header">
        <div className="image-gallery-toolbar">
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
          {isSelectMode && <span>{selectedImageIds.length} items selected</span>}
          <button onClick={() => {
            setSelectedImageIds([])
            if (isSelectMode) {
              setIsTaggerVisible(false)
            } else {
              setIsTaggerVisible(true)
            }
            setIsSelectMode(!isSelectMode)
          }}>
            {isSelectMode ? 'Stop' : 'Start'} select mode
          </button>
          <button onClick={() => setIsTaggerVisible(!isTaggerVisible)}
                  disabled={!isSelectMode}>
            {isTaggerVisible ? 'Hide' : 'Show'} tagger
          </button>
        </div>
        {
          isTaggerVisible &&
            <ImageGalleryTagger selectedImageIds={selectedImageIds}
                                onTagsAdded={addTags}
                                onTagsRemoved={removeTags} />
        }
      </div>
      <div className='image-gallery-grid'>
        {
          data.images.map(image => {
            return (
              <div key={image.id} className="image-gallery-item">
                <a href={isSelectMode ? 'javascript:void(0);' : '/filestore/images/view?id=' + image.id}
                   className={classNames({
                     "img-container": true,
                     "img-container-selected": selectedImageIds.indexOf(image.id) >= 0,
                   })}
                   onClick={event => {
                     if (!isSelectMode) {
                       return
                     }
                     if (event.shiftKey) {
                       event.preventDefault()  // avoid opening new tab due to shift+click
                       const imageIds = data.images.map(image => image.id)
                       const index1 = imageIds.indexOf(lastClickImageId)
                       const index2 = imageIds.indexOf(image.id)
                       const startIndex = Math.min(index1, index2)
                       const endIndex = Math.max(index1, index2)
                       const selection = imageIds.slice(startIndex, endIndex + 1)
                       if (lastClickAction === 'select') {
                         setSelectedImageIds([...new Set([...selectedImageIds, ...selection])])
                       } else if (lastClickAction === 'deselect') {
                         setSelectedImageIds(selectedImageIds.filter(imageId => !selection.includes(imageId)))
                       }
                     } else {
                       if (selectedImageIds.indexOf(image.id) >= 0) {
                         setSelectedImageIds(selectedImageIds.filter(id => id != image.id))
                         setLastClickAction('deselect')
                       } else {
                         setSelectedImageIds([...selectedImageIds, image.id])
                         setLastClickAction('select')
                       }
                     }
                     setLastClickImageId(image.id)
                   }} >
                  <img title={image.name}
                       alt={image.name}
                       src={rootPath + image.thumbnail_path} />
                </a>
                <div className="image-gallery-item-description">
                  {image.tags.length ? image.tags.join(', ') : '(no tags)'}
                </div>
              </div>
            )})
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
