const jwt = require("jsonwebtoken");
const bookModel = require("../models/bookModel");
const mongoose = require("mongoose");

const tokenRegex = /^[A-Za-z0-9-=]+\.[A-Za-z0-9-=]+\.?[A-Za-z0-9-_.+/=]*$/;

const isValidObjectId = function (ObjectId) {
  return mongoose.Types.ObjectId.isValid(ObjectId);
};

const authentication = async function (req, res, next) {
  try {
    let token = req.headers["x-api-key"];
    let secretKey = "secretkey";

    if (!token) {
      return res
        .status(400)
        .send({ status: false, msg: "Token must be presents" });
    }
    if (!tokenRegex.test(token))
      return res
        .send(400)
        .send({ status: false, message: "Please provide a valid token" });

    try {
      let decodedToken = jwt.verify(token, secretKey);
      // if (Date.now() > (decoded.exp) * 1000) {
      //   return res.status(440).send({ status: false, message: "Session expired! Please login again." })
      // }
      req.decodedToken = decodedToken;
      req.userId = decodedToken.userId;
    } catch (err) {
      return res.status(400).send({ status: false, message: err.message });
    }
    next();
  } catch (err) {
    res.status(500).send({ msg: "Error", error: err.message });
  }
};

const authorization = async function (req, res, next) {
  try {
    let bookId = req.params.bookId;

    let token = req.headers["x-api-key"];
    let decodedToken = jwt.verify(token, "secretkey");
    let decodedUser = decodedToken.userId;

    if (!isValidObjectId(bookId))
      return res
        .status(400)
        .send({ status: false, message: "please provided valid book id" });

    const findBook = await bookModel.findOne({ _id: bookId, isDeleted: false });

    if (!findBook)
      return res
        .status(404)
        .send({ status: false, msg: "No book found or it may be deleted" });

    const user = findBook.userId.toString();

    if (decodedUser == user) {
      next();
    } else {
      res
        .status(401)
        .send({
          status: false,
          message: "You are not authorised to perform this action",
        });
    }
  } catch (err) {
    res.status(500).send({ msg: "Error", error: err.message });
  }
};

module.exports.authentication = authentication;
module.exports.authorization = authorization;
