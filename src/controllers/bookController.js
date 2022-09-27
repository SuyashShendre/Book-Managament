const mongoose = require("mongoose");
const moment = require("moment");
const userModel = require("../models/userModel");
const bookModel = require("../models/bookModel");
const reviewModel = require("../models/reviewModel");

const today = moment();

const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

const createBook = async function (req, res) {
  try {
    let data = req.body;
    if (!Object.keys(data).length)
      return res
        .status(400)
        .send({
          status: false,
          message: "Bad Request, Please enter the details in the request body.",
        });

    const { title, excerpt, userId, ISBN, category, subcategory, releasedAt } =
      data;

    if (!isValid(title))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid title. ⚠️" });

    if (!isValid(excerpt))
      return res.status(400).send({
        status: false,
        message: "Please enter some excerpt. ⚠️",
      });

    if (!isValid(userId))
      return res
        .status(400)
        .send({ status: false, message: "Please enter the userId. ⚠️" });

    if (!isValid(ISBN))
      return res
        .status(400)
        .send({ status: false, message: "Please enter the ISBN. ⚠️" });
    if (ISBN.trim().length !== 13 || !Number(ISBN))
      return res
        .status(400)
        .send({
          status: false,
          message: "ISBN must contain only numerics and should have 13 digits",
        });

    if (!isValid(category))
      return res
        .status(400)
        .send({ status: false, message: "Please enter the category. ⚠️" });

    if (!isValid(subcategory))
      return res
        .status(400)
        .send({ status: false, message: "Please enter the subcategory. ⚠️" });

    if (userId !== req.userId)
      return res
        .status(403)
        .send({ Status: false, message: "Authorisation Failed ⚠️" });

    if (!isValid(releasedAt)) {
      return res
        .status(400)
        .send({
          status: false,
          message: "releasedAt should be present and not empty.",
        });
    }

    let validReleasedAt = moment(`${releasedAt}`, "YYYY-MM-DD").isValid();
    if (validReleasedAt == false)
      return res
        .status(400)
        .send({
          status: false,
          message: "releseAt should be in YYYY-MM-DD format.",
        });

    let checkBookTitle = await bookModel.findOne({ title: title });
    if (checkBookTitle)
      return res
        .status(400)
        .send({ status: false, message: "This Title is already used. ⚠️" });

    let CheckBookISBN = await bookModel.findOne({ ISBN: ISBN });
    if (CheckBookISBN)
      return res
        .status(400)
        .send({ status: false, message: "ISBN should be Unique ⚠️" });

    let bookCreated = await bookModel.create(data);
    return res
      .status(201)
      .send({ status: true, message: "Success", data: bookCreated });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

let getBooksByQuery = async function (req, res) {
  let queryData = req.query;
  let { userId, category, subcategory } = queryData;

  if (!queryData) {
    let findData = await bookModel.find({ isDeleted: false }).select({
      _id: 1,
      title: 1,
      excerpt: 1,
      userId: 1,
      category: 1,
      reviews: 1,
      releasedAt: 1,
    });

    return res
      .status(200)
      .send({ status: true, message: "Book Lists", data: findData });
  }
  if (userId) {
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).send({
        status: false,
        message: "You entered a invalid UserId ......",
      });
    }
    let check = await userModel.findById(userId);
    if (!check) {
      return res
        .status(404)
        .send({ status: false, message: "No such userId exists" });
    }
  }

  let findData = await bookModel
    .find({ $and: [queryData, { isDeleted: false }] })
    .select({
      title: 1,
      excerpt: 1,
      userId: 1,
      category: 1,
      reviews: 1,
      releasedAt: 1,
    })
    .sort({ title: 1 });

  if (findData.length == 0) {
    return res.status(404).send({ status: false, message: "No book found" });
  } else {
    return res
      .status(200)
      .send({ status: true, message: "Books list", data: findData });
  }
};

let getbyBookId = async function (req, res) {
  try {
    let bookId = req.params.bookId;
    if (!mongoose.isValidObjectId(bookId)) {
      return res
        .status(400)
        .send({ status: false, message: "You entered a invalid BookId" });
    }

    let bookData = await bookModel
      .findOne({ _id: bookId, isDeleted: false })
      .select({ _v: 0 });

    if (!bookData) {
      return res.status(404).send({ status: false, message: "No book found" });
    }

    let findReview = await reviewModel.find({
      bookId: bookId,
      isDeleted: false,
    });

    let object = {
      _id: bookData._id,
      title: bookData.title,
      excerpt: bookData.excerpt,
      userId: bookData.userId,
      category: bookData.category,
      subcategory: bookData.subcategory,
      isDeleted: bookData.isDeleted,
      reviews: bookData.reviews,
      releasedAt: bookData.releasedAt,
      createdAt: bookData.createdAt,
      updatedAt: bookData.updatedAt,
      reviewsData: findReview,
    };

    return res
      .status(200)
      .send({ status: true, message: "Book Lists", data: object });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

const updateBook = async function (req, res) {
  try {
    let data = req.body;
    let bookId = req.params.bookId;
    if (!mongoose.isValidObjectId(bookId))
      return res
        .status(400)
        .send({ Status: false, message: "Please enter valid bookId ⚠️" });

    const { title, excerpt, releaseDate, ISBN } = data;

    if (!Object.keys(data).length)
      return res
        .status(404)
        .send({ Status: false, message: "No data found for Update ⚠️" });

    let findbook = await bookModel.findById(bookId);
    if (findbook.userId != req.userId)
      return res
        .status(401)
        .send({ Status: false, message: "Authorisation Failed ⚠️" });

    if (title == "") {
      return res
        .status(400)
        .send({ status: false, message: "Title must contain the title name," });
    }

    if (title) {
      let findtitle = await bookModel.findOne({
        title: title,
        isDeleted: false,
      });
      if (findtitle) {
        return res.status(400).send({
          status: false,
          message: "please change your title, It is already exists",
        });
      }
    }

    if (!isValid(ISBN))
      return res
        .status(400)
        .send({ status: false, message: "please enter a ISBN number. ⚠️" });

    if (ISBN.trim().length !== 13 || !Number(ISBN))
      return res
        .status(400)
        .send({
          status: false,
          message: "ISBN must contain only numerics and should have 13 digits",
        });

    if (ISBN) {
      let findISBN = await bookModel.findOne({ ISBN: ISBN, isDeleted: false });
      if (findISBN) {
        return res.status(400).send({
          status: false,
          message: "please change your ISBN No., It is already exists",
        });
      }
    }

    if (!findbook)
      return res.status(404).send({ message: "bookId  is invalid ⚠️" });

    if (findbook.isDeleted)
      return res
        .status(404)
        .send({ message: "Bookdata is already deleted ⚠️" });

    if (!findbook.isDeleted) {
      let updatedBook = await bookModel.findOneAndUpdate(
        { _id: bookId },
        {
          $set: {
            title: title,
            excerpt: excerpt,
            ISBN: ISBN,
            releasedAt: today.format("YYYY-MM-DD"),
          },
        },
        { new: true, upsert: true }
      );
      return res.status(200).send({ status: true, message: updatedBook });
    }
  } catch (error) {
    res.status(500).send({ status: false, error: error.message });
  }
};

const deleteBook = async function (req, res) {
  try {
    let bookId = req.params.bookId;

    if (!mongoose.isValidObjectId(bookId))
      return res
        .status(400)
        .send({ Status: false, message: "Please enter valid bookId ⚠️" });

    let data = await bookModel.findById(bookId);
    if (!data)
      return res
        .status(404)
        .send({ status: false, message: "id does not exist ⚠️" });

    if (data.userId != req.userId)
      return res
        .status(401)
        .send({ Status: false, message: "Authorization Failed ⚠️" });

    if (data) {
      if (!data.isDeleted) {
        await bookModel.findOneAndUpdate(
          { _id: bookId },
          { isDeleted: true, deletedAt: Date.now() },
          { new: true }
        );
        res.status(200).send({ status: true, message: "data deleted ⚠️" });
      } else {
        res
          .status(404)
          .send({ status: false, message: "data is already deleted ⚠️" });
      }
    }
  } catch (error) {
    res.status(500).send({ status: false, error: error.message });
  }
};

module.exports = {
  createBook,
  getBooksByQuery,
  getbyBookId,
  updateBook,
  deleteBook,
};
