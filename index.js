const { Todo } = require("./models/todo.model");
const { Author } = require("./models/author.model");
const { intializeDatabase } = require("./db/db.connect");
const cookieParser = require("cookie-parser");
const { uploadCloudinary } = require("./utils/cloudinary");

intializeDatabase();

const express = require("express");
const cors = require("cors");
const { default: axios } = require("axios");
const app = express();

const corsOptions = {
  origin: [
    "https://o-auth-practice-frontend.vercel.app",
    "https://www.googleapis.com/oauth2/v2/userinfo",
  ],
  credentials: true,
  openSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => res.send("Express started"));

app.post("/add/todo", async (req, res) => {
  const todoData = req.body;

  try {
    const newTodo = new Todo(todoData);
    const savedTodo = await newTodo.save();

    if (!savedTodo)
      return res.status(404).json({ error: "Todo cannot be saved", savedTodo });

    return res.status(200).json({ message: "Todo saved", savedTodo });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/get/todos", async (req, res) => {
  try {
    //const todos = await Todo.find().populate({ path: "author" });
    const todos = await Todo.find();

    if (!todos)
      return res
        .status(404)
        .json({ error: "An error happened while getting todos" });

    return res.status(200).json({ message: "Got all todos", todos });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/update/todo/:todoId", async (req, res) => {
  const todoId = req.params.todoId;
  const todoToUpdate = req.body;

  try {
    const updateTodo = await Todo.findByIdAndUpdate(todoId, todoToUpdate, {
      new: true,
    });

    if (!updateTodo)
      return res
        .status(404)
        .json({ error: "Todo cannot get deleted", updateTodo });

    return res.status(200).json({ message: "Todo updated", updateTodo });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/delete/todo/:todoId", async (req, res) => {
  const todoId = req.params.todoId;

  try {
    const deleteTodo = await Todo.findByIdAndDelete(todoId);

    if (!deleteTodo)
      return res
        .status(404)
        .json({ error: "Todo cannot get deleted", deleteTodo });

    return res.status(200).json({ message: "Todo deleted" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Author routes.
app.post("/add/author", async (req, res) => {
  const { name, email, profilePic, id } = req.body;

  try {
    const alreadyAuthor = await Author.findOne({ id });

    if (alreadyAuthor) {
      return res
        .status(409)
        .json({ message: "Author already exists", alreadyAuthor });
    }

    // upload the profile pic to cloudinary.
    const profileImgUpload = await uploadCloudinary(profilePic);

    const newAuthor = new Author({
      name,
      email,
      profilePic: profileImgUpload.secure_url,
      id,
    });
    const savedAuthor = await newAuthor.save();

    if (!savedAuthor)
      return res
        .status(404)
        .json({ error: "Author cannot be saved", savedAuthor });

    return res.status(200).json({ message: "Author saved", savedAuthor });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/get/authors", async (req, res) => {
  try {
    const authors = await Author.find();

    if (!authors)
      return res
        .status(404)
        .json({ error: "An error happened while getting authors" });

    return res.status(200).json({ message: "Got all authors", authors });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/get/author/:authorGoogleId", async (req, res) => {
  const authorGoogleId = req.params.authorGoogleId;

  try {
    const singleAuthor = await Author.find({
      id: authorGoogleId,
    }).populate({
      path: "todos",
    });

    if (!singleAuthor)
      return res
        .status(404)
        .json({ error: "An error happened while getting single Author" });

    return res.status(200).json({ message: "Got single Author", singleAuthor });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/update/author/:authorId", async (req, res) => {
  const authorId = req.params.authorId;
  const authorToUpdate = req.body;

  try {
    const updateAuthor = await Author.findByIdAndUpdate(
      authorId,
      authorToUpdate,
      {
        new: true,
      }
    );

    if (!updateAuthor)
      return res
        .status(404)
        .json({ error: "Author cannot get deleted", updateAuthor });

    return res.status(200).json({ message: "Author updated", updateAuthor });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/delete/author/:authorId", async (req, res) => {
  const authorId = req.params.authorId;

  try {
    const deleteAuthor = await Author.findByIdAndDelete(authorId);

    if (!deleteAuthor)
      return res
        .status(404)
        .json({ error: "Author cannot get delete", deleteAuthor });

    return res.status(200).json({ message: "Author deleted" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

//google auth routes
const verifyToken = (req, res, next) => {
  if (!req.cookies.googleTodo_access_token)
    return res.status(403).json({ error: "Access Denied" });

  next();
};

app.get("/user/profile/google", verifyToken, async (req, res) => {
  try {
    const { googleTodo_access_token } = req.cookies;

    const googleAccessTokenResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v2/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${googleTodo_access_token}`,
        },
      }
    );

    return res.json({ user: googleAccessTokenResponse?.data });
  } catch (error) {
    console.log("Could not fetch user google profile: ", error);
  }
});

app.get("/auth/google", (req, res) => {
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=https://o-auth-practice-backend.vercel.app/auth/google/callback&response_type=code&scope=profile email`;

  res.redirect(googleAuthUrl);
});

app.get("/auth/google/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) return res.status(400).send("Authorization code not provided");

  let accessToken;

  try {
    const tokenResponse = await axios.post(
      `https://oauth2.googleapis.com/token`,
      {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: `https://o-auth-practice-backend.vercel.app/auth/google/callback`,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    accessToken = tokenResponse?.data?.access_token;
    res.cookie("googleTodo_access_token", accessToken);

    return res.redirect(`${process.env.FRONTEND_URL}/v2/profile/google`);
  } catch (error) {
    console.log(error);
  }
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Server started at ${PORT}`));
