const allTags = [
  'one',
  'two',
  'three',
  'four',
  'five',
]

function queryTags(query) {
  console.log('     querying', query)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const matches = allTags.filter(tag => tag.indexOf(query.trim()) >= 0)
      console.log('done querying', query)
      resolve(matches)
    }, 1000)
  })
}

const domContainer = document.querySelector('#extended-select-container');
ReactDOM.render(
  React.createElement(ExtendedSelect.default, {
    dataSource: queryTags,
  }),
  domContainer
)
