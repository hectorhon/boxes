import React, { useState, useEffect } from 'react'

async function getUniqueTags() {
  const uniqueTags = await fetch('/api/filestore/uniqueTags')
    .then(response => response.json())
  return uniqueTags
}

function splitToTags(str) {
  return str.split(',').map(tag => tag.trim()).filter(tag => tag)
}

function joinToTags(tags) {
  return tags.join(', ')
}

function ImageGalleryTagger(props) {
  const { selectedImageIds, onTagsAdded, onTagsRemoved } = props

  const [tagsInput, setTagsInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(null)
  const [uniqueTags, setUniqueTags] = useState([])

  async function addTags() {
    const tags = splitToTags(tagsInput)
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
    const tags = splitToTags(tagsInput)
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

  useEffect(() => {
    async function f() {
      const uniqueTags = await getUniqueTags()
      setUniqueTags(uniqueTags)
    }
    f()
  }, [])

  return (
    <form className="image-gallery-tagger">
      <div className="image-gallery-tagger-content">
        <textarea rows="4"
                  value={tagsInput}
                  onChange={event => setTagsInput(event.target.value)} />
        <ul>
          {uniqueTags.map(tag => (
            <li key={tag}>
              <a href="javascript:void(0)" onClick={() => {
                const tags = splitToTags(tagsInput)
                if (tags.indexOf(tag) < 0) {
                  tags.push(tag)
                }
                setTagsInput(joinToTags(tags))
              }}>
                {tag}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <button type="button"
                onClick={() => setTagsInput('')}>
          Clear input area
        </button>
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
