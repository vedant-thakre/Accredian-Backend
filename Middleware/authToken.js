import jwt from "jsonwebtoken";

export const authToken = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({
      status: false,
      message: "Access denied. Token is missing.",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        status: false,
        message: "Invalid token.",
      });
    }

    req.user = user;
    next();
  });
};
