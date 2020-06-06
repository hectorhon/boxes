import React, { useState, useEffect } from 'react'

function ImageViewer(props) {
  const { imageId: id, rootPath } = props

  const [image, setImage] = useState()
  const [tagsInput, setTagsInput] = useState('')
  const [tags, setTags] = useState([])

  useEffect(() => {
    async function f() {
      const image = await fetch(`/api/filestore/image/${id}`)
        .then(response => response.json())
      setImage(image)
    }
    f()
  }, [])

  return (
    <div>
      <div className='image-viewer'>
        <div className="img-container">
          {image &&
           <img title={image.name}
                alt={image.name}
                src={rootPath + image.path} />
          }
        </div>
        <div>
          <textarea value={tagsInput}
                    onChange={event => {
                      setTagsInput(event.target.value)
                    }}
                    onBlur={() => {
                      const tags = tagsInput.split(',')
                        .map(tag => tag.trim())
                        .map(tag => tag.split(' ').filter(word => word).join(' '))
                        .filter(tag => tag)
                      const uniqueTags = [...new Set(tags)]
                      setTags(uniqueTags)
                      setTagsInput(uniqueTags.join(', '))
                    }}>
          </textarea>
          <ul>
            {tags.map(tag => <li key={tag}>{tag}</li>)}
          </ul>
          <pre><code>{JSON.stringify(image, null, 2)}</code></pre>
        </div>
      </div>
    </div>
  )
}

export default ImageViewer
