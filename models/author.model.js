const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    todos: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NewTodo",
    },

    profilePic: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Author = mongoose.model("NewTodoAuthor", authorSchema);
module.exports = { Author };
