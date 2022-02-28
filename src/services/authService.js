const jwt = require("../utils/jwt");
const User = require("../models/user");
const { JWT_SECRET } = require("../constants");

exports.login = async ({ email, password }) => {
  try {
    let user = await User.findOne({ email });

    if (!user) {
      throw new Error("Invalid email or password!");
    }

    let isValid = await user.validatePassword(password);

    if (!isValid) {
      throw new Error("Invalid email or password!");
    }

    let payload = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };
    let token = await jwt.sign(payload, JWT_SECRET);

    return token;
  } catch (error) {
    return error;
  }
};

exports.register = (userData) => User.create(userData);

exports.getNames = (userId) => User.findById(userId);
