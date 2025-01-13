const { v2: cloudinary } = require("cloudinary");
require("dotenv").config({ path: ".env" });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadCloudinary = async (profilePic) => {
  console.log(profilePic);
  try {
    const response = await cloudinary.uploader.upload(profilePic, {
      folder: "authors", // creating a folder for the todo authors
    });

    console.log(response);
    return response;
  } catch (error) {
    console.log("Error while uploading to cloudinary", error);
  }
};

module.exports = { uploadCloudinary };
