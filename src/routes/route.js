const express = require('express');
const router = express.Router()

const bookController = require('../controllers/bookController');
const userController = require('../controllers/userController');
const reviewController = require('../controllers/reviewController');

const {authentication, authorization} = require("../middlewares/auth")

router.post('/register', userController.registerUser);

router.post('/login', userController.loginUser);

router.post('/books', authentication, bookController.createBook);

router.get('/books', authentication, bookController.getBooksByQuery);

router.get('/books/:bookId', authentication, bookController.getbyBookId);

router.put('/books/:bookId', authentication, authorization, bookController.updateBook);

router.delete('/books/:bookId', authentication, authorization, bookController.deleteBook);

router.post('/books/:bookId/review', reviewController.addBookReview);

router.put('/books/:bookId/review/:reviewId', reviewController.updateReview);

router.delete('/books/:bookId/review/:reviewId', reviewController.deleteBookReview);

module.exports = router;