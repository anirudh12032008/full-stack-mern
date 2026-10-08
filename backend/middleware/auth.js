import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const authenticate = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: "Login required" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Not allowed" });
  }
  next();
};

export const selfOrAdmin = (param) => (req, res, next) => {
  if (req.user.role !== "admin" && req.user.id !== req.params[param]) {
    return res.status(403).json({ success: false, message: "Not allowed" });
  }
  next();
};

export const validIds = (...names) => (req, res, next) => {
  const bad = names.some((name) => {
    const value = req.params[name] ?? req.body?.[name];
    return value !== undefined && !mongoose.isValidObjectId(value);
  });
  if (bad) {
    return res.status(400).json({ success: false, message: "Invalid id" });
  }
  next();
};
