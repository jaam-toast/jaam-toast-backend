import mongoose from "mongoose";
import joi from "joi";
import joigoose from "joigoose";

const Joigoose = joigoose(mongoose);

const joiUserSchema = joi.object({
  name: joi.string().required(),
  email: joi.string().email().required(),
});

const userSchema = new mongoose.Schema(Joigoose.convert(joiUserSchema));
const User = mongoose.model("User", userSchema);

export { User, joiUserSchema };
