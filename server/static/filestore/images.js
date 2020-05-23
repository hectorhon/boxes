async function searchImages(searchText, pageSize, pageNumber) {
  const params = new URLSearchParams({
    searchText, pageSize, pageNumber
  }).toString()
  return fetch('/api/filestore/images?' + params)
    .then(response => response.json())
}

const domContainer = document.querySelector('#image-gallery-container');
ReactDOM.render(
  React.createElement(ImageGallery.default, {
    dataSource: searchImages,
    rootPath: '/thumbnails',
  }),
  domContainer
)
