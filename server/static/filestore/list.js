const domContainer = document.querySelector('#table-container');
ReactDOM.render(
  React.createElement(Table.default, {
    columns: [{
      name: 'title',
      label: 'Title',
      type: 'string',
    }, {
      name: 'path',
      label: 'Path',
      type: 'string',
    }, {
      name: 'add_date',
      label: 'Added on',
      type: 'date',
    }],
    dataSource: async function(pageSize, pageNumber, searchText) {
      const params = new URLSearchParams({
        searchText, pageSize, pageNumber
      }).toString()
      const { files, total } = await fetch('/api/filestore/files?' + params)
        .then(response => response.json())
      return {
        rows: files,
        length: total,
      }
    },
    pageSize: 20,
  }),
  domContainer
)
