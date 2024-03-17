import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandle } from "../utils/error.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  const hashPassword = bcryptjs.hashSync(password, 10);
  //   after es6 if the name of the key and value is same then we can write only key
  const newUser = new User({ username, email, password: hashPassword });
  try {
    await newUser.save();
    res.status(201).json({ message: "Signup success" });
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const valdiUser = await User.findOne({ email });
    if (!valdiUser) {
      return next(errorHandle(404, "User not found"));
    }
    const isMatch = bcryptjs.compareSync(password, valdiUser.password);
    if (!isMatch) {
      return next(errorHandle(401, "Invalid username or password"));
    }
    const token = jwt.sign({ id: valdiUser._id }, process.env.JWT_SECRET);
    // bnecause the _doc contains the password and we don't want to send the password to the client
    const { password: hashedPassword, ...rest } = valdiUser._doc;
    const expiryData = new Date(Date.now() + 3600000); // 1 hour
    res
      .cookie("access_token", token, {
        httpOnly: true,
        expires: expiryData,
      })
      .status(200)
      .json({ rest });
  } catch (error) {
    next(error);
  }
};
