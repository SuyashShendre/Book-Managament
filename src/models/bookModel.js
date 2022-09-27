const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    excerpt: {
      type: String,
      trim: true,
      required: true,
    },
    userId: {
      type: ObjectId,
      required: true,
      ref: "user",
    },
    ISBN: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    subcategory: [
      {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
    ],
    reviews: {
      type: Number,
      default: 0,
    },
    deletedAt: {
      type: Date
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    releasedAt: {
      type: String,
      require: true,
      // default:Date.now
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("book", bookSchema);