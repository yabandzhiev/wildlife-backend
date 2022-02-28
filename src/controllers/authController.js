const router = require("express").Router();

const { AUTH_COOKIE_NAME } = require("../constants");
const authService = require("../services/authService");
const { isAuth, isGuest } = require("../middleware/authMiddleware");

router.get("/login", isGuest, (req, res) => {
  res.render("auth/login");
});

router.post("/login", isGuest, async (req, res) => {
  try {
    const { email, password } = req.body;

    let token = await authService.login({ email, password });

    res.cookie(AUTH_COOKIE_NAME, token);

    res.redirect("/");
  } catch (error) {
    res.render("auth/login", { error: error });
  }
});

router.get("/register", isGuest, (req, res) => {
  res.render("auth/register");
});

router.post("/register", isGuest, async (req, res) => {
  try {
    const { firstName, lastName, email, password, repeatPassword } = req.body;

    if (password !== repeatPassword) {
      throw new Error("Passwords mismatch!");
    }

    await authService.register({
      firstName,
      lastName,
      email,
      password,
    });

    res.redirect("/auth/login");
  } catch (error) {
    res.render("auth/register", { error: error.message });
  }
});

router.get("/logout", isAuth, (req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME);

  res.redirect("/");
});

module.exports = router;
