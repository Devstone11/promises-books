var Promise = require('bluebird');
var knex = require('../db/knex');

function Authors() {
  return knex('authors');
}

function Books(){
  return knex('books');
}

function Authors_Books() {
  return knex('authors_books');
}

function prepIds(ids) {
  return ids.filter(function (id) {
    return id !== '';
  })
}

function insertIntoAuthorsBooks(bookIds, authorId) {
  bookIds = prepIds(bookIds);
  return Promise.all(bookIds.map(function (book_id) {
    book_id = Number(book_id)
    return Authors_Books().insert({
      book_id: book_id,
      author_id: authorId
    })
  }))
}

function getAuthorBooks(author) {
  return knex('authors_books').where('author_id', author.id).pluck('book_id').then(function(bookIds) {
    return knex('books').whereIn('id', bookIds);
  })
}

function getBookAuthors(book) {
  return knex('authors_books').where('book_id', book.id).pluck('author_id').then(function(authorIds) {
    return knex('authors').whereIn('id', authorIds)
  })
}


module.exports = {
  getAuthorBooks: getAuthorBooks,
  getBookAuthors: getBookAuthors
}
