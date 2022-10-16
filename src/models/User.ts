import mongoose from "mongoose";
import joi from "joi";

const joigoose = require("joigoose")(mongoose);

const joiUserSchema = joi.object({
  name: joi.string().required(),
  email: joi.string().email().required(),
});

const userSchema = new mongoose.Schema(joigoose.convert(joiUserSchema));
const User = mongoose.model("User", userSchema);

export { User, joiUserSchema };
