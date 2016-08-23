var express = require('express');
var router = express.Router();
var knex = require('../db/knex');
var helpers = require('../lib/helpers')

router.get('/', function(req, res, next) {
  helpers.Books().then(function(books) {
    Promise.all(
      books.map(function(book) {
        return helpers.getBookAuthors(book).then(function(authors) {
          book.authors = authors;
          return book;
        })
      })
    ).then(function(books) {
      res.render('books/index', {books: books})
    })
  })
});

router.get('/new', function(req, res, next) {
  res.render('books/new');
});

router.post('/', function (req, res, next) {
  var errors = helpers.validate(req.body);
  if(errors.length){
    res.render('books/new', { book: req.body, errors: errors })
  } else {
    helpers.Books().insert(req.body).then(function (results) {
        res.redirect('/');
    })
  }
})

router.get('/:id/delete', function(req, res, next) {
  helpers.Books().where('id', req.params.id).first().then(function(book) {
    helpers.getBookAuthors(book).then(function(authors) {
      res.render('books/delete', {book: book, authors: authors})
    })
  })
});

router.post('/:id/delete', function(req, res, next) {
  helpers.Books().where('id', req.params.id).del().then(function (book) {
    res.redirect('/books');
  })
});

router.get('/:id/edit', function(req, res, next) {
  helpers.Books().where('id', req.params.id).first().then(function (book) {
    res.render('books/edit', {book: book});
  })
});

router.get('/:id', function(req, res, next) {
  helpers.Books().where('id', req.params.id).first().then(function(book){
    helpers.getBookAuthors(book).then(function(authors) {
      res.render('books/show', {book: book, authors: authors});
    })
  })
});

router.post('/:id', function(req, res, next) {
  var errors = helpers.validate(req.body);
  if(errors.length){
    res.render('books/edit', { book: req.body, errors: errors })
  } else {
    helpers.Books().where('id', req.params.id).update(req.body).then(function (results) {
      res.redirect('/');
    })
  }
});

module.exports = router;
