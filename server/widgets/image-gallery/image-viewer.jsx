import React, { useState, useEffect } from 'react'

function ImageViewer(props) {
  const { imageId: id, rootPath } = props

  const [image, setImage] = useState()
  const [tagsInput, setTagsInput] = useState('')

  useEffect(() => {
    async function f() {
      const image = await fetch(`/api/filestore/image/${id}`)
        .then(response => response.json())
      setImage(image)
      setTagsInput(image.tags.join(', '))
    }
    f()
  }, [])

  return (
    <div className='image-viewer'>
      <div className="img-container">
        {image &&
         <img title={image.name}
              alt={image.name}
              src={rootPath + image.path} />
        }
      </div>
      {image &&
       <form method="post" action={"/filestore/images/update?id=" + image.id}>
         <div className="form-fields-container">
           <label>Title</label>
           <input name="title"
                  value={image.title}
                  onChange={event => {
                    const input = event.target.value
                    setImage(image => ({
                      ...image,
                      title: input,
                    }))
                  }} />
           <label>Tags</label>
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
                       setImage(image => ({
                         ...image,
                         tags: uniqueTags,
                       }))
                       setTagsInput(uniqueTags.join(', '))
                     }}>
           </textarea>
           <input type="hidden" readOnly name="tags" value={image.tags} />
         </div>
         <button>Save</button>
         <pre><code>{JSON.stringify(image, null, 2)}</code></pre>
       </form>
      }
    </div>
  )
}

export default ImageViewer
