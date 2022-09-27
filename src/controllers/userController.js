const userModel = require("../models/userModel.js");
const emailValidator = require("email-validator");
const jwt = require("jsonwebtoken");

var checkPhone = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;
var checkName = /^[A-Za-z\s]+$/;

const registerUser = async function (req, res) {
  try {
    let bodyData = req.body
    if (!Object.keys(bodyData).length) {
      return res
        .status(400)
        .send({
          status: false,
          message: "Bad request, please enter details in the Request Body.",
        });
    }

    let { title, name, phone, email, password, address } = bodyData;

    if (!title) {
      return res
        .status(400)
        .send({ status: false, message: "Title field is required." });
    }

    let check = ["Mr", "Miss", "Mrs"];
    if (!check.includes(title)) {
      return res
        .status(400)
        .send({ status: false, message: "Title must be Mr/Miss/Mrs only." });
    }

    if (!name) {
      return res
        .status(400)
        .send({ status: false, message: "Name field is Required." });
    }


    if (!checkName.test(name)) {
      return res
        .status(400)
        .send({ status: false, message: "You entered an invalid Name" });
    }

    if (!phone) {
      return res
        .status(400)
        .send({ status: false, message: "phone field is Required" });
    }


    if (!checkPhone.test(phone)) {
      return res
        .status(400)
        .send({ status: false, message: "You entered an invalid Phone Number" });
    }

    let findPhone = await userModel.findOne({ phone: phone });
    if (findPhone) {
      return res
        .status(400)
        .send({
          status: false,
          message: "This phone Number already exists",
        });
    }

    if (!email) {
      return res
        .status(400)
        .send({ status: false, message: "email field is Required" });
    }

    let checkEmail = emailValidator.validate(email);
    if (checkEmail == false) {
      return res
        .status(400)
        .send({ status: false, message: "You entered an invalid EmailId" });
    }

    let findEmail = await userModel.findOne({ email: email });
    if (findEmail) {
      return res
        .status(400)
        .send({ status: false, message: "This EmailId already exists" });
    }

    if (!password) {
      return res
        .status(400)
        .send({ status: false, message: "Password field is Required" });
    }

    if (!(password.length >= 8 && password.length <= 15)) {
      return res
        .status(400)
        .send({
          status: false,
          message:
            "Password length is inappropriate, its length must be between 8 and 15 Both value is inclusive",
        });
    }

    if (Object.keys(bodyData).includes('address')) {
      if (typeof address !== "object") return res.status(400).send({ status: false, message: "address should be an object" })

      if (Object.keys(address).length == 0) {
        return res.status(400).send({
          status: false, message: "address should not be empty",
        });
      }
    }
    let createUserData = await userModel.create(bodyData);
    res
      .status(201)
      .send({ status: true, message: "Success", data: createUserData });
  } catch (err) {
    res.status(500).send({ error: err.messaage });
  };
}

let loginUser = async function (req, res) {
  let loginData = req.body;
  if (!Object.keys(loginData).length) {
    return res
      .status(400)
      .send({
        status: false,
        message: " Please enter email and password in the Request Body",
      });
  }
  let { email, password } = loginData;

  if (!email) {
    return res
      .status(400)
      .send({ status: false, message: "email field is Required" });
  }
  if (!password) {
    return res
      .status(400)
      .send({ status: false, message: "password field is Required" });
  }

  let userData = await userModel.findOne({ email: email, password: password });
  if (!userData) {
    return res
      .status(400)
      .send({ status: false, message: "You entered wrong Login Credentials" });
  }

  let token = jwt.sign(
    {
      userId: userData._id.toString(),
    },
    "secretkey",
    {expiresIn: '1d'}
  );
  res.status(201).send({ status: true, data: { token: token } });
};

module.exports = { registerUser, loginUser };