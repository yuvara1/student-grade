const db = require("../config/db");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { JWT_KEY } = process.env;

exports.protected = async (req, res, next) => {
  try {
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer")
    ) {
      return res.status(401).json({
        success: false,
        message: "User is not authorized",
      });
    }

    if (!JWT_KEY) {
      return res.status(500).json({
        success: false,
        message: "Server JWT configuration missing",
      });
    }

    let token = req.headers.authorization.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_KEY);
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    let userId = decoded.userId;
    try {
      let [rows] = await db.query("SELECT * FROM Users WHERE userId = ?", [
        userId,
      ]);
      if (rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: "User is not authorized",
        });
      }
      req.user = rows[0];
      next();
    } catch (error) {
      console.error("protected middleware DB error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  } catch (error) {
    console.error("protected middleware error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
