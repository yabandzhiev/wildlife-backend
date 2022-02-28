const Post = require("../models/Post");

exports.create = (postData) => Post.create(postData);

exports.getAll = () => Post.find().lean();

exports.getOne = (postId) => Post.findById(postId).populate("votesOnPost");

exports.updateOne = (postId, data) => Post.findByIdAndUpdate(postId, data);

exports.delete = (postId) => Post.findByIdAndDelete(postId);

exports.userPosts = (userId) => Post.find({ author: userId }).lean();

exports.addUpVote = async (postId, userId) => {
  const postService = require("./postService");
  let post = await postService.getOne(postId);

  post.votesOnPost.push(userId);
  post.rating = post.rating + 1;

  return post.save();
};

exports.addDownVote = async (postId, userId) => {
  const postService = require("./postService");
  let post = await postService.getOne(postId);

  post.votesOnPost.push(userId);
  post.rating = post.rating - 1;

  return post.save();
};

exports.postValidation = function (
  title,
  keyword,
  location,
  date,
  image,
  description
) {
  if (title.length < 6) {
    return "Title must be at least 6 characters long";
  } else if (keyword.length < 6) {
    return "Keyword must be at least 6 characters long";
  } else if (location.length > 10) {
    return "Location must be maximum 10 characters long";
  } else if (date.length != 10) {
    return "Date must be 10 characters long";
  } else if (description.length < 8) {
    return "Description must be at least 8 characters";
  }
  let regex = /^https?:\/\/.+/i;
  if (!image.match(regex)) {
    return "Image URL is invalid";
  }

  return true;
};
