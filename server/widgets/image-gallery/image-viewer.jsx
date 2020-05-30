import React, { useState, useEffect } from 'react'

function ImageViewer(props) {
  const { imageId: id, rootPath } = props

  const [image, setImage] = useState()

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
        <pre><code>{JSON.stringify(image, null, 2)}</code></pre>
      </div>
    </div>
  )
}

export default ImageViewer
