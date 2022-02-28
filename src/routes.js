const router = require("express").Router();

const authController = require("./controllers/authController");
const homeController = require("./controllers/homeController");
const postController = require("./controllers/postController");

router.use(homeController);
router.use("/auth", authController);
router.use("/post", postController);
router.use("*", (req, res) => {
  res.render("404");
});

module.exports = router;
