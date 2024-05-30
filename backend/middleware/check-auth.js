const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
  let token;
  try {
    token = req.headers.authorization.split(" ")[1];
    if (!token) {
      throw new Error("Authentication failed!");
    }
  } catch (err) {
    const error = new HttpError("Authentication failed!", 401);
    return next(error);
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "supersecret_dont_share");
  } catch (err) {
    const error = new HttpError("Authentication failed!", 401);
    return next(error);
  }
  req.userData = { userId: decodedToken.userId };
  next();
};
