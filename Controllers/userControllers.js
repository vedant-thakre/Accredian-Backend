import { cloudinaryConnect } from "../Config/cloudinary.js";
import { DB } from "../Database/db.js";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import { ErrorHandler } from "../Middleware/errorHandler.js";

cloudinaryConnect();

export const registerUser = (req, res, next) => {
  const { username, email, password, confirm_password } = req.body;

  if (password !== confirm_password) {
    return ErrorHandler("Password do not match", 400, res);
  }

  let imageurl =
    "https://img.freepik.com/premium-vector/anonymous-user-circle-icon-vector-illustration-flat-style-with-long-shadow_520826-1931.jpg";

  const checkEmailSql = "SELECT * FROM login WHERE email = ?";
  const chekcUsernameSql = "SELECT * FROM login WHERE username = ?";

  // Check if the username already exists
  DB.query(chekcUsernameSql, [username], (err, usernameResults) => {
    if (err) {
      console.error(err);
      return ErrorHandler("Error checking username in the database", 500, res);
    }

    if (usernameResults.length > 0) {
      return ErrorHandler("Username already exists", 400, res);
    }

    // Check if the email already exists
    DB.query(checkEmailSql, [email], (err, emailResults) => {
      if (err) {
        console.error(err);
        return ErrorHandler("Error checking email in the database", 500, res);
      }

      if (emailResults.length > 0) {
        return ErrorHandler("Email already exists", 400, res);
      } else {
        // Proceed with user registration
        if (req.files && req.files.image) {
          cloudinary.uploader.upload(
            req.files.image.tempFilePath,
            (err, result) => {
              if (err) {
                console.error(err);
                return ErrorHandler(
                  "Error uploading image to Cloudinary",
                  500,
                  res
                );
              }
              imageurl = result.secure_url;
              saveUserToDatabase(username, email, password, imageurl, res);
            }
          );
        } else {
          saveUserToDatabase(username, email, password, imageurl, res);
        }
      }
    });
  });
};


const saveUserToDatabase = (username, email, password, imageurl, res) => {
  const saltRounds = 10;
  const sql =
    "INSERT INTO login (`username`, `email`, `password`, `image`) VALUES (?)";

  bcrypt.hash(password.toString(), saltRounds, (err, hash) => {
    if (err) {
      console.error(err);
      return ErrorHandler("Error in hashing the password", 500, res);
    }

    const values = [username, email, hash, imageurl];

    DB.query(sql, [values], (err, result) => {
      if (err) {
        console.error(err);
        return ErrorHandler("Error inserting data into server", 500, res);
      } else {
        return res.status(201).json({
          status: true,
          message: "Registered successfully",
        });
      }
    });
  });
};



export const loginUser = (req, res, next) => {
  const { emailOrUsername, password } = req.body;

  // Check if the input is an email
  const isEmail = emailOrUsername.includes("@");

  let sql;
  let parameter;

  if (isEmail) {
    // If it's an email, use email for the query
    sql = "SELECT * FROM login WHERE email = ?";
    parameter = emailOrUsername;
  } else {
    // If it's a username, use username for the query
    sql = "SELECT * FROM login WHERE username = ?";
    parameter = emailOrUsername;
  }

  DB.query(sql, [parameter], (err, results) => {
    if (err) {
      console.error(err);
      return ErrorHandler("Error in server", 500, res);
    }

    if (results.length !== 0) {
      const user = results[0];
      bcrypt.compare(
        password.toString(),
        user.password,
        (bcryptErr, response) => {
          if (bcryptErr) {
            console.error(bcryptErr);
            return ErrorHandler("Error in server", 500, res);
          }

          if (response) {
            const token = jwt.sign(
              { id: emailOrUsername },
              process.env.JWT_SECRET,
              { expiresIn: "1d" }
            );
            res.cookie('token', token);
            return res.status(201).json({
              status: true,
              message: `Welcome back ${
                emailOrUsername.includes("@")
                  ? emailOrUsername.split("@")[0]
                  : emailOrUsername
              }`,
              token: token,
            });
          } else {
            return ErrorHandler("Password not matched", 400, res);
          }
        }
      );
    } else {
      return ErrorHandler("User not found", 400, res);
    }
  });
};

export const getHomeRoute = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return ErrorHandler("Login First", 401, res);
}

export const getProfile = (req, res, next) => {
  const token = req.cookies.token;
  if(!token)   return ErrorHandler("Login First", 401, res);
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error(err);
      return ErrorHandler("Error verifying token", 401, res);
    }

    console.log(decoded);

    const emailOrUsername = decoded.id;

    console.log(emailOrUsername);

    let sql, parameter;

    if (emailOrUsername.includes("@")) {
      // It's an email
      sql = "SELECT * FROM login WHERE email = ?";
      parameter = emailOrUsername;
    } else {
      // It's a username
      sql = "SELECT * FROM login WHERE username = ?";
      parameter = emailOrUsername;
    }

    DB.query(sql, [parameter], (err, results) => {
      if (err) {
        console.error(err);
        return ErrorHandler("Error fetching user from database", 500, res);
      }

      if (results.length !== 0) {
        const user = results[0];
        return res.status(200).json({
          status: true,
          user: user,
        });
      } else {
        return ErrorHandler("User not found", 404, res);
      }
    });
  });
};



export const deleteUser = (req, res, next) => {
  const { id } = req.params;

  const sql = "DELETE FROM login WHERE id = ?";

  DB.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return ErrorHandler("Error deleting user from server", 500, res);
    }

    if (result.affectedRows > 0) {
      return res.status(200).json({
        status: true,
        message: "User deleted successfully",
      });
    } else {
      return ErrorHandler("User not found or already deleted", 404, res);
    }
  });
};

export const getAllUsers = (req, res) => {
  const q = "SELECT * from login";
  DB.query(q, (err, data) => {
    if (err) {
      console.error(err);
      return ErrorHandler("Error fetching users from server", 500, res);
    }
    return res.status(200).json(data);
  });
};

export const logoutUser = (req, res) => {
    res
      .status(200)
      .cookie("token", "", {
        expires: new Date(Date.now())
      })
      .json({
        success: true,
        message: "Logging out",
        user: req.user,
      });
}
