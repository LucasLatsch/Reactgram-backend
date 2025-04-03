const Photo = require("../models/Photo");

const mongoose = require("mongoose");

// Insert a photo, with a user related to it
const insertPhoto = async (req, res) => {
  const { title } = req.body;
  const image = req.file.filename;

  const reUser = req.user;

  const user = await User.findById(reUser._id);

  // Create a photo
  const newPhoto = await Photo.create({
    image,
    title,
    userId: user._id,
    userName: user.name,
  });

  // If photo is not created
  if (!newPhoto) {
    return res.status(422).json({ errors: ["Photo could not be created"] });
  }

  res.status(201).json(newPhoto);
};

// Remove a photo
const deletePhoto = async (req, res) => {
  const { id } = req.params;

  const reqUser = req.user;

  try {
    const photo = await Photo.findById(new mongoose.Types.ObjectId(id));

    // Check if the photo exists
    if (!photo) {
      return res.status(404).json({ errors: ["Photo not found"] });
    }

    // Check if the user is the owner of the photo
    if (!photo.userId.equals(reqUser._id)) {
      return res.status(422).json({ errors: ["Try again later"] });
    }

    await Photo.findByIdAndDelete(photo._id);

    res.status(200).json({ id: photo._id, message: "Photo deleted" });
  } catch (error) {
    res.status(404).json({ id: photo._id, message: "Photo not found" });
  }
};

// Get all photos
const getAllPhotos = async (req, res) => {
  const photos = await Photo.find({}).sort({ createdAt: -1 }).exec();

  return res.status(200).json(photos);
};

//Get all photos of a user
const getUserPhotos = async (req, res) => {
  const { id } = req.params;

  const photos = await Photo.find({ userId: id })
    .sort({ createdAt: -1 })
    .exec();

  return res.status(200).json(photos);
};

//Get photo by id
const getPhotoById = async (req, res) => {
  const { id } = req.params;

  const photo = await Photo.findById(new mongoose.Types.ObjectId(id));

  // Check if the photo exists
  if (!photo) {
    return res.status(404).json({ errors: ["Photo not found"] });
  }

  res.status(200).json(photo);
};

//Update a photo
const updatePhoto = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  const reqUser = req.user;

  const photo = await Photo.findById(new mongoose.Types.ObjectId(id));

  // Check if the photo exists
  if (!photo) {
    return res.status(404).json({ errors: ["Photo not found"] });
  }

  // Check if the user is the owner of the photo
  if (!photo.userId.equals(reqUser._id)) {
    return res.status(422).json({ errors: ["Try again later"] });
  }

  if (title) {
    photo.title = title;
  }

  await photo.save();

  res.status(200).json({ photo, message: "Photo updated" });
};

// Like or Dislike a photo
const likePhoto = async (req, res) => {
  const { id } = req.params;

  const reqUser = req.user;

  const photo = await Photo.findById(id);

  // Check if the photo exists
  if (!photo) {
    return res.status(404).json({ errors: ["Photo not found"] });
  }

  // Check if the user has already liked the photo
  if (photo.likes.includes(reqUser._id)) {
    // If the user already liked, remove the like (dislike)
    photo.likes = photo.likes.filter(
      (userId) => userId.toString() !== reqUser._id.toString()
    );
    await photo.save();

    return res.status(200).json({
      photoId: id,
      userId: reqUser._id,
      message: "Photo disliked",
    });
  }

  // If the user hasn't liked yet, add the like
  photo.likes.push(reqUser._id);

  await photo.save();

  res.status(200).json({
    photoId: id,
    userId: reqUser._id,
    message: "Photo liked",
  });
};

//Comment functionality
const commentPhoto = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  const reqUser = req.user;

  const user = await User.findById(reqUser._id);

  const photo = await Photo.findById(id);

  //Check if photo exists
  if (!photo) {
    return res.status(404).json({ errors: ["Photo not found"] });
  }

  //Put comment in the array comments
  const userComment = {
    comment,
    userName: user.name,
    userImage: user.profileImage,
    userId: user._id,
  };

  photo.comment.push(userComment);

  await photo.save();

  res.status(200).json({
    comment: userComment,
    message: "Add Comment",
  });
};

// Search a photo by title
const searchPhotos = async (req, res) => {
  const { q } = req.query;

  const photos = await Photo.find({ title: new RegExp(q, "i") }).exec();

  res.status(200).json(photos);
};

module.exports = {
  insertPhoto,
  deletePhoto,
  getAllPhotos,
  getUserPhotos,
  getPhotoById,
  updatePhoto,
  likePhoto,
  commentPhoto,
  searchPhotos,
};
