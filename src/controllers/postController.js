const router = require("express").Router();

const postService = require("../services/postService");
const authService = require("../services/authService");
const { isAuth, isGuest } = require("../middleware/authMiddleware");

router.get("/create", isAuth, (req, res) => {
  res.render("post/create");
});

router.post("/create", isAuth, async (req, res) => {
  try {
    let title = req.body.title;
    let keyword = req.body.keyword;
    let location = req.body.location;
    let date = req.body.date;
    let image = req.body.image;
    let description = req.body.description;

    if (
      title === "" ||
      description == "" ||
      image == "" ||
      keyword == "" ||
      location == "" ||
      date == ""
    ) {
      throw new Error("Please fill all the required fields.");
    }

    let inputValidation = postService.postValidation(
      title,
      keyword,
      location,
      date,
      image,
      description
    );
    if (inputValidation == "Title must be at least 6 characters long") {
      throw new Error("Title must be at least 6 characters long.");
    } else if (inputValidation == "Keyword must be at least 6 characters long") {
      throw new Error("Keyword must be at least 6 characters long.");
    } else if (inputValidation == "Location must be 10 characters long") {
      throw new Error("Location must be maximum 10 characters long.");
    } else if (inputValidation == "Date must be 10 characters long") {
      throw new Error("Date must be 10 characters long.");
    } else if (inputValidation == "Description must be at least 20 characters") {
      throw new Error("Description must be at least 20 characters.");
    } else if (inputValidation == "Image URL is invalid") {
      throw new Error("Image URL is invalid.");
    } else {
      await postService.create({
        title,
        keyword,
        location,
        date,
        image,
        description,
        author: req.user._id,
      });

      res.redirect("/post/allPosts");
    }
  } catch (error) {
    res.render("post/create", { error: error.message });
  }
});

router.get("/allPosts", async (req, res) => {
  try {
    let posts = await postService.getAll();

    res.render("post/allPosts", { posts });
  } catch (error) {
    res.render("post/allPosts", { error: error.message });
  }
});

router.get(`/:postId/details`, async (req, res) => {
  try {
    let post = await postService.getOne(req.params.postId);
    let isAuthor = post.author == req.user?._id;
    let postData = await post.toObject();
    let user = await authService.getNames(postData.author);
    let firstName = user.firstName;
    let lastName = user.lastName;
    let isVoted = post.votesOnPost.some((x) => x._id == req.user?._id);
    let peopleWhoVoted = post.peopleWhoVoted();

    res.render(`post/details`, {
      ...postData,
      firstName,
      lastName,
      isAuthor,
      isVoted,
      peopleWhoVoted,
    });
  } catch (error) {
    res.render("post/details", { error: error.message });
  }
});

router.get("/:postId/delete", isAuth, async (req, res) => {
  try {
    let post = await postService.getOne(req.params.postId);

    if (post.author == req.user._id) {
      await postService.delete(req.params.postId);
      res.redirect(`/post/allPosts`);
    } else {
      throw new Error("Only authors can delete");
    }
  } catch (error) {
    let post = await postService.getOne(req.params.postId);
    let isAuthor = post.author == req.user?._id;
    let postData = await post.toObject();
    let user = await authService.getNames(postData.author);
    let firstName = user.firstName;
    let lastName = user.lastName;
    let isVoted = post.votesOnPost.some((x) => x._id == req.user?._id);

    res.render(`post/details`, {
      ...postData,
      firstName,
      lastName,
      isAuthor,
      isVoted,
      error: error.message,
    });
  }
});

router.get("/:postId/edit", isAuth, async (req, res) => {
  try {
    let post = await postService.getOne(req.params.postId);

    if (post.author == req.user?._id) {
      res.render(`post/edit`, { ...post.toObject() });
    } else {
      throw new Error("Only authors can edit.");
    }
  } catch (error) {
    let posts = await postService.getAll();

    res.render(`post/allPosts`, { posts, error: error.message });
  }
});

router.post("/:postId/edit", isAuth, async (req, res) => {
  try {
    let post = await postService.getOne(req.params.postId);
    if (post.author == req.user?._id) {
      let title = req.body.title;
      let keyword = req.body.keyword;
      let location = req.body.location;
      let date = req.body.date;
      let image = req.body.image;
      let description = req.body.description;
      if (
        title === "" ||
        description == "" ||
        image == "" ||
        keyword == "" ||
        location == "" ||
        date == ""
      ) {
        throw new Error("Please fill all the required fields.");
      }
      await postService.updateOne(req.params.postId, req.body);

      res.redirect(`/post/${req.params.postId}/details`);
    } else {
      res.redirect(`/post/${req.params.postId}/details`);
    }
  } catch (error) {
    let post = await postService.getOne(req.params.postId);
    res.render(`post/edit`, { ...post.toObject(), error: error.message });
  }
});

router.get("/myPosts", isAuth, async (req, res) => {
  let userPosts = await postService.userPosts(req.user?._id);

  res.render("post/myPosts", {
    userPosts,
  });
});

router.get("/:postId/upVote", isAuth, async (req, res) => {
  try {
    let post = await postService.getOne(req.params.postId);
    if (post.author != req.user._id) {
      await postService.addUpVote(req.params.postId, req.user._id);

      res.redirect(`/post/${req.params.postId}/details`);
    } else {
      throw new Error("Authors, unregistered or already voted cant vote.");
    }
  } catch (error) {
    let posts = await postService.getAll();

    res.render("post/allPosts", { posts, error: error.message });
  }
});
router.get("/:postId/downVote", isAuth, async (req, res) => {
  try {
    let post = await postService.getOne(req.params.postId);
    if (post.author != req.user._id) {
      await postService.addDownVote(req.params.postId, req.user._id);

      res.redirect(`/post/${req.params.postId}/details`);
    } else {
      throw new Error("Authors, unregistered or already voted cant vote.");
    }
  } catch (error) {
    let posts = await postService.getAll();

    res.render("post/allPosts", { posts, error: error.message });
  }
});

module.exports = router;
