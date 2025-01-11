const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    todo: {
      type: String,
      required: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NewTodoAuthor",
      required: true,
    },
  },
  { timestamps: true }
);

const Todo = mongoose.model("NewTodo", todoSchema);
module.exports = { Todo };
