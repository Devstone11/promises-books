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

function getAuthorBooks(authorId) {
  return Authors().where('id', authorId).first().then(function (author) {
    return knex('authors_books').where('author_id', author.id).pluck('book_id').then(function(bookIds) {
      return {author: author, bookIds: bookIds};
    }).then(function(obj) {
      return knex('books').whereIn('id', obj.bookIds).then(function(authorBooks){
        return {author: obj.author, authorBooks: authorBooks}
      });
    })
  })
}

function getBookAuthors(book) {
  return knex('authors_books').where('book_id', book.id).pluck('author_id').then(function(authorIds) {
    return knex('authors').whereIn('id', authorIds)
  })
}

function validate(body) {
  var errors = [];
  if(!body.title.trim()){errors.push("Title cannot be blank")}
  if(!body.genre.trim()){errors.push("Genre cannot be blank")}
  if(!body.cover_url.trim()){errors.push("Cover image cannot be blank")}
  if(!body.description.trim()){errors.push("Description cannot be blank")}
  return errors;
}

module.exports = {
  getAuthorBooks: getAuthorBooks,
  getBookAuthors: getBookAuthors,
  Authors: Authors,
  Books: Books,
  Authors_Books: Authors_Books,
  validate: validate
}
