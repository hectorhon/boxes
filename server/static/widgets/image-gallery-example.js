const sampleImages = [{
  id: 1,
  name: 'rose.jpg',
  path: '/sample/rose.jpg',
}, {
  id: 2,
  name: 'Wikipedia-logo-v2.png',
  path: '/sample/Wikipedia-logo-v2.png',
}, {
  id: 3,
  name: 'rose.jpg',
  path: '/sample/rose.jpg',
}, {
  id: 4,
  name: 'Wikipedia-logo-v2.png',
  path: '/sample/Wikipedia-logo-v2.png',
}, {
  id: 5,
  name: 'rose.jpg',
  path: '/sample/rose.jpg',
}, {
  id: 6,
  name: 'Wikipedia-logo-v2.png',
  path: '/sample/Wikipedia-logo-v2.png',
}]

const domContainer = document.querySelector('#image-gallery-container');
ReactDOM.render(
  React.createElement(ImageGallery.default, {
    dataSource: sampleImages,
    rootPath: '/filestore',
  }),
  domContainer
)
