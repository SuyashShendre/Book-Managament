const reviewModel = require("../models/reviewModel");
const bookModel = require("../models/bookModel");
const mongoose = require("mongoose");

var checkName = /^[A-Za-z\s]+$/;

let addBookReview = async function (req, res) {
  try {
    let reviewData = req.body;
    let bookId = req.params.bookId;

    if (!mongoose.isValidObjectId(bookId))
      return res
        .status(400)
        .send({ status: false, message: "Invalid book id." });

    let { review, rating, reviewedBy } = reviewData;
    reviewData.bookId = bookId;
    if (!Object.keys(reviewData).length) {
      return res
        .status(400)
        .send({
          status: true,
          message: "Bad Request, Please enter the details in the request body.",
        });
    }

    if (!review) {
      return res
        .status(400)
        .send({ status: false, message: "Review should be present." });
    }
    if (review.length == 0) {
      return res
        .status(400)
        .send({ status: false, message: "Review field should not be empty." });
    }

    if (!rating) {
      return res
        .status(400)
        .send({ status: false, message: "please provide rating" });
    }
    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .send({
          status: false,
          message: "Rating should be between 1 and 5 inclusively.",
        });
    }
    if (reviewedBy !== undefined) {
      if (reviewedBy.length == 0) {
        return res
          .status(400)
          .send({
            status: false,
            message: "Reviewer's name should not be empty.",
          });
      }
    }

    let bookData = await bookModel.findOne({ _id: bookId });
    if (!bookData) {
      return res
        .status(400)
        .send({
          status: false,
          message: "Could not find the book with the given bookId",
        });
    }
    if (bookData.isDeleted) {
      return res
        .status(404)
        .send({ status: false, message: "This book has been deleted." });
    }

    let addReviewData = await reviewModel.create(reviewData);
    let countReviews = await reviewModel
      .find({ bookId: bookId, isDeleted: false })
      .count();
    let updatedBookData = await bookModel.findOneAndUpdate(
      { _id: bookId },
      { $set: { reviews: countReviews } },
      { new: true, upsert: true }
    );

    let responseData = {
      updatedBookDocument: updatedBookData,
      reviewsData: addReviewData,
    };

    res
      .status(201)
      .send({ status: true, message: "Success", data: responseData });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

let updateReview = async function (req, res) {
  try {
    let dataToUpdate = req.body;
    let bookId = req.params.bookId;
    let reviewId = req.params.reviewId;

    if (!mongoose.isValidObjectId(bookId))
      return res
        .status(400)
        .send({ status: false, message: "Invalid book id." });

    if (!mongoose.isValidObjectId(reviewId))
      return res
        .status(400)
        .send({ status: false, message: "Invalid review id." });

    if (!Object.keys(dataToUpdate).length) {
      return res
        .status(400)
        .send({
          status: false,
          message: "Bad Request, Please enter the details in the request body.",
        });
    }

    let { review, rating, reviewedBy } = dataToUpdate;

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .send({
          status: false,
          message: "Rating should be in range (1, 5) inclusively.",
        });
    }

    let BookData = await bookModel.findOne({ _id: bookId });
    if (!BookData) {
      return res
        .status(400)
        .send({
          status: false,
          message: "Book does not exist with the given bookId",
        });
    }
    if (BookData.isDeleted) {
      return res
        .status(404)
        .send({
          status: false,
          message: "Cannot Update! The book is deleted before.",
        });
    }
    let reviewData = await reviewModel.findOne({ _id: reviewId });
    if (reviewData.bookId != bookId) {
      return res
        .status(400)
        .send({
          status: false,
          message: "BookId from query params does not resemble with reviewId",
        });
    }
    if (review.trim() == "" || reviewedBy.trim() == "") {
      return res
        .status(400)
        .send({
          status: false,
          message: "Cannot Update! Field should not be empty.",
        });
    }
    if (rating) {
      if (!Number(rating)) {
        return res
          .status(400)
          .send({
            status: false,
            message: "Rating Field should contain only number.",
          });
      }
    }

    if (!checkName.test(reviewedBy)) {
      return res
        .status(400)
        .send({
          status: false,
          message: "ReviewedBy must contain alphabets only",
        });
    }
    if (reviewData.review == review) {
      return res
        .status(400)
        .send({
          status: false,
          message:
            "Cannot Update! This review is already exist for the given reviewId",
        });
    }
    let updatedReviewData = await reviewModel
      .findOneAndUpdate(
        { _id: reviewId, isDeleted: false },
        {
          $set: {
            review: review,
            rating: rating,
            reviewedBy: reviewedBy,
          },
        },
        { new: true }
      )
      .select({ __v: 0 });
    let returnData = {
      BookId: BookData._id,
      title: BookData.title,
      excerpt: BookData.excerpt,
      userId: BookData.userId,
      ISBN: BookData.ISBN,
      category: BookData.category,
      subcategory: BookData.subcategory,
      reviews: BookData.reviews,
      isDeleted: BookData.isDeleted,
      updatedReviewData: updatedReviewData,
    };
    return res
      .status(200)
      .send({ status: true, message: "Book list", data: returnData });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const deleteBookReview = async function (req, res) {
  let bookId = req.params.bookId;
  let reviewId = req.params.reviewId;

  if (!mongoose.isValidObjectId(bookId))
    return res.status(400).send({ status: false, message: "Invalid book id." });

  if (!mongoose.isValidObjectId(reviewId))
    return res
      .status(400)
      .send({ status: false, message: "Invalid review id." });

  let checkBook = await bookModel.findOne({ _id: bookId });
  if (!checkBook) {
    return res
      .status(404)
      .send({
        status: true,
        message: "The book does not exists with the given bookId.",
      });
  }
  let checkReview = await reviewModel.findOne({ _id: reviewId });
  if (!checkReview) {
    return res
      .status(404)
      .send({
        status: false,
        message: "The review does not exist with the given reviewId.",
      });
  }
  if (checkBook.isDeleted == true || checkReview.isDeleted == true) {
    return res
      .status(404)
      .send({
        status: false,
        message: "can not delete review of deleted Book ",
      });
  }

  let deletedReviewData = await reviewModel.findOneAndUpdate(
    { _id: reviewId },
    {
      $set: { isDeleted: true },
    },
    { new: true, upsert: true }
  );
  let countReviews = await reviewModel
    .find({ bookId: bookId, isDeleted: false })
    .count();
  let updatedBookData = await bookModel.findOneAndUpdate(
    { _id: bookId },
    { $set: { reviews: countReviews } },
    { new: true, upsert: true }
  );

  return res.status(200).send({
    status: true,
    message: "Success",
    Data: {
      UpdatedBookData: updatedBookData,
      deletedReviewData: deletedReviewData,
    },
  });
};

module.exports = { addBookReview, updateReview, deleteBookReview };
