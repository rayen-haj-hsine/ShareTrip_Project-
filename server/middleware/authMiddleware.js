import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (_err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const requireDriver = (req, res, next) => {
  if (!req.user || req.user.role !== "driver") {
    return res.status(403).json({ message: "Only drivers can perform this action" });
  }
  next();
};