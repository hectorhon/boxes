import React, { useState, useEffect } from 'react'

function ImageGalleryTagger(props) {
  const { selectedImageIds, onTagsAdded, onTagsRemoved } = props

  const [tagsInput, setTagsInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(null)

  async function addTags() {
    const tags = tagsInput.split(',').map(tag => tag.trim())
    setIsProcessing(true)
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
    setIsProcessing(false)
    onTagsAdded(selectedImageIds, tags)
  }

  async function removeTags() {
    const tags = tagsInput.split(',').map(tag => tag.trim())
    setIsProcessing(true)
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
    setIsProcessing(false)
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
                onClick={addTags}
                disable={isProcessing}>
          Add tags to selected images
        </button>
        <button type="button"
                onClick={removeTags}
                disabled={isProcessing}>
          Remove tags from selected images
        </button>
        <span>
          {isProcessing === true ? 'Processing...' : (isProcessing === false ? 'Done!' : '')}
        </span>
      </div>
    </form>
  )
}

export default ImageGalleryTagger
