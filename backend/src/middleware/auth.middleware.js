import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const token = req.cookies?.token; // ✅ token from cookie

  if (!token) return res.status(401).json({ message: "No token" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { id, role }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
