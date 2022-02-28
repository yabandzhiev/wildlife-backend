const { AUTH_COOKIE_NAME, JWT_SECRET } = require("../constants");
const jwt = require("../utils/jwt");

exports.auth = function (req, res, next) {
  let token = req.cookies[AUTH_COOKIE_NAME];

  if (token) {
    jwt
      .verify(token, JWT_SECRET)
      .then((decodedToken) => {
        req.user = decodedToken;
        res.locals.user = decodedToken;
        next();
      })
      .catch((err) => {
        res.clearCookie(AUTH_COOKIE_NAME);
        res.redirect("/auth/login");
      });
  } else {
    next();
  }
};

exports.isAuth = function (req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect("/auth/login");
  }
};

exports.isGuest = function (req, res, next) {
  if (!req.user) {
    next();
  } else {
    res.redirect("/");
  }
};
