const jwt = require("jsonwebtoken");
const User = require("../models/User.js");

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return req.cookies?.jwt || null;
};

const attachRequestMetadata = (req) => {
  req.ip =
    req.headers["x-forwarded-for"]?.split(",").shift()?.trim() ||
    req.socket?.remoteAddress ||
    req.ip;
};

const getJwtSecret = () => process.env.JWT_SECRET || "fallback_secret_key";

const resolveAuthenticatedUser = async (req) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return { token: null, user: null, error: "Not authorized, no token" };
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return { token, user: null, error: "Not authorized, user not found" };
    }

    return { token, user, error: null };
  } catch (error) {
    return { token, user: null, error: "Not authorized, token failed" };
  }
};

const protect = async (req, res, next) => {
  const { token, user, error } = await resolveAuthenticatedUser(req);

  if (!token || error) {
    return res.status(401).json({ message: error || "Not authorized" });
  }

  req.user = user;
  attachRequestMetadata(req);
  return next();
};

const optionalAuth = async (req, res, next) => {
  const { user } = await resolveAuthenticatedUser(req);

  if (user) {
    req.user = user;
    attachRequestMetadata(req);
  }

  return next();
};

const auth = protect;

module.exports = {
  auth,
  protect,
  optionalAuth,
};
