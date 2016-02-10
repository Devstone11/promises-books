var Promise = require('bluebird');

function prepIds(ids) {
  return ids.filter(function (id) {
    return id !== '';
  })
}

function flattenArray(array) {
  return array.reduce(function (a, b) {
    return a.concat(b)
  }, []);
}

function insertIntoAuthorsBooks(bookIds, table, authorId) {
  bookIds = prepIds(bookIds);
  return Promise.all(bookIds.map(function (book_id) {
    book_id = Number(book_id)
    return table().insert({
      book_id: book_id,
      author_id: authorId
    })
  }))
}

function getAuthorBooks(records, Books) {
  return Promise.all(records.map(function (record) {
    return Books().where('id', record.book_id)
    })
  ).then(function (results) {
    return flattenArray(results);
  });
}

module.exports = {
  prepIds: prepIds,
  flattenArray: flattenArray,
  insertIntoAuthorsBooks: insertIntoAuthorsBooks,
  getAuthorBooks: getAuthorBooks
}