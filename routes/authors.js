var express = require('express');
var router = express.Router();
var knex = require('../db/knex');
var Promise = require('bluebird');
var helpers = require('../lib/helpers');

router.get('/', function(req, res, next) {
  helpers.Authors().then(function(authors) {
    Promise.all(
      authors.map(function(author) {
        return helpers.getAuthorBooks(author.id).then(function(data) {
          author.books = data.authorBooks;
          return author;
        })
      })
    ).then(function(authors) {
      res.render('authors/index.jade', {authors: authors})
    })
  })
});

router.get('/new', function(req, res, next) {
  helpers.Books().select().then(function (books) {
    res.render('authors/new', {books: books});
  })
});

router.post('/', function (req, res, next) {
  var bookIds = req.body.book_ids.split(",");
  delete req.body.book_ids;
  helpers.Authors().returning('id').insert(req.body).then(function (id) {
    helpers.insertIntoAuthorsBooks(bookIds, Authors_Books, id[0]).then(function () {
      res.redirect('/authors');
    })
  })
});

router.get('/:id/delete', function (req, res, next) {
  helpers.getAuthorBooks(req.params.id).then(function (data) {
    helpers.Books().then(function (books) {
      res.render('authors/delete', {author: data.author, author_books: data.authorBooks, books: books });
    })
  })
})

router.post('/:id/delete', function (req, res, next) {
  Promise.all([
    helpers.Authors().where('id', req.params.id).del(),
    helpers.Authors_Books().where('author_id', req.params.id).del()
  ]).then(function (results) {
    res.redirect('/authors')
  })
})

router.get('/:id/edit', function (req, res, next) {
  helpers.getAuthorBooks(req.params.id).then(function(data) {
    helpers.Books().then(function(allBooks) {
      res.render('authors/edit.jade', {author: data.author, books: allBooks, author_books: data.authorBooks})
    })
  })
})

router.post('/:id', function (req, res, next) {
  var bookIds = req.body.book_ids.split(",");
  delete req.body.book_ids;
  helpers.Authors().returning('id').where('id', req.params.id).update(req.body).then(function (id) {
    id = id[0];
    helpers.insertIntoAuthorsBooks(bookIds, id).then(function () {
    res.redirect('/authors');
    });
  })
})

router.get('/:id', function (req, res, next) {
  helpers.getAuthorBooks(req.params.id).then(function(data) {
    res.render('authors/show.jade', { author: data.author, books: data.authorBooks })
  })
})

module.exports = router;
