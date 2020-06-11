const sampleColumns = [{
  name: 'name',
  label: 'Name',
  type: 'string',
}, {
  name: 'age',
  label: 'Age',
  type: 'number',
}, {
  name: 'say',
  label: 'Say',
  type: 'string',
  escapedHtml: data => {
    return ejs.render("<b><%= name.split('').reverse().join('') %></b>", data)
  },
}]

const sampleData = [{
  id: 1,
  name: 'James',
  age: 12,
}, {
  id: 2,
  name: 'Bill',
  age: 13,
}, {
  id: 3,
  name: 'Jack',
  age: 14,
}, {
  id: 4,
  name: 'John',
  age: 15,
}, {
  id: 5,
  name: 'Lily',
  age: 16,
}]

const domContainer = document.querySelector('#table-container');
ReactDOM.render(
  React.createElement(Table.default, {
    columns: sampleColumns,
    dataSource: sampleData,
    pageSize: 3,
  }),
  domContainer
)
