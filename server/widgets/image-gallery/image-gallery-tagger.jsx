import React, { useState, useEffect } from 'react'

function ImageGalleryTagger(props) {
  const { selectedImageIds, onTagsAdded, onTagsRemoved } = props

  const [tagsInput, setTagsInput] = useState('')

  async function addTags() {
    const tags = tagsInput.split(',').map(tag => tag.trim())
    await fetch('/api/filestore/image/add-tags', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageIds: selectedImageIds,
        tagsToAdd: tags
      }),
    })
    onTagsAdded(selectedImageIds, tags)
  }

  async function removeTags() {
    const tags = tagsInput.split(',').map(tag => tag.trim())
    await fetch('/api/filestore/image/remove-tags', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageIds: selectedImageIds,
        tagsToRemove: tags
      }),
    })
    onTagsRemoved(selectedImageIds, tags)
  }

  return (
    <form className="image-gallery-tagger">
      <ul>
        <li>Tag 1</li>
        <li>Tag 2</li>
      </ul>
      <textarea rows="4" cols="120"
                value={tagsInput}
                onChange={event => setTagsInput(event.target.value)} />
      <div>
        <button type="button"
                onClick={addTags}>
          Add tags to selected images
        </button>
        <button type="button"
                onClick={removeTags}>
          Remove tags from selected images
        </button>
      </div>
    </form>
  )
}

export default ImageGalleryTagger
