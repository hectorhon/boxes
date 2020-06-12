const domContainer = document.querySelector('#image-viewer-container')
ReactDOM.render(
  React.createElement(ImageViewer.default, {
    imageId: domContainer.getAttribute('data-image-id'),
    thumbnailsPath: '/thumbnails',
    rootPath: '/filestore',
  }),
  domContainer
)
