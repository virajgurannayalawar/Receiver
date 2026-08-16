// backend\src\middleware\jwtAuth.js

import jwt from 'jsonwebtoken';

export const jwtAuth = async (req, res, next) => {


  try {
    const secretKey = process.env.JWT_SECRET;
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }
    const decoded = await jwt.verify(token, secretKey);
    if (decoded) {

      req.user = decoded
      next();
    }


  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      });
      return res.status(401).json({ message: "session expired" });
    } else {
      console.log("❌ Invalid token signature or malformed token.", error);
      return res.status(401).json({ message: "session expired" });
    }
  }
}
